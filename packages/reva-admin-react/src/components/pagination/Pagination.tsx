import Link from "next/link";

export default function Pagination({
  totalPages,
  currentPage,
  className,
  baseHref,
}: {
  totalPages: number;
  currentPage: number;
  baseHref: string;
  className?: string;
}) {
  const getPages = ({
    from,
    to,
    activePage,
  }: {
    from: number;
    to: number;
    activePage: number;
  }) =>
    Array.from({ length: to - from + 1 }, (_, v) => ({
      number: v + from,
      active: v + from === activePage,
    }));

  const getPagination = (totalPages: number, currentPage: number) => {
    const MAX_VISIBLE_PAGES = 7;
    const ELLIPSIS = {};
    let pages: { number?: number; active?: boolean }[] = [];
    if (totalPages > MAX_VISIBLE_PAGES) {
      if (currentPage < 5) {
        pages = [
          ...getPages({ from: 1, to: 5, activePage: currentPage }),
          ELLIPSIS,
          { number: totalPages },
        ];
      } else if (currentPage > totalPages - 4) {
        pages = [
          { number: 1 },
          ELLIPSIS,
          ...getPages({
            from: totalPages - 4,
            to: totalPages,
            activePage: currentPage,
          }),
        ];
      } else {
        pages = [
          { number: 1 },
          ELLIPSIS,
          ...getPages({
            from: currentPage - 1,
            to: currentPage + 1,
            activePage: currentPage,
          }),
          ELLIPSIS,
          { number: totalPages },
        ];
      }
    } else {
      pages = getPages({ from: 1, to: totalPages, activePage: currentPage });
    }
    return pages;
  };

  const pages = getPagination(totalPages, currentPage);

  return (
    <div className={`flex ${className}`}>
      <div>
        <nav
          role="navigation"
          className="fr-pagination"
          aria-label="Pagination"
        >
          <ul className="fr-pagination__list">
            {pages.map((p, i) => (
              <li key={i}>
                {p.active && (
                  <p
                    className="fr-pagination__link fr-pagination__link--lg-label"
                    aria-current={"page"}
                  >
                    {p.number}
                  </p>
                )}
                {!p.active &&
                  (p?.number ? (
                    <Link
                      className="fr-pagination__link fr-pagination__link--lg-label"
                      href={{
                        pathname: baseHref,
                        query: { page: p?.number },
                      }}
                    >
                      {p.number}
                    </Link>
                  ) : (
                    <span
                      className="fr-icon-more-line fr-icon fr-pagination__link fr-pagination__link--lg-label"
                      aria-hidden="true"
                    />
                  ))}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
