/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";  // npm install jwt-decode
 
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("access_token")?.value;
  if (!token) redirect("/login");
 
  try {
    const payload: any = jwtDecode(token);
    if (payload.role !== "admin") redirect("/dashboard");
  } catch {
    redirect("/login");
  }
 
  return <>{children}</>;
}