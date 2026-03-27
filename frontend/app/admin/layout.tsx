"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/layout/SideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
    if (!loading && !user) router.push("/login");
  }, [user, loading, isAdmin, router]);

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1117] flex items-center justify-center text-[#4ad4e4] transition-colors duration-300">
        Loading...
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#0f1117] text-[#1a1a2e] dark:text-[#e8e6e1] flex transition-colors duration-300"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4ad4e4; border-radius: 2px; }
      `}</style>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}