import { Search, Bell, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logging out...",
      description: "You are being securely logged out.",
    });
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64"
                aria-label="Search"
              />
            </div>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">New notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
          </Button>
          
          {/* User Menu */}
          <Button variant="ghost" size="icon" aria-label="User menu">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" aria-hidden="true" />
            </div>
          </Button>

          {/* Logout Button */}
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
