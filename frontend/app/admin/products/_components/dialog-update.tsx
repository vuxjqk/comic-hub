import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { handleServerErrors, parseDecimal, slugify } from "@/lib/utils";
import { ProductDto } from "@/types/request";
import { Product } from "@/types/response";

export default function DialogUpdate({
  updateUrl,
  onClose,
  onFetch,
  product,
}: {
  updateUrl: string | null;
  onClose: () => void;
  onFetch: () => Promise<void>;
  product: Product | null;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductDto>({
    values: {
      title: product?.title ?? "",
      slug: product?.slug ?? "",
      price: product ? parseDecimal(product.price) : 0,
      salePrice: product ? parseDecimal(product.salePrice) : 0,
      stock: product?.stock ?? 0,
      description: product?.description ?? "",
      coverImage: null,
      isActive: product?.isActive ?? true,
    },
  });

  const onSubmit = async (data: ProductDto) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("price", data.price.toString());
    formData.append("salePrice", data.salePrice.toString());
    formData.append("stock", data.stock.toString());
    formData.append("description", data.description);
    if (data.coverImage) formData.append("coverImage", data.coverImage);
    formData.append("isActive", data.isActive.toString());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${updateUrl}`,
        {
          credentials: "include",
          method: "PATCH",
          body: formData,
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Title"
                {...register("title", {
                  onChange: (e) => {
                    setValue("slug", slugify(e.target.value), {
                      shouldValidate: true,
                    });
                  },
                })}
              />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="Slug" {...register("slug")} />
              <FieldError errors={[errors.slug]} />
            </Field>
            <Field>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Price"
                {...register("price")}
              />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field>
              <Label htmlFor="salePrice">Sale price</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                placeholder="Sale price"
                {...register("salePrice")}
              />
              <FieldError errors={[errors.salePrice]} />
            </Field>
            <Field>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Stock"
                {...register("stock")}
              />
              <FieldError errors={[errors.stock]} />
            </Field>
            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description"
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>
            <Field>
              <Label htmlFor="coverImage">Cover image</Label>
              <Controller
                name="coverImage"
                control={control}
                render={({ field: { onChange } }) => (
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                  />
                )}
              />
              <FieldError errors={[errors.coverImage]} />
            </Field>
            <Field>
              <Label htmlFor="isActive">Status</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={
                      value === true ? "true" : value === false ? "false" : ""
                    }
                    onValueChange={(val) => {
                      if (val === "true") onChange(true);
                      else if (val === "false") onChange(false);
                      else onChange("");
                    }}
                  >
                    <SelectTrigger id="isActive" className="w-full">
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
                )}
              />
              <FieldError errors={[errors.isActive]} />
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
