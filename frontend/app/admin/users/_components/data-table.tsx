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

import { User } from "@/types/response";

export default function DataTable({
  data,
  setUser,
  setUpdateUrl,
  setDeleteUrl,
}: {
  data: User[];
  setUser: (user: User | null) => void;
  setUpdateUrl: (url: string | null) => void;
  setDeleteUrl: (url: string | null) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Profile</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`}
                />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div>{user.name}</div>
                <div>{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>{user.phone}</div>
              <div>{user.address}</div>
            </TableCell>
            <TableCell
              className={user.isActive ? "text-green-500" : "text-red-500"}
            >
              {user.isActive ? "Active" : "Inactive"}
            </TableCell>
            <TableCell>
              <Button
                size="icon-sm"
                className="bg-yellow-600 hover:bg-yellow-500"
                onClick={() => {
                  setUpdateUrl(`admin/users/${user.id}`);
                  setUser(user);
                }}
              >
                <SquarePen />
              </Button>
              <Button
                size="icon-sm"
                className="bg-red-600 hover:bg-red-500"
                onClick={() => setDeleteUrl(`admin/users/${user.id}`)}
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
