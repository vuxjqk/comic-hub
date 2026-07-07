import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

export const useUpdateQuery = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = useCallback(
    (query: Record<string, string | number | boolean | null | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(query).forEach(([key, value]) => {
        if (key === "page" && Number(value) === 1) {
          current.delete(key);
        } else if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      router.push(`?${current.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return updateQuery;
};
