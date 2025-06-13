import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { AnimatePresence, motion } from "framer-motion";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "signup";
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onOpenChange,
  defaultView = "login",
}) => {
  const [view, setView] = useState<"login" | "signup">(defaultView);

  // Reset view when defaultView changes
  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

  const toggleView = () => {
    setView(view === "login" ? "signup" : "login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] animate-in fade-in-50 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top duration-300">
          <DialogTitle className="text-center">
            {view === "login" ? "Welcome Back" : "Join Web2PDF+"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {view === "login"
              ? "Log in to access your PDF conversion history"
              : "Create an account to save and manage your PDFs"}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === "login" ? (
              <LoginForm onToggle={toggleView} />
            ) : (
              <SignupForm onToggle={toggleView} />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
