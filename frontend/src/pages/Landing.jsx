import Background from '../components/Background';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import OperationsNav from '../components/OperationsNav';
import HowItWorks from '../components/HowItWorks';
import Security from '../components/Security';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="antialiased bg-slate-950 text-slate-200 selection:bg-indigo-500/30 selection:text-slate-50 min-h-screen">
      <Background />
      <Header />
      <Hero />
      <Features />
      <OperationsNav />
      <HowItWorks />
      <Security />
      <CTA />
      <Footer />
    </div>
  );
}

