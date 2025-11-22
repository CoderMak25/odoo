import { Link } from 'react-router-dom';
import { ShieldCheck, Bolt, PlayCircle, Timer, ScanLine, Building2 } from 'lucide-react';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 pt-6 md:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            New: OTP-based password reset
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-semibold tracking-tight text-slate-50">
            Inventory, in real time. Zero spreadsheets.
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-300">
            StockMaster centralizes products, receipts, deliveries, transfers, and adjustments—so teams move faster with accurate, live stock levels across every warehouse.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors">
              <Bolt className="h-4 w-4" />
              Start free
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors">
              <PlayCircle className="h-4 w-4" />
              Book a demo
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5" />
              Live KPIs
            </div>
            <div className="flex items-center gap-2">
              <ScanLine className="h-3.5 w-3.5" />
              SKU search
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Multi-warehouse
            </div>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

