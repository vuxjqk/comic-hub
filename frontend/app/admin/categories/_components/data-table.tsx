import { SquarePen, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Category } from "@/types/response";

export default function DataTable({
  data,
  setCategory,
  setUpdateUrl,
  setDeleteUrl,
}: {
  data: Category[];
  setCategory: (category: Category | null) => void;
  setUpdateUrl: (url: string | null) => void;
  setDeleteUrl: (url: string | null) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.id}</TableCell>
            <TableCell>{category.name}</TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>
              <Button
                size="icon-sm"
                className="bg-yellow-600 hover:bg-yellow-500"
                onClick={() => {
                  setUpdateUrl(`admin/categories/${category.id}`);
                  setCategory(category);
                }}
              >
                <SquarePen />
              </Button>
              <Button
                size="icon-sm"
                className="bg-red-600 hover:bg-red-500"
                onClick={() => setDeleteUrl(`admin/categories/${category.id}`)}
              >
                <Trash />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
