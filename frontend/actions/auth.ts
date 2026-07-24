"use server";

import { cookies } from "next/headers";

import { jwtDecode } from "jwt-decode";

import { getCookieOptions } from "@/lib/utils";

export const hasRefreshToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.has("refreshToken");
};

export const setSession = async (
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
) => {
  const cookieStore = await cookies();

  cookieStore.set(
    "accessToken",
    accessToken,
    getCookieOptions(
      jwtDecode(accessToken).exp! - Math.floor(Date.now() / 1000),
    ),
  );

  cookieStore.set(
    "refreshToken",
    refreshToken,
    getCookieOptions(Math.floor((expiresAt - Date.now()) / 1000)),
  );
};

export const clearSession = async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        console.error("Error: ", result.message);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return {
    success: true,
    message: "Signed out successfully.",
  };
};

export const refresh = async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );
      const result = await res.json();

      if (res.ok && result.success) {
        const { accessToken } = result.data;

        cookieStore.set(
          "accessToken",
          accessToken,
          getCookieOptions(
            jwtDecode(accessToken).exp! - Math.floor(Date.now() / 1000),
          ),
        );
      } else {
        console.error("Error: ", result.message);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }
};
