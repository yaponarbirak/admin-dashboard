"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  loginWithEmail,
  logout as firebaseLogout,
  convertToAdminUser,
} from "@/lib/firebase/auth";
import { AdminUser, AuthContextType } from "@/types";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase User to AdminUser
        const adminUser = await convertToAdminUser(firebaseUser);
        setUser(adminUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await loginWithEmail(email, password);
      const adminUser = await convertToAdminUser(userCredential.user);

      if (!adminUser) {
        // Not an admin user
        await firebaseLogout();
        throw new Error("Bu hesap admin yetkisine sahip değil.");
      }

      setUser(adminUser);
      // Redirect to root (which will show dashboard)
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const adminUser = await convertToAdminUser(currentUser);
      setUser(adminUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.isAdmin ?? false,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
