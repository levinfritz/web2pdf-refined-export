import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const signupSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-Mail ist erforderlich" })
    .email({ message: "Ungültige E-Mail-Adresse" })
    .refine((email) => !email.endsWith('@example.com'), {
      message: "Beispiel-E-Mails sind nicht erlaubt"
    }),
  password: z
    .string()
    .min(1, { message: "Passwort ist erforderlich" })
    .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein" })
    .regex(/[A-Z]/, { message: "Passwort muss mindestens einen Großbuchstaben enthalten" })
    .regex(/[0-9]/, { message: "Passwort muss mindestens eine Zahl enthalten" }),
  confirmPassword: z.string().min(1, { message: "Passwort-Wiederholung ist erforderlich" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { signup, loginWithGoogle, loginWithGitHub, isLoading } = useAuth();
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    await signup(data.email, data.password);
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      await loginWithGoogle();
    } catch (error) {
      setSocialLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setSocialLoading('github');
    try {
      await loginWithGitHub();
    } catch (error) {
      setSocialLoading(null);
    }
  };

  // Animation variants für staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="text-center" variants={itemVariants}>
        <h2 className="text-2xl font-bold">Account erstellen</h2>
        <p className="text-muted-foreground mt-2">
          Registriere dich, um deine PDFs zu speichern und zu verwalten
        </p>
      </motion.div>
      
      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4" variants={itemVariants}>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@beispiel.de"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : "false"}
              className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Passwort wiederholen</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full transition-all duration-300 hover:shadow-md group" 
          disabled={isLoading || isSubmitting}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Account wird erstellt...
            </>
          ) : (
            <span className="transition-transform group-hover:translate-y-[-1px]">Registrieren</span>
          )}
        </Button>
      </motion.form>
      
      <motion.div className="relative" variants={itemVariants}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Oder fortfahren mit</span>
        </div>
      </motion.div>
      
      <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={isLoading || socialLoading !== null}
          className="relative transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          {socialLoading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleGithubLogin} 
          disabled={isLoading || socialLoading !== null}
          className="relative transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          {socialLoading === 'github' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github size={16} className="mr-2" />
          )}
          GitHub
        </Button>
      </motion.div>
      
      <motion.div className="text-center text-sm" variants={itemVariants}>
        <span className="text-muted-foreground">Bereits einen Account? </span>
        <Button 
          variant="link" 
          className="p-0 h-auto transition-colors duration-300 hover:text-primary/70" 
          onClick={onToggle}
        >
          Anmelden
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SignupForm;
