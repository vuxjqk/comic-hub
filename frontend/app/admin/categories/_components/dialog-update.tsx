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
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { handleServerErrors, slugify } from "@/lib/utils";
import { CategoryDto } from "@/types/request";
import { Category } from "@/types/response";

export default function DialogUpdate({
  updateUrl,
  onClose,
  onFetch,
  category,
}: {
  updateUrl: string | null;
  onClose: () => void;
  onFetch: () => Promise<void>;
  category: Category | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryDto>({
    values: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
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
        `${process.env.NEXT_PUBLIC_API_URL}/${updateUrl}`,
        {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        onClose();
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
    <Dialog open={!!updateUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
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
              {isSubmitting ? <Spinner /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
