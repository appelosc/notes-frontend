import * as dotenv from 'dotenv';
dotenv.config();
const token = localStorage.getItem('jwtToken');

// Allmän API function för att göra fetch requests till olika endpoints
export async function api<T>(base : string,path: string, options:RequestInit = {}) : Promise<T> {
  try {
    const response = await fetch(`${base}${path}`,{
      ...options,
      headers:
      { "Content-Type": "application/json",
          ...(token && {Authorization: `Bearer ${token}`}),
          ...options.headers },

      })
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`API request to ${path} failed:`, error)
    throw error
  }
}

export const authApi = (path: string, options?: RequestInit) => api(process.env.AUTH_API_URL!, path, options)
export const notesApi = (path: string, options?: RequestInit) => api(process.env.NOTES_API_URL!, path, options)
