import { useState } from "react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { handleServerErrors } from "@/lib/utils";
import { UserDto } from "@/types/request";

export default function DialogCreate({
  onFetch,
}: {
  onFetch: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserDto>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      avatar: null,
    },
  });

  const onSubmit = async (data: UserDto) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    if (data.avatar) formData.append("avatar", data.avatar);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          method: "POST",
          body: formData,
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
              <Input id="name" placeholder="Name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone"
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Address"
                {...register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>
            <Field>
              <Label htmlFor="avatar">Avatar</Label>
              <Controller
                name="avatar"
                control={control}
                render={({ field: { onChange } }) => (
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                  />
                )}
              />
              <FieldError errors={[errors.avatar]} />
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
