import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrlFormProps {
  onUrlSubmit: (url: string, auth?: { username: string; password: string }) => void;
  isLoading: boolean;
}

const UrlForm: React.FC<UrlFormProps> = ({ onUrlSubmit, isLoading }) => {
  const [url, setUrl] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth();

  // Animierte Toast-Funktion
  const showAnimatedToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast[type](message, {
      className: "animate-in slide-in-from-top-full duration-300",
      duration: 3000,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url) {
      showAnimatedToast("Please enter a URL", "error");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      showAnimatedToast("Bitte melde dich an oder erstelle einen Account, um PDFs zu generieren", "error");
      return;
    }
    
    let processedUrl = url;
    
    // Add https:// if not present
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = `https://${url}`;
    }
    
    try {
      new URL(processedUrl);
      
      if (requiresAuth && (username.trim() || password.trim())) {
        onUrlSubmit(processedUrl, { username, password });
      } else {
        onUrlSubmit(processedUrl);
      }
    } catch (e) {
      showAnimatedToast("Please enter a valid URL", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., wikipedia.org)"
          className="flex-1 transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className={cn(
            "transition-all duration-300",
            isLoading ? "animate-pulse" : ""
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Converting...</span>
            </div>
          ) : (
            <span>Convert</span>
          )}
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="requires-auth" 
          checked={requiresAuth} 
          onCheckedChange={(checked) => setRequiresAuth(checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="requires-auth">Website erfordert Authentifizierung</Label>
      </div>
      
      {requiresAuth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top duration-300">
          <div>
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername eingeben"
              disabled={isLoading}
              className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
            />
          </div>
          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              disabled={isLoading}
              className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
            />
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Enter any public webpage URL to create a beautifully formatted PDF
      </p>
    </form>
  );
};

export default UrlForm;
