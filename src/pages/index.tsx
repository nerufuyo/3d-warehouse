import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { MdSearch } from 'react-icons/md';

import Content from 'components/Content';
import Hero from 'components/Hero';

import { useWebSettings } from 'contexts/webSettings';

import { APIResponse, HttpError } from 'types/apiResponse';
import { SheetContent } from 'types/spreadsheets/contents';

type Props = {
  latestContents: SheetContent[];
};
export default function PageHome({ latestContents }: Props) {
  const settings = useWebSettings();
  const router = useRouter();

  // const [latestContents, setLatestContents] = useState<SheetContent[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  //
  // useEffect(() => {
  //   setIsLoading(true);
  //
  //   axios.get<APIResponse<SheetContent[]>>('/api/data/latest').then((data) => {
  //     setLatestContents(data.data.data);
  //     setIsLoading(false);
  //   });
  // }, []);

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
          {/*{isLoading ? (*/}
          {/*  <div className={'col-span-full flex items-center justify-center'}>*/}
          {/*    <Loading />*/}
          {/*  </div>*/}
          {/*) : (*/}
          <>
            {latestContents.map((content) => (
              <Content
                content={content}
                key={`latest-${content.id}`}
              />
            ))}
          </>
          {/*)}*/}
        </section>
      </div>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const data = await axios.get<APIResponse<SheetContent[]>>(
    '/api/data/latest',
    {
      baseURL: process.env.VERCEL_URL,
    },
  );
  if (data.data.error) {
    throw new HttpError(data.data.error.message, 500);
  }

  return {
    props: {
      latestContents: data.data.data,
    },
  };
}
