import { authApi } from './client';

export const registerUser = (userData: { username: string; password: string }) : Promise<string> => authApi<string>(`/auth/register`, {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const loginUser = (userData: {username: string; password: string}) : Promise<{ message: string, token: string }> => authApi<{ message: string, token: string }>(`/auth/login`, {
  method: 'POST',
  body: JSON.stringify(userData),
});