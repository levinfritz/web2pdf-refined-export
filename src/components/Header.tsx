
import React from "react";
import { FileText } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full py-6">
      <div className="flex items-center justify-center gap-2">
        <div className="bg-web2pdf-600 text-white p-2 rounded-lg">
          <FileText size={24} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Web2PDF<span className="text-web2pdf-600">+</span>
        </h1>
      </div>
      <p className="text-center mt-2 text-muted-foreground max-w-md mx-auto">
        Convert any webpage to a beautifully formatted PDF with customizable options
      </p>
    </header>
  );
};

export default Header;
