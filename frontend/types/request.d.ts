export interface UserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  avatar: File | null;
}

export interface CategoryDto {
  name: string;
  slug: string;
}

export interface ProductDto {
  title: string;
  slug: string;
  price: number;
  salePrice: number;
  stock: number;
  description: string;
  coverImage: File | null;
  isActive: boolean;
}

export interface UpdateProfileDto {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SignInDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
