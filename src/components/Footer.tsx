
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Web2PDF+ &copy; {new Date().getFullYear()} 
        </p>
        <p className="mt-1">
          <a 
            href="#" 
            className="text-web2pdf-600 hover:text-web2pdf-700 underline underline-offset-2"
          >
            Privacy
          </a>
          {" • "}
          <a 
            href="#" 
            className="text-web2pdf-600 hover:text-web2pdf-700 underline underline-offset-2"
          >
            Terms
          </a>
          {" • "}
          <a 
            href="#" 
            className="text-web2pdf-600 hover:text-web2pdf-700 underline underline-offset-2"
          >
            Contact
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
