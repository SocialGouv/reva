type Sort = "asc" | "desc";
interface FilteredPaginatedListArgs {
  limit?: number;
  offset?: number;
  filter?: string;
}

interface PaginationInfo {
  totalRows: number;
  currentPage: number;
  totalPages: number;
  pageLength: number;
}
interface PaginatedListResult<T> {
  rows: T[];
  info: PaginationInfo;
}
