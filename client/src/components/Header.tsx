import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBadge } from "./NotificationBadge";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/dashboard/stats");
      return await response.json();
    },
  });

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-card border-b border-border z-30 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time threat monitoring and security analytics</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search threats, IPs, events..."
            className="w-64 pl-10 bg-muted border-input"
          />
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <NotificationBadge count={stats?.notificationCount || 0} />
          </Button>
        </div>
        
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
