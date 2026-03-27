import axios from "axios";
import Cookies from "js-cookie";
 
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
 
const api = axios.create({ 
  baseURL: API_URL,
  withCredentials: true, 
 });
 
// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get("refresh_token");
        if (!refresh) throw new Error("no refresh");
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh }, { withCredentials: true });
        Cookies.set("access_token", data.access_token, { expires: 1 });
        Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }
    }
    return Promise.reject(err);
  }
);
 
export default api;