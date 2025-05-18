import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Header from "@/components/Header";

const Privacy: React.FC = () => {
  return (
    <div className="container max-w-6xl px-4">
      <Header />
      
      <main className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Datenschutzerklärung</h1>
          
          <Card className="shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold mt-0 pt-0 mb-4">1. Datenschutz auf einen Blick</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-medium mb-2">Allgemeine Hinweise</h3>
                  <p>
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                    wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
                    werden können.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-medium mb-2">Datenerfassung auf dieser Website</h3>
                  <p>
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Die Kontaktdaten können Sie dem 
                    Impressum dieser Website entnehmen.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">2. Hosting und Content Delivery Networks (CDN)</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-medium mb-2">Externes Hosting</h3>
                  <p>
                    Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser 
                    Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-medium mb-2">Datenschutz</h3>
                  <p>
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
                    personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser 
                    Datenschutzerklärung.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Datenerfassung auf dieser Website</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-medium mb-2">Cookies</h3>
                  <p>
                    Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. 
                    Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Analyse-Tools und Werbung</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Wir nutzen verschiedene Analyse-Tools, um die Nutzung unserer Website auszuwerten. Die daraus gewonnenen Daten 
                    werden genutzt, um unsere Website zu optimieren.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">6. Newsletter</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse 
                    sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">7. Plugins und Tools</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p>
                    Wir setzen verschiedene Plugins und Tools ein, um die Funktionalität unserer Website zu erweitern und die 
                    Benutzerfreundlichkeit zu verbessern.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Privacy; 