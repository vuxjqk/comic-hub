import { DecimalObj } from ".";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  price: DecimalObj;
  salePrice: DecimalObj | null;
  finalPrice: DecimalObj;
  stock: number;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Filters {
  search: string;
  stockStatus: "in_stock" | "low_stock" | "out_stock";
  isActive: boolean | null;
}
