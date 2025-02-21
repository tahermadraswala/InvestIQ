import { Search, Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground";
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/" className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              FinHub
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/')}`}>Dashboard</Link>
            <Link to="/markets" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/markets')}`}>Markets</Link>
            <Link to="/portfolio" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/portfolio')}`}>Portfolio</Link>
            <Link to="/news" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/news')}`}>News</Link>
            <Link to="/feature-x" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/feature-x')}`}>Stock Analyzer</Link>
            <Link to="/asset" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/asset')}`}>Asset Management</Link>
            <Link to="/FinancialCalculators" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/FinancialCalculators')}`}>FinancialCalculators</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search markets..."
                className="pl-9 pr-4 py-2 text-sm bg-secondary rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hover:scale-105 transition-transform ${isActive('/profile')}`}
              onClick={handleProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};