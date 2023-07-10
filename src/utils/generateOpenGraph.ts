import { NextSeoProps } from 'next-seo';

export default function generateOpenGraph(
  title: string,
  description?: string,
  url?: string,
  image?: string,
): NextSeoProps {
  return {
    title,
    description:
      description ??
      'From a group of people that hated content behind a paywall',
    openGraph: {
      title,
      description:
        description ??
        'From a group of people that hated content behind a paywall',
      url:
        url ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        'https://3d-warehouse.vercel.app',
      siteName: `${title} | 3D Warehouse`,
      images: [
        {
          url: image ?? 'https://3d-warehouse.vercel.app/images/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  };
}
