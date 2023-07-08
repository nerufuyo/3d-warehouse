import Link from 'next/link';
import { useEffect, useState } from 'react';

import Hero from 'components/Hero';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { EnumSheets } from 'types/spreadsheets/enum';
import { SheetPages } from 'types/spreadsheets/pages';

type Props = {
  pages: SheetPages[];
};
export default function Page3D({ pages: initialPages }: Props) {
  const [pages, setPages] = useState<SheetPages[]>(initialPages);
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');

  useEffect(() => {
    if (!keyword) {
      setDebouncedKeyword('');
      return;
    }
    const timeoutId = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 150);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [keyword]);

  useEffect(() => {
    const filteredPages = initialPages.filter((page) => {
      return page.name.toLowerCase().includes(debouncedKeyword.toLowerCase());
    });
    setPages(filteredPages);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <>
      <Hero
        image={'/img/hero/1.webp'}
        title={'Model Sources'}
      />

      <div className={'px-4 md:px-8 w-full max-w-screen-xl mx-auto py-4'}>
        <section
          id={'filter'}
          className={
            'flex flex-col items-center justify-center relative max-w-xl gap-2 w-full mx-auto -top-8 text-center'
          }
        >
          <h3>Filter sources</h3>
          <input
            type={'text'}
            id={'keyword'}
            name={'keyword'}
            placeholder={'Input keyword...'}
            className={'w-full'}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </section>

        <section
          id={'pages'}
          className={
            'grid grid-cols-2 w-full mx-auto md:grid-cols-4 max-screen-lg place-items-center gap-4 my-4'
          }
        >
          {pages.map((page) => (
            <Link
              href={`/3d/${page.key}`}
              key={page.key}
              className={
                'w-full flex flex-col h-fit border rounded-lg overflow-hidden border-zinc-500 relative'
              }
            >
              <img
                src={page.image ?? '/img/no-cover.webp'}
                alt={page.name}
                loading={'lazy'}
                className={'w-full h-32 md:h-64 object-cover'}
              />
              <div className={'w-full py-1 px-2 flex flex-col gap-1'}>
                <h4 className={'my-2 text-center'}>{page.name}</h4>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
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
  return {
    props: {
      pages: data,
    },
  };
}
