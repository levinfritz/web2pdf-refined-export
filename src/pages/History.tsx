
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Download, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

// Mock history data for demonstration
const mockHistoryItems = [
  {
    id: "pdf-1",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    title: "JavaScript | MDN",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "#",
  },
  {
    id: "pdf-2",
    url: "https://reactjs.org",
    title: "React – A JavaScript library for building user interfaces",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "#",
  },
  {
    id: "pdf-3",
    url: "https://tailwindcss.com/docs",
    title: "Tailwind CSS Documentation",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: "#",
  },
];

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historyItems] = useState(mockHistoryItems);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleRegenerate = (url: string) => {
    navigate(`/?url=${encodeURIComponent(url)}`);
  };

  const handleDownload = (pdfUrl: string) => {
    // In a real app, this would trigger a download
    toast.success("Download started");
    // Simulate download
    window.open(pdfUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 container max-w-6xl px-4">
          <Header />
          <main className="py-12 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <HistoryIcon size={48} className="mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">Sign in to view your history</h2>
              <p className="text-muted-foreground max-w-md">
                Create an account or sign in to save and access your PDF conversion history
              </p>
              <Button onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-6xl px-4">
        <Header />
        <main className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your PDF History</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              Convert New PDF
            </Button>
          </div>

          {historyItems.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <HistoryIcon size={48} className="mx-auto text-muted-foreground" />
              <h2 className="text-xl font-medium">No PDFs yet</h2>
              <p className="text-muted-foreground">
                Convert your first webpage to PDF to start building your history
              </p>
              <Button onClick={() => navigate("/")}>
                Convert a Webpage
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {historyItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:p-6 flex-grow">
                        <div className="flex flex-col">
                          <h3 className="font-medium text-lg truncate">{item.title}</h3>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground flex items-center hover:underline truncate"
                          >
                            {item.url}
                            <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                          </a>
                          <time className="text-xs text-muted-foreground mt-2">
                            Converted on {formatDate(item.createdAt)}
                          </time>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 p-4 md:border-l border-t md:border-t-0 bg-muted/30">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRegenerate(item.url)}
                        >
                          Regenerate
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(item.pdfUrl)}
                        >
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default History;
