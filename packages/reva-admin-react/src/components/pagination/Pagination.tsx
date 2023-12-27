import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

export default function Pagination({
  totalPages,
  currentPage,
  onPageClick,
  className,
}: {
  totalPages: number;
  currentPage: number;
  onPageClick: (pageNumber: number) => void;
  className?: string;
}) {
  const getPagination = (count: number, page: number) => {
    const maxVisiblePages = 10;
    // first n pages
    if (count <= maxVisiblePages) {
      return Array.from({ length: count }, (_, v) => ({
        number: v + 1,
        active: page === v + 1,
      }));
    }
    // last n pages
    if (page > count - maxVisiblePages) {
      return Array.from({ length: maxVisiblePages }, (_, v) => {
        const pageNumber = count - (maxVisiblePages - v) + 1;
        return {
          number: pageNumber,
          active: page === pageNumber,
        };
      });
    }
    return [];
  };
  const pages = getPagination(totalPages, currentPage);

  return (
    <div className={`flex ${className}`}>
      <div>
        <nav
          role="navigation"
          className={fr.cx("fr-pagination")}
          aria-label="Pagination"
        >
          <ul className={fr.cx("fr-pagination__list")}>
            {pages.map((p) => (
              <li key={p.number}>
                {p.active && (
                  <p
                    className={fr.cx("fr-pagination__link")}
                    aria-current={"page"}
                  >
                    {p.number}
                  </p>
                )}
                {!p.active && (
                  <Link
                    className={fr.cx("fr-pagination__link")}
                    href="#"
                    onClick={() => onPageClick(p.number)}
                  >
                    {p.number}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
