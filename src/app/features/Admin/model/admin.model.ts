// ==============================
// موديل Admin Users
// ==============================
export interface AdminUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
}

export interface CreateAdminUserRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface UpdateAdminUserRequest {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: string;
}
