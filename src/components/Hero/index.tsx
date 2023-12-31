import { useEffect, useState } from 'react';

type Props = {
  randomImage?: boolean;
  image: string;
  title: string;
};

export default function Hero({ randomImage = true, image, title }: Props) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const totalImages: number = 6;

  useEffect(() => {
    if (randomImage) {
      setImageSrc(getRandomHeroImage());
    } else {
      setImageSrc(image);
    }
  }, [image, randomImage]);

  function getRandomHeroImage(): string {
    const path = '/img/hero/{index}.webp';
    const index = Math.floor(Math.random() * totalImages) + 1;
    return path.replace('{index}', index.toString());
  }

  return (
    <section
      id={'hero'}
      className={'w-full h-32 md:h-64 grid place-items-center relative mb-4'}
    >
      <img
        src={imageSrc}
        alt={title}
        loading={'lazy'}
        className={
          'h-full max-w-screen-lg w-full object-cover opacity-50 absolute'
        }
      />
      <div
        className={
          'w-full h-full max-w-screen-lg   bg-gradient-to-r from-black via-transparent to-black absolute'
        }
      />
      <div
        className={
          'w-full h-full bg-gradient-to-t from-black to-transparent absolute'
        }
      />
      <h1 className={'relative z-10 w-full text-center'}>{title}</h1>
    </section>
  );
}
