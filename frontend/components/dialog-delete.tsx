import { useState } from "react";

import { toast } from "react-toastify";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Spinner } from "./ui/spinner";

export default function DialogDelete({
  deleteUrl,
  onClose,
  onFetch,
  withCredentials = false,
}: {
  deleteUrl: string | null;
  onClose: () => void;
  onFetch: () => Promise<void>;
  withCredentials?: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const options: RequestInit = {
        method: "DELETE",
        ...(withCredentials && { credentials: "include" }),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${deleteUrl}`,
        options,
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        onClose();
        onFetch();
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!deleteUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? <Spinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
