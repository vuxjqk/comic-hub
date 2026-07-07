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

export interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Filters {
  search: string;
  isActive: boolean | null;
}
