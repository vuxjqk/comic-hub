import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { useAuth } from "@/context/auth-context";
import { handleServerErrors } from "@/lib/utils";

export default function UploadAvatar() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ avatar: FileList | null }>({
    defaultValues: {
      avatar: null,
    },
  });

  const onSubmit = async (data: { avatar: FileList | null }) => {
    const formData = new FormData();

    if (data.avatar) formData.append("avatar", data.avatar[0]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/avatar`,
        {
          credentials: "include",
          method: "POST",
          body: formData,
        },
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        setUser(() => {
          if (!user) return null;
          return {
            ...user,
            avatar: result.data,
          };
        });
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

  const fileList = useWatch({
    control,
    name: "avatar",
  });

  useEffect(() => {
    const file = fileList?.[0] || null;
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);

    const timer = setTimeout(() => {
      setPreview(objectUrl);
    }, 0);

    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
    };
  }, [fileList]);

  const avatarSrc = preview
    ? preview
    : user
      ? `${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`
      : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldLegend>Upload avatar</FieldLegend>
        <FieldDescription></FieldDescription>
        <FieldGroup>
          <Field>
            <Label htmlFor="avatar">
              <Avatar>
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>
                  {user ? user.name.slice(0, 2) : "CH"}
                </AvatarFallback>
              </Avatar>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              {...register("avatar")}
            />
            <FieldError errors={[errors.avatar]} />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Upload"}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
