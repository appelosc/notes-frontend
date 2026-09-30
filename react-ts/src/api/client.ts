// export const name = (param: Type) => whatToReturn;
// Allmän API function för att göra fetch requests till olika endpoints
export async function api<T>(base : string,path: string, options:RequestInit = {}) : Promise<T> {
  const token = localStorage.getItem('jwtToken');
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

export const authApi = <T>(path: string, options?: RequestInit) => api<T>(import.meta.env.VITE_AUTH_API_URL, path, options)
export const contentApi = <T>(path: string, options?: RequestInit) => api<T>(import.meta.env.VITE_NOTES_API_URL, path, options)
