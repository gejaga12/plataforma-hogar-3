// context/AuthContext.tsx
"use client";

import React, { createContext, useEffect, useState } from "react";
import { AuthService, UserLoginData } from "@/utils/api/apiAuth";
import { useRouter } from "next/navigation";
import { UserAdapted } from "@/utils/types";

interface AuthContextType {
  user: UserLoginData | null;
  usuarios: UserAdapted[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (fullName: string, password: string) => Promise<UserLoginData>;
  signOut: () => Promise<void>;
  refetchUsuarios: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// const THIRTY_DAYS_MS = 60 * 1000; // para test

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserLoginData | null>(null);
  const [usuarios, setUsuarios] = useState<UserAdapted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const checkTokenExpiration = () => {
    const expiration = localStorage.getItem("auth-expiration");
    if (expiration && new Date() > new Date(expiration) && user) {
      signOut();
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("auth-user");
    const expiration = localStorage.getItem("auth-expiration");

    if (storedUser && expiration) {
      const expDate = new Date(expiration);
      const now = new Date();

      if (now < expDate) {
        try {
          setUser(JSON.parse(storedUser));
          refetchUsuarios();
          setLoading(false);
        } catch {
          localStorage.removeItem("auth-user");
        }
      } else {
        signOut(); // Token vencido
      }
    }

    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setUser(user);
        } catch (e) {
          console.error("Error al traer usuarios:", e);
        }
      }

      setLoading(false);
    });

    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refetchUsuarios = async () => {
    try {
      const data = await AuthService.getUsers(100, 0);

      console.log(data);
      
      setUsuarios(data);
    } catch (e) {
      console.error("Error al cargar usuarios:", e);
    }
  };

  const signIn = async (fullName: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const userData = await AuthService.signInWithEmail(fullName, password);
      const expirationDate = new Date(
        Date.now() + THIRTY_DAYS_MS
      ).toISOString();
      localStorage.setItem("auth-expiration", expirationDate);
      setUser(userData);
      return userData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await AuthService.signOut();
      localStorage.removeItem("auth-expiration");
      setUser(null);
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usuarios,
        loading,
        error,
        signIn,
        signOut,
        isAuthenticated: !!user,
        refetchUsuarios,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
