import Cookies from 'js-cookie';
import { APIResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = Cookies.get('access_token');

  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Optional: Log out user or redirect
    if (typeof window !== 'undefined') {
      // Cookies.remove('access_token');
      // window.location.href = '/login';
    }
  }

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = result.message || result.detail || 'Terjadi kesalahan saat mengambil data';
    throw new Error(errorMsg);
  }

  return result as APIResponse<T>;
}

export default fetcher;
