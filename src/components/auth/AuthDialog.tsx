
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

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

  const toggleView = () => {
    setView(view === "login" ? "signup" : "login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {view === "login" ? "Welcome Back" : "Join Web2PDF+"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {view === "login"
              ? "Log in to access your PDF conversion history"
              : "Create an account to save and manage your PDFs"}
          </DialogDescription>
        </DialogHeader>
        
        {view === "login" ? (
          <LoginForm onToggle={toggleView} />
        ) : (
          <SignupForm onToggle={toggleView} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
