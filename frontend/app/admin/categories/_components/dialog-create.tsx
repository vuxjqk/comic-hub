import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { handleServerErrors, slugify } from "@/lib/utils";
import { CategoryDto } from "@/types/request";

export default function DialogCreate({
  onFetch,
}: {
  onFetch: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryDto>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (data: CategoryDto) => {
    const bodyData = {
      name: "",
      slug: "",
    };

    bodyData.name = data.name;
    bodyData.slug = data.slug;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        setOpen(false);
        reset();
        onFetch();
      } else {
        if (Object.keys(result.errors ?? {}).length) {
          handleServerErrors(result.errors, setError);
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Connection error.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500">Create</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <FieldGroup className="no-scrollbar max-h-[50vh] overflow-y-auto py-4">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                {...register("name", {
                  onChange: (e) => {
                    setValue("slug", slugify(e.target.value), {
                      shouldValidate: true,
                    });
                  },
                })}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="Slug" {...register("slug")} />
              <FieldError errors={[errors.slug]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
