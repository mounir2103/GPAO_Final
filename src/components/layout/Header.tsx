
import { useState } from "react";
import { Bell, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type HeaderProps = {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<number>(3);

  return (
    <header className="w-full h-16 bg-background border-b border-border px-4 flex items-center justify-between">
      <div className="flex-1">
        {isMobile && <h1 className="text-lg font-bold">GPAO Nexus</h1>}
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifications(0)}>
          <Bell size={20} />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>
        
        <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        <Button variant="ghost" size="icon">
          <User size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
