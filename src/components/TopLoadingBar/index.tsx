import { useNProgress } from '@tanem/react-nprogress';

type Props = {
  isRouteChanging: boolean;
};

export default function TopLoadingBar({ isRouteChanging }: Props) {
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating: isRouteChanging,
  });

  return (
    <>
      <style jsx>{`
        .container {
          transition: opacity ${animationDuration}ms linear;
        }
        .bar {
          margin-left: ${(-1 + progress) * 100}%;
          transition: margin-left ${animationDuration}ms linear;
        }
      `}</style>
      <div
        className={`container pointer-events-none ${
          isFinished ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={'bg-blue-500 bar fixed left-0 top-0 z-[10001] h-1 w-full'}
        />
      </div>
    </>
  );
}
