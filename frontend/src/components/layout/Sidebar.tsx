import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Boxes,
  Calculator,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

const NavItem = ({ to, label, icon, isActive, onClick }: NavItemProps) => (
  <Link
    to={to}
    className="w-full"
    onClick={onClick}
  >
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 font-normal",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

type SidebarProps = {
  isMobile?: boolean;
  isCollapsed: boolean;
  activeRoute: string;
  onToggleSidebar: () => void;
};

const Sidebar = ({ isMobile, isCollapsed, activeRoute, onToggleSidebar }: SidebarProps) => {
  const navigation = [
    {
      to: "/",
      label: "Tableau de Bord",
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/articles",
      label: "Articles",
      icon: <Package size={20} />,
    },
    {
      to: "/stock",
      label: "Stock",
      icon: <Boxes size={20} />,
    },
    {
      to: "/cbn",
      label: "Calcul CBN",
      icon: <Calculator size={20} />,
    },
    {
      to: "/reports",
      label: "Rapports",
      icon: <BarChart3 size={20} />,
    },
    {
      to: "/settings",
      label: "Paramètres",
      icon: <Settings size={20} />,
    },
  ];

  if (isMobile && isCollapsed) return null;

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-border">
        <div className="flex items-center">
          {!isCollapsed && <h1 className="text-xl font-bold">GPAO Nexus</h1>}
          {isCollapsed && <span className="text-xl font-bold">GN</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu size={20} />
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={!isCollapsed ? item.label : ""}
              icon={item.icon}
              isActive={activeRoute === item.to}
            />
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-primary-border text-sm">
        {!isCollapsed && <span>GPAO Nexus v1.0</span>}
      </div>
    </div>
  );
};

export default Sidebar;
