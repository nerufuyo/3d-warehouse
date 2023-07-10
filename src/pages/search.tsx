import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';

import Content from 'components/Content';
import Hero from 'components/Hero';
import Loading from 'components/Loading';
import Pagination from 'components/Pagination';

import generateOpenGraph from 'utils/generateOpenGraph';

import { APIResponse } from 'types/apiResponse';
import { SheetContent } from 'types/spreadsheets/contents';

type Props = {
  keyword: string;
  page: number;
};
export default function PageSearch({ keyword: queryKeyword, page }: Props) {
  const router = useRouter();

  const [keyword, setKeyword] = useState<string>(queryKeyword);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(page);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isNextPage, setIsNextPage] = useState<boolean>(false);
  const [isPrevPage, setIsPrevPage] = useState<boolean>(false);

  const [contents, setContents] = useState<SheetContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    axios
      .get<APIResponse<SheetContent[]>>('/api/data/search', {
        params: {
          keyword: keyword,
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
  }, []);

  const paginationHandle = async (page: number) => {
    setIsLoading(true);
    await router.replace({
      query: {
        keyword: keyword,
        page: page,
      },
    });

    const data = await axios.get<APIResponse<SheetContent[]>>(
      '/api/data/search',
      {
        params: {
          keyword: keyword,
          page: page,
        },
      },
    );

    setContents(data.data.data ?? []);
    if (data.data.pagination) {
      setCurrentPage(data.data.pagination.currentPage);
      setIsNextPage(data.data.pagination.isNextPage);
      setIsPrevPage(data.data.pagination.isPrevPage);
      setTotalItems(data.data.pagination.totalItems);
      setTotalPages(data.data.pagination.totalPages);
    }

    setIsLoading(false);
  };
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword) {
      setContents([]);
      setCurrentPage(1);
      setIsNextPage(false);
      setIsPrevPage(false);
      setTotalItems(0);
      setTotalPages(1);
    }

    await paginationHandle(1);
  };

  const seo = generateOpenGraph(
    keyword ? `Searching for ${keyword}` : `Search`,
  );

  return (
    <>
      <NextSeo {...seo} />
      <Hero
        image={'/img/hero/2.webp'}
        title={'Search'}
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
                <strong>{keyword}</strong>.
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
  const {
    keyword,
    page,
  }: Partial<{
    keyword: string;
    page: string;
  }> = context.query;

  if (!keyword) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      keyword,
      page: page ? parseInt(page as string) : 1,
    },
  };
}
