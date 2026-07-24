import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateQuery } from "@/hooks/update-query";
import { Filters } from "@/types/response";

export default function FilterBar({ filters }: { filters: Filters | null }) {
  const updateQuery = useUpdateQuery();

  const [input, setInput] = useState(filters?.search ?? "");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    updateQuery({
      search: input,
      page: 1,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <Input
        type="search"
        placeholder="Title or slug..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Select
        value={filters?.stockStatus ?? ""}
        onValueChange={(val) =>
          updateQuery({
            stockStatus: val === "none" ? "" : val,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Stock status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="none">Stock status</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_stock">Out stock</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={
          filters?.isActive === true
            ? "true"
            : filters?.isActive === false
              ? "false"
              : ""
        }
        onValueChange={(val) =>
          updateQuery({
            isActive: val === "none" ? "" : val,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="none">Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </form>
  );
}
