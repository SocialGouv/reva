
type Sort = "asc" | "desc";
interface FilteredPaginatedListArgs {
  limit?: number;
  offset?: number;
  filter?: string;
}
