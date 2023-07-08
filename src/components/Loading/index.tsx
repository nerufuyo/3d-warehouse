import ReactLoading from 'react-loading';

type Props = {
  message?: string;
};
export default function Loading({ message = 'Loading...' }: Props) {
  return (
    <div className={'flex items-center gap-2'}>
      <ReactLoading
        type={'spin'}
        width={18}
        height={18}
        className={'text-white'}
      />
      <span>Loading...</span>
    </div>
  );
}
