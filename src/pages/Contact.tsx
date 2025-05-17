import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  subject: z.string().min(3, 'Betreff muss mindestens 3 Zeichen lang sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
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
      // Hier würde normalerweise der API-Aufruf stattfinden
      console.log('Form data:', data);
      
      // Simuliere API-Verzögerung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Nachricht erfolgreich gesendet!');
      reset();
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht. Bitte versuche es später erneut.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Kontakt</h1>
      
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Haben Sie Fragen oder Anregungen? Wir freuen uns über Ihre Nachricht und werden uns zeitnah bei Ihnen melden.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">E-Mail</h3>
            <p className="text-muted-foreground">
              <a href="mailto:support@web2pdf.plus" className="hover:text-foreground transition-colors">
                support@web2pdf.plus
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Adresse</h3>
            <p className="text-muted-foreground">
              Web2PDF+ GmbH<br />
              Musterstraße 123<br />
              12345 Berlin<br />
              Deutschland
            </p>
          </div>
        </div>
        
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
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact; 