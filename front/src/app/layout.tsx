"use client";

// import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../lib/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Cartoonix",
//   description: "Social network platform",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register"].includes(pathname || "");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUsername(parsedUser.username);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Wrap all content in AuthProvider except auth pages
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
          {isAuthPage ? (
            <>
              <main className="container mx-auto px-4 py-20">{children}</main>
            </>
          ) : (
            <AuthProvider>
              <Navbar username={username} />
              <main className="container mx-auto px-4 pt-24 pb-12">
                {children}
              </main>
            </AuthProvider>
          )}
        </div>
      </body>
    </html>
  );
}
