import style from './PaginationPages.module.css';
export default function PaginationPages({
  contentCountInPage,
  contentLength,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(contentLength / contentCountInPage);
  const pages = [];

  const createPageArray = () => {
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // добавляем первую страницу
      pages.push(1);

      if (currentPage > 4) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
  };

  createPageArray();

  return (
    <div className={style.wrap}>
      {pages.map((page, index) => (
        <button
          key={index}
          className={`${style.btn} ${page === currentPage ? style.active : ''}`}
          disabled={page === '...'}
          onClick={() => typeof page === 'number' && onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
