const DEFAULT_PAGE_LENGTH = 25;
interface ProcessPaginationInfoArgs {
  limit?: number;
  offset?: number;
  totalRows: number;
}

export const processPaginationInfo = ({
  limit,
  offset,
  totalRows,
}: ProcessPaginationInfoArgs): PaginationInfo => {
  const currentRow = offset ?? 0;
  const pageLength = limit ?? DEFAULT_PAGE_LENGTH;
  const totalPages = Math.ceil(totalRows / pageLength);
  const currentPage = Math.floor(currentRow / pageLength) + 1;
  return {
    currentPage,
    pageLength,
    totalRows,
    totalPages,
  };
};
