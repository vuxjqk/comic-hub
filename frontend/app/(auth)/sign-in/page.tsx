"use client";

import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { setSession } from "@/actions/auth";
import { useAuth } from "@/context/auth-context";
import { getRedirectUrl, handleServerErrors } from "@/lib/utils";
import { SignInDto } from "@/types/request";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();

  const callbackUrl = searchParams.get("callbackUrl") || getRedirectUrl(user);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInDto>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInDto) => {
    const bodyData = {
      email: "",
      password: "",
      rememberMe: false,
    };

    bodyData.email = data.email;
    bodyData.password = data.password;
    bodyData.rememberMe = data.rememberMe;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );
      const result = await res.json();

      toast[result.success ? "success" : "error"](result.message);

      if (res.ok && result.success) {
        const { accessToken, refreshToken, expiresAt, ...user } = result.data;

        await setSession(accessToken, refreshToken, expiresAt);
        setUser(user);

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
              <BreadcrumbPage>Sign in</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="w-full max-w-sm mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                  <Button variant="link" asChild>
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...register("email")}
                      tabIndex={1}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>
                  <Field>
                    <div className="relative">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        variant="link"
                        className="absolute -top-2 right-0"
                        asChild
                      >
                        <Link href="/forgot-password">
                          Forgot your password?
                        </Link>
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      {...register("password")}
                      tabIndex={2}
                    />
                    <FieldError errors={[errors.password]} />
                  </Field>
                  <Field orientation="horizontal">
                    <Controller
                      name="rememberMe"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          id="rememberMe"
                          checked={value}
                          onCheckedChange={onChange}
                          tabIndex={3}
                        />
                      )}
                    />
                    <Label htmlFor="rememberMe">Remember me</Label>
                    <FieldError errors={[errors.rememberMe]} />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  tabIndex={4}
                >
                  {isSubmitting ? <Spinner /> : "Sign in"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
