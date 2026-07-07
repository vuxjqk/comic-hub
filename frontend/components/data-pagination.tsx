import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useUpdateQuery } from "@/hooks/update-query";
import { Meta } from "@/types/response";

export default function DataPagination({ meta }: { meta: Meta | null }) {
  const updateQuery = useUpdateQuery();

  if (!meta) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => updateQuery({ page: meta.currentPage - 1 })}
            disabled={meta.currentPage <= 1}
          />
        </PaginationItem>
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
          (index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => updateQuery({ page: index })}
                isActive={index === meta.currentPage}
              >
                {index}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => updateQuery({ page: meta.currentPage + 1 })}
            disabled={meta.currentPage >= meta.totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
