import Link from 'next/link';
import { MdDownload } from 'react-icons/md';

import capitalize from 'utils/capitalize';
import formatDate from 'utils/formatDate';

import { SheetContent } from 'types/spreadsheets/contents';

type Props = {
  content: SheetContent;
};

export default function Content({ content }: Props) {
  const redirectPage = `/redirect?url=${content.download}&name=${content.name}&key=${content.pages.name}`;

  return (
    <div
      className={
        'w-full flex flex-col h-fit border rounded-lg overflow-hidden border-zinc-500 relative'
      }
    >
      <img
        src={content.image}
        alt={content.name}
        className={
          'w-full h-48 object-cover cursor-pointer hover:scale-105 hover:opacity-100 opacity-75 transition-all'
        }
        title={capitalize(content.name)}
        loading={'lazy'}
        onClick={() => window.open(content.image, '_blank')}
      />
      <div className={'py-1 px-2 flex flex-col w-full gap-1'}>
        <h5
          className={'my-1 text-center line-clamp-1'}
          title={capitalize(content.name)}
        >
          {capitalize(content.name)}
        </h5>
        <div className={'flex flex-col gap-1 w-full text-sm items-center'}>
          <Link
            href={`/search?keyword=${content.brand.toLowerCase()}`}
            className={
              'w-full flex items-center justify-center py-0.5 text-center'
            }
            title={`Search ${capitalize(content.brand)}`}
          >
            {capitalize(content.brand)}
          </Link>
          <Link
            href={`/3d/${content.pageKey.toLowerCase()}`}
            className={
              'w-full flex items-center justify-center py-0.5 text-center'
            }
            title={`Browse ${capitalize(content.pages.name)}`}
          >
            {capitalize(content.pages.name)}
          </Link>
        </div>
        <Link
          href={redirectPage.toString()}
          className={'w-full active my-2'}
        >
          <button
            className={
              'w-full bg-blue-600 flex items-center justify-center gap-2'
            }
          >
            <MdDownload size={18} />
            Download
          </button>
        </Link>
        <div
          className={'flex gap-2 items-center w-full text-sm my-1 select-none'}
        >
          {content.format.map((format, index) => (
            <span
              key={index}
              className={
                'px-1 w-full text-center py-0.5 bg-orange-600 rounded-full'
              }
            >
              {capitalize(format)}
            </span>
          ))}
        </div>
        <span className={'text-xs text-zinc-500 select-none'}>
          Uploaded by {content.uploader} at {formatDate(new Date(content.date))}
        </span>
      </div>
    </div>
  );
}
