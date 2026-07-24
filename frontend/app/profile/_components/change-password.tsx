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

import { handleServerErrors } from "@/lib/utils";
import { ChangePasswordDto } from "@/types/request";

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordDto>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordDto) => {
    const bodyData = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    bodyData.oldPassword = data.oldPassword;
    bodyData.newPassword = data.newPassword;
    bodyData.confirmPassword = data.confirmPassword;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/password`,
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
        reset();
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
        <FieldLegend>Change password</FieldLegend>
        <FieldDescription></FieldDescription>
        <FieldGroup>
          <Field>
            <Label htmlFor="oldPassword">Old password</Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="Old password"
              {...register("oldPassword")}
            />
            <FieldError errors={[errors.oldPassword]} />
          </Field>
          <Field>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="New password"
              {...register("newPassword")}
            />
            <FieldError errors={[errors.newPassword]} />
          </Field>
          <Field>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Change"}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
