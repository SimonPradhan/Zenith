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

        // The access token may be absent after a browser restart. The
        // HttpOnly refresh cookie can restore the session without login.
        if (!token) {
          const refreshed = await refreshSession();
          token = refreshed.access_token;
          setToken(token);
        }

        const currentUser = await getMe(token);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          removeToken();
          setUser(null);
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
    // Clear the local UI immediately, while asking the server to revoke the
    // refresh session. The server cookie is HttpOnly and cannot be cleared
    // from JavaScript directly.
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
