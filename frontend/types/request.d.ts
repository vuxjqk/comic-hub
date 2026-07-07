export interface UserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  avatar: File | null;
}
