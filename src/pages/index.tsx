import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { MdSearch } from 'react-icons/md';

import Content from 'components/Content';
import Hero from 'components/Hero';

import { useWebSettings } from 'contexts/webSettings';
import googleSpreadsheets from 'utils/googleSpreadsheets';

import { SheetContent } from 'types/spreadsheets/contents';
import { EnumSheets } from 'types/spreadsheets/enum';
import { SheetPages } from 'types/spreadsheets/pages';

type Props = {
  latestContents: SheetContent[];
};
export default function PageHome({ latestContents }: Props) {
  const settings = useWebSettings();
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const keyword = e.currentTarget.keyword.value;
    if (!keyword) return;
    router.push(`/search?keyword=${keyword}`);
  };
  return (
    <>
      <Hero
        key={`hero-${router.asPath}`}
        image={'/img/hero/4.webp'}
        title={settings.siteName}
      />

      <div className={'px-4 md:px-8 w-full max-w-screen-xl mx-auto py-4'}>
        <section
          id={'search'}
          className={
            'flex flex-col items-center justify-center relative max-w-lg gap-2 w-full -top-8 mx-auto'
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
            />
            <button
              type={'submit'}
              className={'rounded-full flex items-center justify-center'}
            >
              <MdSearch size={24} />
              Search
            </button>
          </form>
          <div className={'w-full flex gap-4 px-4 items-center'}>
            <div className={'w-full h-px bg-zinc-500'} />
            <span className={'text-gray-500'}>OR</span>
            <div className={'w-full h-px bg-zinc-500'} />
          </div>
          <Link
            href={'/3d'}
            className={'w-full active'}
          >
            <button className={'bg-zinc-50 text-black rounded-full w-full'}>
              <span className={'text-xl font-bold'}>Browse 3D Models</span>
            </button>
          </Link>
        </section>

        <section
          id={'latest'}
          className={
            'grid w-full grid-cols-1 md:grid-cols-4 gap-4 mx-auto my-4'
          }
        >
          <h3 className={'col-span-full my-2'}>Latest Models</h3>
          <>
            {latestContents.map((content) => (
              <Content
                content={content}
                key={`latest-${content.id}`}
              />
            ))}
          </>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  await googleSpreadsheets.loadInfo();
  const contentsSheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Content];
  const pagesSheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Pages];

  const getContentRows = contentsSheet.getRows();
  const getPagesRows = pagesSheet.getRows();

  const [contentRows, pagesRows] = await Promise.all([
    getContentRows,
    getPagesRows,
  ]);

  const pages: SheetPages[] = pagesRows
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
    .filter((row) => row !== undefined) as SheetPages[];

  const data: SheetContent[] = contentRows
    .map((row) => {
      const object = row.toObject();
      if (
        !object.ID ||
        !object.Name ||
        !object.PageKey ||
        !object.Brand ||
        !object.Format ||
        !object.Download ||
        !object.Image ||
        !object.Date ||
        !object.Uploader
      )
        return undefined;
      const pagesData = pages.find((page) => page.key === object.PageKey);
      if (!pagesData) return undefined;

      return {
        id: object.ID,
        pageKey: object.PageKey,
        name: object.Name,
        brand: object.Brand,
        format:
          object.Format.split(',').map((format: string) => format.trim()) ?? [],
        download: object.Download,
        image: object.Image,
        date: object.Date,
        uploader: object.Uploader,
        pages: pagesData,
      };
    })
    .filter((row) => row !== undefined)
    .sort((a, b) => b?.id - a?.id) as SheetContent[];

  return {
    props: {
      latestContents: data.slice(0, 4),
    },
  };
}
