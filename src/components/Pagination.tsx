import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

type Props = {
  currentPage: number;
  totalPage: number;
  isNextPage: boolean;
  isPrevPage: boolean;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPage,
  isPrevPage,
  isNextPage,
  onPageChange,
}: Props) {
  return (
    <section
      id={'pagination'}
      className={'w-full flex items-center justify-center gap-4'}
    >
      <button
        className={'flex items-center justify-center gap-2 bg-blue-500'}
        disabled={!isPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <MdChevronLeft size={24} />
        Prev
      </button>
      <span className={'text-gray-500 dark:text-gray-400'}>
        {currentPage} / {totalPage}
      </span>
      <button
        className={'flex items-center justify-center gap-2 bg-blue-500'}
        disabled={!isNextPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <MdChevronRight size={24} />
      </button>
    </section>
  );
}
