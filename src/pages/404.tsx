import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import generateOpenGraph from 'utils/generateOpenGraph';

export default function Custom404() {
  const router = useRouter();

  const seo = generateOpenGraph(
    '404 Not Found',
    'The page you are looking for is not found.',
  );
  return (
    <>
      <NextSeo {...seo} />
      <main
        className={
          'w-full h-full flex-1 flex flex-col items-center justify-center gap-8 md:gap-4 text-center px-8'
        }
      >
        <h1>404 Not Found</h1>
        <p>The page you are looking for is not found.</p>
        <div className={'w-full flex items-center justify-center gap-4'}>
          <button onClick={() => router.back()}>Go Back</button>

          <button
            type={'submit'}
            onClick={() => router.push('/')}
          >
            Go Home
          </button>
        </div>
      </main>
    </>
  );
}
