"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import ChangePassword from "./_components/change-password";
import UpdateProfile from "./_components/update-profile";
import UploadAvatar from "./_components/upload-avatar";

export default function ProfilePage() {
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
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="w-full max-w-md mx-auto space-y-6">
          <UploadAvatar />
          <Separator />
          <UpdateProfile />
          <Separator />
          <ChangePassword />
        </div>
      </div>
    </div>
  );
}
