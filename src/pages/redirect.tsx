import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

type Props = {
  url: string;
  name: string;
  pageKey: string;
};
export default function PageRedirect({ url, name, pageKey }: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (process.env.NODE_ENV !== 'development') {
        router.push(url);
      }
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NextSeo title={`Redirecting to ${name} download page`} />
      <div
        className={
          'flex flex-col items-center justify-center w-full px-4 md:px-8 flex-1'
        }
      >
        <h1 className={'text-2xl md:text-4xl font-bold'}>
          Redirecting to download page
        </h1>

        <span className={'text-center'}>
          Redirecting to{' '}
          <span className={'font-bold'}>
            {pageKey} - {name}
          </span>{' '}
          download page in 5 seconds...
        </span>

        <div className={'flex flex-col gap-2 my-8'}>
          <span className={'text-gray-500'}>
            If you are not redirected automatically, follow this link:
          </span>
          <a
            href={url}
            className={
              'w-full text-start px-2 py-1 rounded-lg bg-zinc-700 text-blue-400/75 hover:text-blue-400 active transition-all'
            }
          >
            {url}
          </a>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({
  query,
}: {
  query: { url: string; name: string; key: string };
}) {
  const { url, name, key } = query;
  if (!url || !name || !key)
    return {
      notFound: true,
    };
  const isValidURL = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url);
  if (!isValidURL)
    return {
      notFound: true,
    };

  return {
    props: {
      url: url,
      name: name,
      pageKey: key,
    },
  };
}
