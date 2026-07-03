import './globals.css';

export const metadata = {
  title: 'YMCA Trinity Group - Stakeholder CRM',
  description: 'Stakeholder Engagement CRM system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          <header className="header animate-fade-in">
            <h1>YMCA Trinity Group CRM</h1>
            <div className="badge badge-outline">Stakeholder Engagement</div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
