import { JWTPayload } from "jose";

import { Role } from "./response";

export interface DecimalObj {
  s: number;
  e: number;
  d: number[];
}

export interface Payload extends JWTPayload {
  isEmailVerified: string;
  role: Role;
}
