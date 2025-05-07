// src/app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext"; // Import SocketProvider
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Team Task Manager (JS)",
  description: "Collaborative task management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider> {/* Wrap with SocketProvider */}
            {children}
            <Toaster position="bottom-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}