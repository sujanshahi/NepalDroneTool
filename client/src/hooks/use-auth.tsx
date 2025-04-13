import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// User login schema
const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, 'password'>, Error, z.infer<typeof loginSchema>>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, 'password'>, Error, z.infer<typeof insertUserSchema>>;
};

type LoginData = z.infer<typeof loginSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Create a mock user instead of fetching from the API
  const mockUser: SelectUser = {
    id: 1,
    username: 'demo_user',
    password: '', // empty password since this is just a mock
    email: 'demo@example.com',
    fullName: 'Demo User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: 'user'
  };
  
  // Bypass the API call and set a static mock user
  const user = mockUser;
  const error = null;
  const isLoading = false;

  // Create mock mutations that don't make API calls
  const loginMutation = {
    mutate: () => {
      console.log('Login bypassed');
      toast({
        title: "Login successful",
        description: `Welcome back, ${mockUser.username}!`,
      });
    },
    isPending: false,
    error: null,
    data: undefined,
    mutateAsync: async () => mockUser,
    reset: () => {},
    status: 'idle',
    variables: undefined,
    context: undefined,
    isError: false,
    isIdle: true,
    isPaused: false,
    isSuccess: false,
  } as unknown as UseMutationResult<Omit<SelectUser, 'password'>, Error, LoginData>;

  const registerMutation = {
    mutate: () => {
      console.log('Registration bypassed');
      toast({
        title: "Registration successful",
        description: `Welcome, ${mockUser.username}!`,
      });
    },
    isPending: false,
    error: null,
    data: undefined,
    mutateAsync: async () => mockUser,
    reset: () => {},
    status: 'idle',
    variables: undefined,
    context: undefined,
    isError: false,
    isIdle: true,
    isPaused: false,
    isSuccess: false,
  } as unknown as UseMutationResult<Omit<SelectUser, 'password'>, Error, z.infer<typeof insertUserSchema>>;

  const logoutMutation = {
    mutate: () => {
      console.log('Logout bypassed');
      toast({
        title: "Logged out",
        description: "You have successfully logged out",
      });
    },
    isPending: false,
    error: null,
    data: undefined,
    mutateAsync: async () => {},
    reset: () => {},
    status: 'idle',
    variables: undefined,
    context: undefined,
    isError: false,
    isIdle: true,
    isPaused: false,
    isSuccess: false,
  } as unknown as UseMutationResult<void, Error, void>;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}