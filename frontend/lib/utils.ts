import { type ClassValue, clsx } from "clsx";
import Decimal from "decimal.js";
import { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { DecimalObj } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseDecimal = (obj: DecimalObj) => {
  return Object.assign(new Decimal(0), obj).toFixed(2);
};

export const handleServerErrors = <T extends FieldValues>(
  serverErrors: Record<string, string[]>,
  setError: UseFormSetError<T>,
) => {
  Object.keys(serverErrors).forEach((field) => {
    const messages = serverErrors[field];

    if (messages?.[0]) {
      setError(field as FieldPath<T>, {
        type: "server",
        message: messages[0],
      });
    }
  });
};

export const formatSnakeToSentence = (str: string) => {
  if (!str) return "";
  const spacedStr = str.toLowerCase().replace(/_/g, " ");
  return spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1);
};

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
