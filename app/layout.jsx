import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './providers';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Live Polling Platform',
  description: 'Create and participate in live polls and surveys',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="bg-[#0f172a] text-white">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16 pb-14"> {/* Add padding to account for fixed header/footer */}
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}