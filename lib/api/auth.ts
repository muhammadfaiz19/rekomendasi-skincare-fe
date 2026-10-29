import fetcher from './fetcher';
import { User, LoginResponse } from '@/types/auth';

export const authApi = {
  login: async (formData: URLSearchParams) => {
    const response = await fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    return response;
  },

  register: async (userData: { name: string; email: string; password?: string }) => {
    const response = await fetcher<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  getMe: async () => {
    const response = await fetcher<User>('/auth/me');
    return response;
  },
};
