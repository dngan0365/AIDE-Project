/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, fetchMe, logoutUser } from "@/api/auth";
import { useRouter } from "next/navigation";
 
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
 
const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, isAdmin: false,
  logout: async () => {}, refreshUser: async () => {},
});
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  const refreshUser = async () => {
    const me = await fetchMe();
    setUser(me);
  };
 
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);
 
  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  };
 
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === "admin", logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export const useAuth = () => useContext(AuthContext);