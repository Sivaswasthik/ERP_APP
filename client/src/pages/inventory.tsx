import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import InventoryTable from "@/components/inventory/inventory-table";

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // The redirection is now handled by the useAuth hook and App.tsx
      // No explicit redirection needed here, just a toast notification
      toast({
        title: "Unauthorized",
        description: "You are logged out. Please log in.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Inventory Management" />
        <main className="flex-1 overflow-y-auto p-6">
          <InventoryTable />
        </main>
      </div>
    </div>
  );
}
