import { SquarePen, Trash } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { parseDecimal } from "@/lib/utils";
import { Product } from "@/types/response";

export default function DataTable({
  data,
  setProduct,
  setUpdateUrl,
  setDeleteUrl,
}: {
  data: Product[];
  setProduct: (product: Product | null) => void;
  setUpdateUrl: (url: string | null) => void;
  setDeleteUrl: (url: string | null) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Pricing</TableHead>
          <TableHead>Stock & Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.id}</TableCell>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${product.coverImage}`}
                />
                <AvatarFallback>{product.title.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div>{product.title}</div>
                <div>{product.slug}</div>
              </div>
            </TableCell>
            <TableCell>
              {product.salePrice && (
                <div className="line-through">
                  ${parseDecimal(product.price)}
                </div>
              )}
              <div className="text-base font-semibold">
                ${parseDecimal(product.finalPrice)}
              </div>
            </TableCell>
            <TableCell>
              <div>{product.stock} products</div>
              <div
                className={product.isActive ? "text-green-500" : "text-red-500"}
              >
                {product.isActive ? "Active" : "Inactive"}
              </div>
            </TableCell>
            <TableCell>
              <Button
                size="icon-sm"
                className="bg-yellow-600 hover:bg-yellow-500"
                onClick={() => {
                  setUpdateUrl(`admin/products/${product.id}`);
                  setProduct(product);
                }}
              >
                <SquarePen />
              </Button>
              <Button
                size="icon-sm"
                className="bg-red-600 hover:bg-red-500"
                onClick={() => setDeleteUrl(`admin/products/${product.id}`)}
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
