import { AuthProvider } from "@/context/AuthContext";
import NavBar from "@/components/layout/NavBar";
import "./globals.css";
import { Crimson_Pro } from 'next/font/google';

export const metadata = {
  title: "NarratAIve",
  description: "NarratAIve - Your Gateway to AI-Powered Event Management in Southeast Asia",
};

const inter = Crimson_Pro({
  subsets: ['latin'],
  display: 'swap', // Recommended for performance
});
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          {children}
          </AuthProvider>
      </body>
    </html>
  );
}