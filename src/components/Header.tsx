
import React from "react";
import { FileText, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import UserNav from "./auth/UserNav";
import { useAuth } from "@/contexts/AuthContext";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="w-full py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-web2pdf-600 text-white p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Web2PDF<span className="text-web2pdf-600">+</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">
                <History size={16} className="mr-2" />
                History
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
      <p className="text-center mt-2 text-muted-foreground max-w-md mx-auto">
        Convert any webpage to a beautifully formatted PDF with customizable options
      </p>
    </header>
  );
};

export default Header;
