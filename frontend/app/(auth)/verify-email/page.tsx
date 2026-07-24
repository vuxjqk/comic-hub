"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { refresh } from "@/actions/auth";
import { useAuth } from "@/context/auth-context";
import { getRedirectUrl, handleServerErrors } from "@/lib/utils";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const callbackUrl = searchParams.get("callbackUrl") || getRedirectUrl(user);

  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ otp: string }>({
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: { otp: string }) => {
    const bodyData = {
      otp: "",
    };

    bodyData.otp = data.otp;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
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
        await refresh();
        router.push(callbackUrl);
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

  const handleResendEmail = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification-otp`,
        {
          credentials: "include",
          method: "POST",
        },
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Verify email</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="w-full max-w-sm mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Verify email</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={handleResendEmail}
                  >
                    {loading ? <Spinner /> : "Resend email"}
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Field>
                  <Label htmlFor="otp">OTP</Label>
                  <Controller
                    name="otp"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <InputOTP
                        id="otp"
                        containerClassName="overflow-hidden"
                        maxLength={6}
                        value={value}
                        onChange={onChange}
                      >
                        <InputOTPGroup className="w-full justify-center">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                  <FieldError errors={[errors.otp]} />
                </Field>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Verify"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
