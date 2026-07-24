import { useState } from "react";

import { Input } from "@/components/ui/input";

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
        placeholder="Name or slug..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </form>
  );
}
