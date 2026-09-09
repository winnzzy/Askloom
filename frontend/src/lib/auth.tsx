import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified?: boolean;
  role?: string;
  currentPlan?: AuthPlan | null;
}

export interface AuthPlan {
  code: string;
  name: string;
  currency: string;
  price: string;
  billingInterval: string;
  dailySearchLimit: number | null;
  scriptHookLimit: number | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null });

  const login = useCallback((token: string, user: AuthUser) => {
    setState({ token, user });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null });
    void fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as AuthState;
        if (data.token && data.user) {
          setState({ token: data.token, user: data.user });
        }
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
    }),
    [login, logout, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export function getAuthHeader(token?: string | null): Record<string, string> {
  const explicitToken = token ?? null;
  if (explicitToken) {
    return { Authorization: `Bearer ${explicitToken}` };
  }

  return {};
}
