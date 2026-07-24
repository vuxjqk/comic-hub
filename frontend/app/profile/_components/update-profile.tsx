import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/context/auth-context";
import { handleServerErrors } from "@/lib/utils";
import { UpdateProfileDto } from "@/types/request";

export default function UpdateProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileDto>({
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
    },
  });

  const onSubmit = async (data: UpdateProfileDto) => {
    const bodyData = {
      name: "",
      email: "",
      phone: "",
      address: "",
    };

    bodyData.name = data.name;
    bodyData.email = data.email;
    bodyData.phone = data.phone;
    bodyData.address = data.address;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        setUser(result.data);
        router.refresh();
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldLegend>Update profile</FieldLegend>
        <FieldDescription></FieldDescription>
        <FieldGroup>
          <Field>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Full name" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0987654321"
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
          <Field>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="123 Street, District 1, HCM, Vietnam"
              {...register("address")}
            />
            <FieldError errors={[errors.address]} />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Update"}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
