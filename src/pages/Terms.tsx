import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using Minor Hockey Talks, you accept and agree to be bound by the terms 
            and provision of this agreement. These terms apply to all visitors, users, and others who 
            access or use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="text-muted-foreground">
            Permission is granted to temporarily use Minor Hockey Talks for personal, non-commercial 
            transitory viewing only. This is the grant of a license, not a transfer of title, and 
            under this license you may not:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
          <p className="text-muted-foreground">
            Users agree to use the forum in a respectful manner. Prohibited activities include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Posting offensive, abusive, or discriminatory content</li>
            <li>Harassing other users</li>
            <li>Sharing personal information of others without consent</li>
            <li>Spamming or excessive self-promotion</li>
            <li>Posting illegal content or content that violates copyright</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Content Policy</h2>
          <p className="text-muted-foreground">
            All content posted on Minor Hockey Talks must be relevant to minor hockey. We reserve 
            the right to moderate, edit, or remove content that violates our community guidelines 
            or these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Privacy</h2>
          <p className="text-muted-foreground">
            Your privacy is important to us. Please review our Privacy Policy, which also governs 
            your use of the service, to understand our practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
          <p className="text-muted-foreground">
            The materials on Minor Hockey Talks are provided on an 'as is' basis. Minor Hockey Talks 
            makes no warranties, expressed or implied, and hereby disclaims and negates all other 
            warranties including without limitation, implied warranties or conditions of merchantability, 
            fitness for a particular purpose, or non-infringement of intellectual property or other 
            violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitations</h2>
          <p className="text-muted-foreground">
            In no event shall Minor Hockey Talks or its suppliers be liable for any damages (including, 
            without limitation, damages for loss of data or profit, or due to business interruption) 
            arising out of the use or inability to use the materials on Minor Hockey Talks, even if 
            Minor Hockey Talks or its authorized representatives have been notified orally or in writing 
            of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Revisions</h2>
          <p className="text-muted-foreground">
            Minor Hockey Talks may revise these terms of service at any time without notice. By using 
            this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms & Conditions, please contact us through our 
            contact form or email us directly.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;