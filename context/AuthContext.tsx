import { getCookie, removeCookies, setCookies } from "cookies-next";
import React, { useState, useEffect, useContext, createContext } from "react";

type authType = {
  user: null | User;
  register?: (
    email: string,
    fullname: string,
    password: string,
    shippingAddress: string,
    phone: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  login?: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  forgotPassword?: (email: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  logout?: () => void;
};

const initialAuth: authType = {
  user: null,
};

const authContext = createContext<authType>(initialAuth);

type User = {
  id: number;
  email: string;
  fullname: string;
  shippingAddress?: string;
  phone?: string;
  token: string;
};

const localUsers: Array<User & { password: string }> = [];

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}
// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initialAuth = getCookie("user");
    if (initialAuth) {
      const initUser = JSON.parse(initialAuth as string);
      setUser(initUser);
    }
  }, []);

  useEffect(() => {
    setCookies("user", user);
  }, [user]);

  const register = async (
    email: string,
    fullname: string,
    password: string,
    shippingAddress: string,
    phone: string
  ) => {
    if (localUsers.some((existingUser) => existingUser.email === email)) {
      return { success: false, message: "alreadyExists" };
    }

    const user: User = {
        id: localUsers.length + 1,
        email,
        fullname,
        shippingAddress,
        phone,
        token: `local-token-${Date.now()}`,
      };
    localUsers.push({ ...user, password });
    setUser(user);
    return { success: true, message: "register_successful" };
  };

  const login = async (email: string, password: string) => {
    const existingUser = localUsers.find(
      (localUser) => localUser.email === email && localUser.password === password
    );
    if (!existingUser) return { success: false, message: "incorrect" };

    const { password: _password, ...user } = existingUser;
    setUser(user);
    return { success: true, message: "login_successful" };
  };

  const forgotPassword = async (email: string) => {
    const existingUser = localUsers.some((localUser) => localUser.email === email);
    return {
      success: existingUser,
      message: existingUser ? "reset_email_sent" : "something_went_wrong",
    };
  };

  const logout = () => {
    setUser(null);
    removeCookies("user");
  };

  // Return the user object and auth methods
  return {
    user,
    register,
    login,
    forgotPassword,
    logout,
  };
}
