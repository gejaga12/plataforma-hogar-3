"use client";

import { useState, useEffect } from "react";
import { User } from "@/utils/types";
import { AuthService } from "@/lib/api/apiAuth";
import { useRouter } from "next/navigation";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// const THIRTY_DAYS_MS = 60 * 1000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const checkTokenExpiration = () => {
    const expiration = localStorage.getItem("auth-expiration");
    if (expiration && new Date() > new Date(expiration)) {
      signOut();
    }
  };

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    checkTokenExpiration(); // al montar, verificamos

    const interval = setInterval(checkTokenExpiration, 60 * 1000); // cada minuto

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

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

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const userData = await AuthService.signInWithGoogle();

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
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };
}
