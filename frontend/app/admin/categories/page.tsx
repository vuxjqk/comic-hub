"use client";

import { useCallback, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { toast } from "react-toastify";

import DataPagination from "@/components/data-pagination";
import DialogDelete from "@/components/dialog-delete";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";

import { Category, Filters, Meta } from "@/types/response";

import DataTable from "./_components/data-table";
import DialogCreate from "./_components/dialog-create";
import DialogUpdate from "./_components/dialog-update";
import FilterBar from "./_components/filter-bar";

export default function CategoriesPage() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams(searchParams.toString());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories?${query.toString()}`,
        {
          credentials: "include",
        },
      );
      const result = await res.json();

      if (res.ok && result.success) {
        setData(result.data);
        setMeta(result.meta);
        setFilters(result.filters);
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const startFetching = () => {
      fetchCategories();
    };

    startFetching();
  }, [fetchCategories]);

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold leading-none text-gray-800 dark:text-gray-200">
            Category List
          </h1>

          <DialogCreate onFetch={fetchCategories} />
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FilterBar filters={filters} />

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <>
            <DataTable
              data={data}
              setCategory={setCategory}
              setUpdateUrl={setUpdateUrl}
              setDeleteUrl={setDeleteUrl}
            />

            <DataPagination meta={meta} />
          </>
        )}

        <DialogUpdate
          updateUrl={updateUrl}
          onClose={() => setUpdateUrl(null)}
          onFetch={fetchCategories}
          category={category}
        />

        <DialogDelete
          deleteUrl={deleteUrl}
          onClose={() => setDeleteUrl(null)}
          onFetch={fetchCategories}
          withCredentials={true}
        />
      </div>
    </div>
  );
}
