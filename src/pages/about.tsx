import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';

import Hero from 'components/Hero';

import { APIResponse, HttpError } from 'types/apiResponse';
import { SheetContributor } from 'types/spreadsheets/contributors';

type Props = {
  contributors: SheetContributor[];
};

export default function PageAbout({ contributors }: Props) {
  const router = useRouter();

  return (
    <>
      <Hero
        key={`hero-${router.asPath}`}
        image={'/img/hero/4.webp'}
        title={'About us'}
      />

      <div className={'px-4 md:px-8 w-full max-w-screen-xl mx-auto py-4'}>
        <section
          id={'about-us'}
          className={
            'flex flex-col items-center justify-center relative max-w-xl gap-2 w-full mx-auto -top-8 text-center'
          }
        >
          <h3>From a group of people that hated content behind a paywall.</h3>
          <p>We decided to make a website that is free for everyone to use.</p>
        </section>

        <section
          id={'contributors'}
          className={
            'grid grid-cols-2 md:grid-cols-4 max-w-screen-lg place-items-center gap-4 w-full mx-auto my-4'
          }
        >
          <h3 className={'col-span-full w-full'}>Contributors</h3>
          <>
            {contributors.map((contributor, index) => {
              const nameInitials = contributor.name
                .split(' ')
                .map((name) => name[0]);
              const maxLength = 2;
              const nameInitial =
                nameInitials.length > maxLength
                  ? nameInitials.slice(0, maxLength).join('')
                  : nameInitials.join('');
              return (
                <div
                  key={contributor.name}
                  className={'flex flex-col items-center justify-center gap-2'}
                >
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className={
                        'rounded-full w-24 h-24 mx-auto border border-zinc-500'
                      }
                    />
                  ) : (
                    <div
                      className={
                        'rounded-full w-24 h-24 mx-auto text-4xl flex items-center justify-center border border-zinc-500'
                      }
                    >
                      {nameInitial}
                    </div>
                  )}
                  <h6 className={'w-full text-center'}>{contributor.name}</h6>
                </div>
              );
            })}
          </>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const data = await axios.get<APIResponse<SheetContributor[]>>(
    '/api/contributors',
    {
      baseURL: process.env.VERCEL_URL,
    },
  );
  if (data.data.error) {
    throw new HttpError(data.data.error.message, 500);
  }

  return {
    props: {
      contributors: data.data.data,
    },
  };
}
