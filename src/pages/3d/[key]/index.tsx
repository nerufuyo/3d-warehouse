import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';

import Content from 'components/Content';
import Hero from 'components/Hero';
import Loading from 'components/Loading';
import Pagination from 'components/Pagination';

import generateOpenGraph from 'utils/generateOpenGraph';
import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse } from 'types/apiResponse';
import { SheetContent } from 'types/spreadsheets/contents';
import { EnumSheets } from 'types/spreadsheets/enum';
import { SheetPages } from 'types/spreadsheets/pages';

type Props = {
  pageData: SheetPages;
  keyword: string;
  page: number;
  seo: NextSeoProps;
};
export default function PageKey({
  pageData,
  keyword: qKeyword,
  page: qPage,
  seo,
}: Props) {
  const router = useRouter();

  const [keyword, setKeyword] = useState<string>(qKeyword);
  const [searchKeyword, setSearchKeyword] = useState<string>(qKeyword);
  const [currentPage, setCurrentPage] = useState<number>(qPage);
  const [totalPages, setTotalPages] = useState<number>(qPage);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isNextPage, setIsNextPage] = useState<boolean>(false);
  const [isPrevPage, setIsPrevPage] = useState<boolean>(false);

  const [contents, setContents] = useState<SheetContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    axios
      .get<APIResponse<SheetContent[]>>(`/api/data/${pageData.key}`, {
        params: {
          key: pageData.key,
          keyword: searchKeyword,
          page: currentPage,
        },
      })
      .then((data) => {
        setContents(data.data.data ?? []);
        if (data.data.pagination) {
          setCurrentPage(data.data.pagination.currentPage);
          setIsNextPage(data.data.pagination.isNextPage);
          setIsPrevPage(data.data.pagination.isPrevPage);
          setTotalItems(data.data.pagination.totalItems);
          setTotalPages(data.data.pagination.totalPages);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, currentPage]);

  const paginationHandle = async (pageNumber: number, formKeyword?: string) => {
    setIsLoading(true);
    setSearchKeyword(formKeyword ?? '');
    setCurrentPage(pageNumber);
    await router.replace({
      query: {
        key: pageData.key,
        keyword: formKeyword ?? '',
        page: pageNumber,
      },
    });
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = (e.target as any).keyword.value;

    await paginationHandle(1, keyword);
  };

  return (
    <>
      <NextSeo {...seo} />
      <Hero
        randomImage={!pageData.image}
        image={pageData.image ?? '/img/hero/1.webp'}
        title={pageData.name}
      />

      <div className={'px-4 md:px-8 w-full max-w-screen-xl mx-auto py-4'}>
        <section
          id={'search-form'}
          className={
            'flex flex-col items-center justify-center relative max-w-xl gap-2 w-full mx-auto -top-8 text-center'
          }
        >
          <form
            className={'w-full flex items-center justify-center gap-2'}
            onSubmit={handleSearch}
          >
            <input
              type={'text'}
              id={'keyword'}
              name={'keyword'}
              placeholder={'Search...'}
              className={'w-full'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              type={'submit'}
              className={'rounded-full flex items-center justify-center'}
            >
              <MdSearch size={24} />
              Search
            </button>
          </form>
        </section>

        <section
          id={'search-contents'}
          className={
            'grid grid-cols-1 md:grid-cols-4 max-w-screen-lg place-items-center gap-4 w-full mx-auto my-4'
          }
        >
          {isLoading ? (
            <div className={'col-span-full'}>
              <Loading />
            </div>
          ) : (
            <>
              <span className={'col-span-full w-full rounded-lg text-center'}>
                We found <strong>{totalItems}</strong> results for{' '}
                <strong>{searchKeyword ? searchKeyword : pageData.name}</strong>
                .
              </span>
              {contents.length > 0 ? (
                <>
                  {contents.map((content, index) => (
                    <Content
                      content={content}
                      key={`search-content-${index}`}
                    />
                  ))}
                </>
              ) : (
                <div className={'col-span-full'}>
                  <p className={'text-center text-gray-500'}>
                    No results found.
                  </p>
                </div>
              )}

              {isNextPage || isPrevPage ? (
                <div
                  className={'col-span-full flex items-center justify-center'}
                >
                  <Pagination
                    currentPage={currentPage}
                    totalPage={totalPages}
                    isNextPage={isNextPage}
                    isPrevPage={isPrevPage}
                    onPageChange={paginationHandle}
                  />
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const keyParams = context.params?.key;
  const {
    keyword,
    page,
  }: Partial<{
    keyword: string;
    page: string;
  }> = context.query;
  if (!keyParams) {
    return {
      notFound: true,
    };
  }

  await googleSpreadsheets.loadInfo();
  const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Pages];
  const rows = await sheet.getRows();

  const data: SheetPages[] = rows
    .map((row) => {
      const object = row.toObject();
      if (!object.Key || !object.Name) return undefined;

      return {
        key: object.Key,
        name: object.Name,
        description: object.Description ?? null,
        image: object.Image ?? null,
      };
    })
    .filter((value) => value !== undefined) as SheetPages[];

  const pageData = data.find((page) => page.key === keyParams);
  if (!pageData) {
    return {
      notFound: true,
    };
  }

  const seo = generateOpenGraph(
    pageData.name,
    pageData.description ?? undefined,
    `${process.env.NEXT_PUBLIC_VERCEL_URL}/3d/${pageData.key}`,
    pageData.image ?? undefined,
  );

  return {
    props: {
      pageData,
      keyword: keyword ?? '',
      page: page ? parseInt(page as string) : 1,
      seo,
    },
  };
}
