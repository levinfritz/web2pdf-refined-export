
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UrlFormProps {
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

const UrlForm: React.FC<UrlFormProps> = ({ onUrlSubmit, isLoading }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    let processedUrl = url;
    
    // Add https:// if not present
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = `https://${url}`;
    }
    
    try {
      new URL(processedUrl);
      onUrlSubmit(processedUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
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
      <p className="text-xs text-muted-foreground">
        Enter any public webpage URL to create a beautifully formatted PDF
      </p>
    </form>
  );
};

export default UrlForm;
