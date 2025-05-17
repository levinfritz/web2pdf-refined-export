import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
      
      <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Web2PDF+ Plattform. Mit der Nutzung unserer 
          Dienste erklären Sie sich mit diesen Bedingungen einverstanden.
        </p>

        <h2>2. Leistungsbeschreibung</h2>
        <p>
          Web2PDF+ bietet einen Service zur Konvertierung von Webseiten in PDF-Dokumente. Die genauen Funktionen und 
          Leistungsmerkmale ergeben sich aus der jeweiligen Produktbeschreibung auf unserer Website.
        </p>

        <h2>3. Nutzungsrechte</h2>
        <p>
          Mit der Nutzung unseres Services erhalten Sie das nicht-exklusive, nicht übertragbare Recht, die Plattform im 
          Rahmen dieser Bedingungen zu nutzen. Sie sind nicht berechtigt, den Service für illegale Zwecke zu verwenden.
        </p>

        <h2>4. Preise und Zahlungsbedingungen</h2>
        <p>
          Die Nutzung der Grundfunktionen ist kostenlos. Für erweiterte Funktionen können Gebühren anfallen, die sich aus 
          der aktuellen Preisliste ergeben. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
        </p>

        <h2>5. Datenschutz</h2>
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Informationen zur Verarbeitung Ihrer Daten finden Sie in 
          unserer Datenschutzerklärung.
        </p>

        <h2>6. Haftung</h2>
        <p>
          Wir haften nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten unsererseits beruhen. Die 
          Haftung für leichte Fahrlässigkeit ist ausgeschlossen.
        </p>

        <h2>7. Änderungen der AGB</h2>
        <p>
          Wir behalten uns vor, diese AGB jederzeit zu ändern. Die Änderungen werden Ihnen rechtzeitig vor Inkrafttreten 
          mitgeteilt. Ihr Einverständnis gilt als erteilt, wenn Sie nicht innerhalb einer angemessenen Frist widersprechen.
        </p>

        <h2>8. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die 
          Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </div>
    </div>
  );
};

export default Terms; 