import { Button } from "@codegouvfr/react-dsfr/Button";
import Card, { CardProps } from "@codegouvfr/react-dsfr/Card";

import { Pagination } from "../pagination/Pagination";

type MultiSelectItemProps = Pick<
  CardProps,
  "title" | "desc" | "start" | "end"
> & {
  id: string;
};

type MultiSelectListProps = {
  pageItems: MultiSelectItemProps[];
  selectedItemsIds: string[];
  onSelectionChange?: (args: { itemId: string; selected: boolean }) => void;
  currentPage: number;
  totalPages: number;
  basePaginationUrl: string;
  className?: string;
};

export const MultiSelectList = ({
  pageItems,
  selectedItemsIds,
  onSelectionChange,
  currentPage,
  totalPages,
  basePaginationUrl,
  className = "",
}: MultiSelectListProps) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {pageItems.map((item) => (
      <Card
        data-testid={`multi-select-list-item-${item.id}`}
        key={item.id}
        size="small"
        {...item}
        endDetail={
          selectedItemsIds.includes(item.id) ? (
            <Button
              onClick={() =>
                onSelectionChange?.({
                  itemId: item.id,
                  selected: false,
                })
              }
            >
              Retirer
            </Button>
          ) : (
            <Button
              onClick={() =>
                onSelectionChange?.({
                  itemId: item.id,
                  selected: true,
                })
              }
            >
              Ajouter
            </Button>
          )
        }
      />
    ))}
    <Pagination
      className="mx-auto"
      totalPages={totalPages}
      currentPage={currentPage}
      baseHref={basePaginationUrl}
    />
  </div>
);
