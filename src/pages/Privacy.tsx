import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
      
      <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
          wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
          werden können.
        </p>

        <h3>Datenerfassung auf dieser Website</h3>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Die Kontaktdaten können Sie dem 
          Impressum dieser Website entnehmen.
        </p>

        <h2>2. Hosting und Content Delivery Networks (CDN)</h2>
        <h3>Externes Hosting</h3>
        <p>
          Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser 
          Website erfasst werden, werden auf den Servern des Hosters gespeichert.
        </p>

        <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
        <h3>Datenschutz</h3>
        <p>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
          personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser 
          Datenschutzerklärung.
        </p>

        <h2>4. Datenerfassung auf dieser Website</h2>
        <h3>Cookies</h3>
        <p>
          Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. 
          Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
        </p>

        <h2>5. Analyse-Tools und Werbung</h2>
        <p>
          Wir nutzen verschiedene Analyse-Tools, um die Nutzung unserer Website auszuwerten. Die daraus gewonnenen Daten 
          werden genutzt, um unsere Website zu optimieren.
        </p>

        <h2>6. Newsletter</h2>
        <p>
          Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse 
          sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind.
        </p>

        <h2>7. Plugins und Tools</h2>
        <p>
          Wir setzen verschiedene Plugins und Tools ein, um die Funktionalität unserer Website zu erweitern und die 
          Benutzerfreundlichkeit zu verbessern.
        </p>
      </div>
    </div>
  );
};

export default Privacy; 