import { NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";
import { jwtDecode } from "jwt-decode";

import { Payload } from "@/types";

import { getCookieOptions } from "./utils";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "JWT_SECRET_KEY",
);

const verifyAccessToken = async (token: string) => {
  try {
    const { payload }: { payload: Payload } = await jwtVerify(
      token,
      JWT_SECRET,
    );
    return payload;
  } catch {
    return null;
  }
};

const refresh = async (refreshToken: string, response: NextResponse) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await res.json();

    if (res.ok && result.success) {
      const { accessToken } = result.data;
      const payload: Payload = jwtDecode(accessToken);

      response.cookies.set(
        "accessToken",
        accessToken,
        getCookieOptions(payload.exp! - Math.floor(Date.now() / 1000)),
      );

      return payload;
    }

    console.error("Error: ", result.message);
    return null;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

export const authenticate = async (
  accessToken: string | undefined,
  refreshToken: string | undefined,
  response: NextResponse,
) => {
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  if (refreshToken) {
    const newPayload = await refresh(refreshToken, response);
    if (newPayload) return newPayload;
  }

  return null;
};

export const redirectWithHeaders = (
  request: NextRequest,
  response: NextResponse,
  path: string,
) => {
  return NextResponse.redirect(new URL(path, request.url), {
    headers: response.headers,
  });
};
