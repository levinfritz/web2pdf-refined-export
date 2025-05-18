import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      toast.error("Bitte melde dich an oder erstelle einen Account, um PDFs zu generieren");
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
      toast.error("Please enter a valid URL");
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
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Convert"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Benutzername eingeben"
              disabled={isLoading}
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
