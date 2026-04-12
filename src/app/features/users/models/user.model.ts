export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  bookingsCount: number;
  totalBookingsAmount: number;
  createdAt: string;
}

export interface UserResponse {
  User: User[];
  totalPages: number;
  totalCount: number;
}
