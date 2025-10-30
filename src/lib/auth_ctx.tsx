"use client";
import { UserReqData } from "@/prisma/auth";
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Maybe } from "./error_monads";

type AuthContextType = {
  user: UserReqData | null,
  login: (email: string, password: string) => Promise<Maybe<string>>,
  logout: () => void,
  isLoading: boolean,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserReqData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored_user = localStorage.getItem("user");
    if (!stored_user) {
      return;
    }
    try {
      setUser(JSON.parse(stored_user));
    } catch (error) {
      console.error("Error parsing stored user:", error)
      localStorage.removeItem("user");
    }
    setIsLoading(false);
  }, []);

  const doLogin = async (email: string, password: string): Promise<Maybe<string>> => {
    setIsLoading(true);
    try {
      return await fetch("/api/v1/ecommerce/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      .then(async (body) => await body.json())
      .then((json): Maybe<string> => {
        if (json.error) {
          console.error("Login error:", json.error as string)
          return Maybe.Some(json.error as string);
        }
        const user_data = json.user as UserReqData;
        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(user_data));
        setUser(user_data);
        return Maybe.None();
      })
      .finally(() => setIsLoading(false))
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return Maybe.Some(error as string);
    }
  }
  const doLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  return (
    <AuthContext.Provider value={{ user, login: doLogin, logout: doLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context;
}
