"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  getMe,
  logoutSession,
  refreshSession,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  getToken,
  removeToken,
  setToken,
} from "@/lib/auth";
import type { User } from "@/types/auth";

type UserContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(
  undefined,
);

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        let token = getToken();

        // After a reload, the in-memory access token is intentionally empty.
        // Restore it using the persistent HttpOnly refresh cookie.
        if (!token) {
          const refreshed = await refreshSession();
          token = refreshed.access_token;
          setToken(token);
        }

        const currentUser = await getMe(token);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (cancelled) return;

        setUser(null);

        // Only a confirmed expired/invalid session should send the user
        // to login. Network errors and server errors should not log them out.
        if (error instanceof ApiError && error.status === 401) {
          removeToken();
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function logout() {
    removeToken();
    setUser(null);

    void logoutSession().catch(() => {
      // Local logout remains effective if the network is unavailable.
    });

    router.replace("/login");
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside UserProvider",
    );
  }

  return context;
}
