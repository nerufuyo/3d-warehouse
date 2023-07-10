import axios from 'axios';
import { NextSeo, NextSeoProps } from 'next-seo';
import type { AppProps } from 'next/app';
import { Exo_2 } from 'next/font/google';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

import Footer from 'components/Footer';
import Loading from 'components/Loading';
import Navbar from 'components/Navbar';
import TopLoadingBar from 'components/TopLoadingBar';

import { WebSettingsProvider } from 'contexts/webSettings';

import { APIResponse } from 'types/apiResponse';
import { SheetSettings } from 'types/spreadsheets/settings';

import 'styles/globals.css';
import 'styles/nprogress.css';

const exo2 = Exo_2({ subsets: ['latin', 'latin-ext'] });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isGlobalLogin, setIsGlobalLogin] = useState<boolean>(false);
  const [seoProps, setSeoProps] = useState<NextSeoProps>({
    titleTemplate: '%s | 3D Warehouse',
    defaultTitle: '3D Warehouse',
    description: 'From a group of people that hated content behind a paywall',
    openGraph: {
      title: '3D Warehouse',
      description: 'From a group of people that hated content behind a paywall',
      url:
        process.env.NEXT_PUBLIC_VERCEL_URL ?? 'https://3d-warehouse.vercel.app',
      siteName: '3D Warehouse',
      images: [
        {
          url: `/img/og-image.webp`,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  });
  const [webSettings, setWebSettings] = useState<SheetSettings>({
    siteName: '',
    siteDescription: '',
    titleTemplate: '',
  });
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [routeChange, setRouteChange] = useState({
    isRouteChanging: false,
    loadingKey: 0,
  });

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setRouteChange({
        isRouteChanging: true,
        loadingKey: routeChange.loadingKey ^ 1,
      });
    };
    const handleRouteChangeComplete = () => {
      setRouteChange((r) => ({
        isRouteChanging: false,
        loadingKey: r.loadingKey,
      }));
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events]);

  useEffect(() => {
    setIsLoading(true);

    // get cookies with name "contributor_globalPassword"
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    const globalPasswordCookie = cookies.find((cookie) =>
      cookie.startsWith('contributor_globalPassword='),
    );
    const globalPasswordValue = globalPasswordCookie?.split('=')[1];

    if (globalPasswordCookie && globalPasswordValue === '1') {
      setIsGlobalLogin(true);
    } else {
      setIsGlobalLogin(false);
    }
    const getMaintenance = axios.get<APIResponse<boolean>>('/api/maintenance', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const getSettings = axios.get<APIResponse<SheetSettings>>('/api/settings');

    Promise.all([getMaintenance, getSettings])
      .then((data) => {
        const [maintenance, settings] = data;
        setIsMaintenance(maintenance.data.data);
        setWebSettings(settings.data.data);
        setSeoProps({
          titleTemplate: settings.data.data.titleTemplate.replace(
            '{{siteName}}',
            settings.data.data.siteName,
          ),
          defaultTitle: settings.data.data.siteName,
          description: settings.data.data.siteDescription ?? '',
          openGraph: {
            title: settings.data.data.siteName,
            description: settings.data.data.siteDescription ?? '',
            url: process.env.NEXT_PUBLIC_VERCEL_URL ?? '',
            siteName: settings.data.data.siteName,
            images: [
              {
                url: `${process.env.NEXT_PUBLIC_VERCEL_URL}/img/og-image.png`,
                width: 1200,
                height: 630,
              },
            ],
            type: 'website',
          },
          twitter: {
            cardType: 'summary_large_image',
          },
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <TopLoadingBar
        isRouteChanging={routeChange.isRouteChanging}
        key={routeChange.loadingKey}
      />
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            strategy={'lazyOnload'}
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
          />
          <Script
            id={'ga-analytics'}
          >{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}  gtag('js', new Date());  gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');`}</Script>
        </>
      )}

      <NextSeo {...seoProps} />
      {isLoading && (
        <main
          className={
            'w-full min-h-screen max-h-screen overflow-hidden flex items-center justify-center transition-all'
          }
        >
          <Loading />
        </main>
      )}
      {isMaintenance && !isGlobalLogin && (
        <>
          <NextSeo
            {...seoProps}
            title={'Maintenance'}
          />
          <main
            className={
              'w-full transition-all min-h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center gap-8 md:gap-4 text-center px-8'
            }
          >
            <h1>Website Under Maintenance</h1>
            <p>
              We are currently working on the website, please come back later.
            </p>

            <div
              className={
                'flex flex-col absolute bottom-16 gap-2 left-auto right-auto px-4 md:px-8'
              }
            >
              <span className={'text-sm'}>
                If you are contributor, please input global password to access
                the website.
              </span>
              <form
                className={'flex items-center gap-2'}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginError('');
                  setLoginLoading(true);
                  try {
                    const res = await axios.post<APIResponse<boolean>>(
                      'api/verify',
                      {
                        password: (e.target as any).password.value,
                      },
                    );

                    if (res.status !== 200)
                      throw new Error(
                        res.data?.error?.message || 'Unknown error',
                      );

                    router.reload();
                  } catch (error: any) {
                    setLoginError(error.message);
                    if (error.response.data.error) {
                      setLoginError(error.response.data.error.message);
                    }
                  } finally {
                    setLoginLoading(false);
                  }
                }}
              >
                <input
                  type={'password'}
                  id={'password'}
                  name={'password'}
                  disabled={loginLoading}
                  placeholder={'You know the password, right?'}
                  className={'w-full'}
                />
                <button
                  type={'submit'}
                  disabled={loginLoading}
                  className={'flex items-center justify-center'}
                >
                  {loginLoading ? (
                    <ReactLoading
                      type={'spin'}
                      width={24}
                      height={24}
                    />
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              <span className={'text-sm text-red-500'}>{loginError}</span>
            </div>
          </main>
        </>
      )}
      {!isLoading && (!isMaintenance || (isMaintenance && isGlobalLogin)) && (
        <WebSettingsProvider value={webSettings}>
          <div
            className={`${exo2.className} w-full min-h-screen flex flex-col`}
          >
            <Navbar />
            <main
              id={'wrapper'}
              className={`flex flex-col w-full h-full flex-1 gap-4 mx-auto relative`}
            >
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </WebSettingsProvider>
      )}
    </>
  );
}
