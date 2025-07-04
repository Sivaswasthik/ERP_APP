import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const logout = useCallback(async () => {
    setIsLoading(true); // Set loading to true during logout
    try {
      console.log("Logging out...");

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false); // Ensure isAuthenticated is false before redirect
      queryClient.clear(); // Clear all queries on logout
      setLocation("/login"); // Explicitly redirect to login page on logout
      setIsLoading(false); // Set loading to false after logout
    }
  }, [queryClient, setLocation]);

  const loadUserFromLocalStorage = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        logout(); // Clear invalid data
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [logout]); // Add logout to dependency array

  useEffect(() => {
    loadUserFromLocalStorage();
  }, [loadUserFromLocalStorage]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error(`Server responded with non-JSON: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Login failed with status: ${response.status}`);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role }));
      setUser({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role });
      setIsAuthenticated(true);
      queryClient.invalidateQueries(); // Invalidate all queries after login
      setLocation("/"); // Redirect to dashboard (root path) after successful login
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, setLocation]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error(`Server responded with non-JSON: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status: ${response.status}`);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role }));
      setUser({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role });
      setIsAuthenticated(true);
      queryClient.invalidateQueries(); // Invalidate all queries after registration
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
