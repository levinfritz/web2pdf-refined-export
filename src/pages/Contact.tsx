import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import Header from "@/components/Header";
import emailjs from 'emailjs-com';

// EmailJS configuration keys
// Normally these would be in environment variables
const EMAILJS_SERVICE_ID = 'service_36ir31n'; // Your service ID
const EMAILJS_TEMPLATE_ID = 'template_o7ly4st'; // Your template ID
const EMAILJS_USER_ID = 'fgIKeHPKwZTZx28Nn'; // Your public key

const contactSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  subject: z.string().min(3, 'Betreff muss mindestens 3 Zeichen lang sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailJSInitialized, setIsEmailJSInitialized] = useState(false);
  
  // Initialize EmailJS
  useEffect(() => {
    // This is only needed once per session
    try {
      emailjs.init(EMAILJS_USER_ID);
      setIsEmailJSInitialized(true);
    } catch (error) {
      console.error('Error initializing EmailJS:', error);
    }
  }, []);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // EmailJS configuration
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        to_email: 'stiefel301@gmail.com', // Primary recipient
        subject: data.subject,
        message: data.message,
      };
      
      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      
      console.log('EmailJS response:', response);
      setEmailSent(true);
      toast.success('Nachricht erfolgreich gesendet!');
      reset();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Fehler beim Senden der Nachricht. Bitte versuche es später erneut.');
    }
  };

  return (
    <div className="container max-w-6xl px-4">
      <Header />
      
      <main className="py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Kontakt</h1>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Haben Sie Fragen oder Anregungen? Wir freuen uns über Ihre Nachricht und werden uns zeitnah bei Ihnen melden.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">E-Mail</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:stiefel301@gmail.com" className="hover:text-foreground transition-colors">
                      stiefel301@gmail.com
                    </a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Adresse</h3>
                  <p className="text-muted-foreground">
                    Web2PDF+ GmbH<br />
                    Böhlstrasse 6<br />
                    9300 Wittenbach<br />
                    Schweiz
                  </p>
                </div>
              </div>
              
              {emailSent ? (
                <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-semibold mb-2">Vielen Dank für Ihre Nachricht!</h3>
                  <p className="mb-4">Wir werden uns so schnell wie möglich bei Ihnen melden.</p>
                  <Button onClick={() => setEmailSent(false)}>Neue Nachricht senden</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Max Mustermann"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="max@beispiel.de"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff</Label>
                    <Input
                      id="subject"
                      {...register('subject')}
                      placeholder="Wie können wir Ihnen helfen?"
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Ihre Nachricht an uns..."
                      rows={6}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting || !isEmailJSInitialized}>
                    {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact; 