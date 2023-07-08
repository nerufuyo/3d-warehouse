import axios from 'axios';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';

import Loading from 'components/Loading';

import { useWebSettings } from 'contexts/webSettings';

import { APIResponse } from 'types/apiResponse';
import { SheetPartner } from 'types/spreadsheets/partners';

export default function Footer() {
  const settings = useWebSettings();
  const [partners, setPartners] = useState<SheetPartner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    axios.get<APIResponse<SheetPartner[]>>('/api/partners').then((data) => {
      setPartners(data.data.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <footer className='w-full flex flex-col items-center justify-center gap-4'>
      <div
        className={
          'w-full flex flex-col gap-1 items-center justify-center text-sm px-4 py-2 text-red-500'
        }
      >
        <span>
          We <b>don&apos;t host any of the files</b> on our server.
        </span>
        <span>
          Files in the archive are for <b>informational purposes</b> only!
        </span>
        <span>
          All the content provided in this site is <b>non-commercial</b> use
          only.
        </span>
      </div>
      <div className='flex flex-col items-center justify-center gap-2 my-4'>
        <span className='text-lg font-bold'>Partners</span>
        {isLoading ? (
          <div className={'w-full flex items-center justify-center'}>
            <Loading />
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 place-items-center w-full gap-x-8 gap-y-2 md:gap-x-4'>
            {partners.map((partner, index) => (
              <Fragment key={`partner-${partner.name}@${index}`}>
                {partner.link ? (
                  <Link
                    href={partner.link}
                    target='_blank'
                    className='flex flex-col items-center justify-center text-sm text-center opacity-90 hover:opacity-100 transition-opacity'
                  >
                    <img
                      src={partner.banner}
                      alt={partner.name}
                      width={128}
                      height={64}
                      className='rounded-lg border border-zinc-800'
                      loading={'lazy'}
                    />
                    <span>{partner.name}</span>
                  </Link>
                ) : (
                  <div className='flex flex-col items-center justify-center text-sm text-center opacity-90 hover:opacity-100 text-zinc-200/80 hover:text-zinc-50 transition'>
                    <img
                      src={partner.banner}
                      alt={partner.name}
                      width={128}
                      height={64}
                      className='rounded-lg border border-zinc-800'
                      loading={'lazy'}
                    />
                    <span>{partner.name}</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
        <Link
          href='/contact'
          className='text-sm'
        >
          Want to be our partner? Contact us!
        </Link>
      </div>

      <div className='text-sm text-zinc-50 bg-black border-t border-zinc-500 w-full py-1 text-center flex flex-col'>
        <span>
          {new Date().getFullYear()} - {settings.siteName}
        </span>
      </div>
    </footer>
  );
}
