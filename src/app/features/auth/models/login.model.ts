export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    userName: string;
    userType: string;
    expiresAtUtc: string;
  };
}

export interface StoredUser {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  userName: string;
  userType: string;
}
