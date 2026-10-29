export type UserRole = 'admin' | 'user';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};
