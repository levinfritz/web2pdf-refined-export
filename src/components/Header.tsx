import React from "react";
import { FileText, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import UserNav from "./auth/UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Header: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.header 
      className="w-full py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              className="bg-web2pdf-600 text-white p-2 rounded-lg transition-all duration-300 group-hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FileText size={24} />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Web2PDF<span className="text-web2pdf-600 transition-colors duration-300 group-hover:text-web2pdf-500">+</span>
            </h1>
          </Link>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-3"
          variants={itemVariants}
        >
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="transition-all duration-300 hover:shadow-sm"
            >
              <Link to="/history" className="group">
                <motion.div
                  className="inline-block"
                  whileHover={{ x: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <History size={16} className="mr-2" />
                </motion.div>
                <span className="transition-colors duration-300">{t("header.history")}</span>
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <UserNav />
        </motion.div>
      </motion.div>
      
      <motion.p 
        className="text-center mt-2 text-muted-foreground max-w-md mx-auto"
        variants={itemVariants}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {t("header.tagline", "Convert any webpage to a beautifully formatted PDF with customizable options")}
      </motion.p>
    </motion.header>
  );
};

export default Header;
