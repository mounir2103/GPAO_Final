import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen z-30 w-[250px]">
        <Sidebar
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          activeRoute={activeRoute}
          onToggleSidebar={handleToggleSidebar}
        />
      </aside>
      {/* Main area (header + content) */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-[80px]' : 'ml-[250px]'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20">
          <Header
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
