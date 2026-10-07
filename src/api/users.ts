import { authApi } from './client';

// Auth API:ns endpoints, 1 för registering och 1 för inloggning

export const registerUser = (userData: { username: string; password: string }) : Promise<string> => authApi<string>(`/auth/register`, {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const loginUser = (userData: {username: string; password: string}) : Promise<{ message: string, token: string }> => authApi<{ message: string, token: string }>(`/auth/login`, {
  method: 'POST',
  body: JSON.stringify(userData),
});