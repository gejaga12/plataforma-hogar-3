"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/query-client";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Effect to adjust main content margin when sidebar collapses
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector("aside");
      const mainContent = document.getElementById("main-content");

      if (sidebar && mainContent) {
        // Get the actual width of the sidebar
        const sidebarWidth = sidebar.getBoundingClientRect().width;

        // Only apply margin if sidebar is visible (width > 0)
        if (sidebarWidth > 0 && window.innerWidth >= 1024) {
          mainContent.style.marginLeft = `${sidebarWidth}px`;
        } else {
          mainContent.style.marginLeft = "0";
        }
      }
    };

    // Initial adjustment
    handleResize();

    // Set up observer to watch for sidebar width changes
    const observer = new ResizeObserver(handleResize);
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar);
    }

    // Also handle window resize events
    window.addEventListener("resize", handleResize);

    return () => {
      if (sidebar) {
        observer.unobserve(sidebar);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="hogarapp-ui-theme">
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
