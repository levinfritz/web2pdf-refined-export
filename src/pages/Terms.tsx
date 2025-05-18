import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Header from "@/components/Header";

const Terms: React.FC = () => {
  return (
    <div className="container max-w-6xl px-4">
      <Header />
      
      <main className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Allgemeine Geschäftsbedingungen</h1>
          
          <Card className="shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold mt-0 pt-0 mb-4">1. Geltungsbereich</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Web2PDF+ Plattform. Mit der Nutzung unserer 
                    Dienste erklären Sie sich mit diesen Bedingungen einverstanden.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">2. Leistungsbeschreibung</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Web2PDF+ bietet einen Service zur Konvertierung von Webseiten in PDF-Dokumente. Die genauen Funktionen und 
                    Leistungsmerkmale ergeben sich aus der jeweiligen Produktbeschreibung auf unserer Website.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">3. Nutzungsrechte</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Mit der Nutzung unseres Services erhalten Sie das nicht-exklusive, nicht übertragbare Recht, die Plattform im 
                    Rahmen dieser Bedingungen zu nutzen. Sie sind nicht berechtigt, den Service für illegale Zwecke zu verwenden.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">4. Preise und Zahlungsbedingungen</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Die Nutzung der Grundfunktionen ist kostenlos. Für erweiterte Funktionen können Gebühren anfallen, die sich aus 
                    der aktuellen Preisliste ergeben. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">5. Datenschutz</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Der Schutz Ihrer persönlichen Daten ist uns wichtig. Informationen zur Verarbeitung Ihrer Daten finden Sie in 
                    unserer Datenschutzerklärung.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">6. Haftung</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Wir haften nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten unsererseits beruhen. Die 
                    Haftung für leichte Fahrlässigkeit ist ausgeschlossen.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">7. Änderungen der AGB</h2>
                <div className="bg-muted/50 p-6 rounded-lg mb-6">
                  <p>
                    Wir behalten uns vor, diese AGB jederzeit zu ändern. Die Änderungen werden Ihnen rechtzeitig vor Inkrafttreten 
                    mitgeteilt. Ihr Einverständnis gilt als erteilt, wenn Sie nicht innerhalb einer angemessenen Frist widersprechen.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-4">8. Schlussbestimmungen</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p>
                    Es gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die 
                    Wirksamkeit der übrigen Bestimmungen unberührt.
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

export default Terms; 