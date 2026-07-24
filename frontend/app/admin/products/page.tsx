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

import { Filters, Meta, Product } from "@/types/response";

import DataTable from "./_components/data-table";
import DialogCreate from "./_components/dialog-create";
import DialogUpdate from "./_components/dialog-update";
import FilterBar from "./_components/filter-bar";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams(searchParams.toString());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products?${query.toString()}`,
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
      fetchProducts();
    };

    startFetching();
  }, [fetchProducts]);

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold leading-none text-gray-800 dark:text-gray-200">
            Product List
          </h1>

          <DialogCreate onFetch={fetchProducts} />
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
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
              setProduct={setProduct}
              setUpdateUrl={setUpdateUrl}
              setDeleteUrl={setDeleteUrl}
            />

            <DataPagination meta={meta} />
          </>
        )}

        <DialogUpdate
          updateUrl={updateUrl}
          onClose={() => setUpdateUrl(null)}
          onFetch={fetchProducts}
          product={product}
        />

        <DialogDelete
          deleteUrl={deleteUrl}
          onClose={() => setDeleteUrl(null)}
          onFetch={fetchProducts}
          withCredentials={true}
        />
      </div>
    </div>
  );
}
