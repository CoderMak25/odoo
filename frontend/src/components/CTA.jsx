import { Link } from 'react-router-dom';
import { Zap, Rocket, MessageSquare } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-fuchsia-600/10 to-sky-600/20 p-6 md:p-8">
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40"
            style={{
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(56,189,248,0.5) 0%, rgba(0,0,0,0) 60%)'
            }}
          ></div>
          <div className="relative">
            <div className="text-xs text-indigo-200 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5" /> Get started in minutes
            </div>
            <h4 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
              Modern inventory without the mess
            </h4>
            <p className="mt-2 text-sm text-indigo-100/90">
              Replace manual logs and spreadsheets with a single source of truth. Simple for warehouse teams, powerful for managers.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2.5 hover:bg-white"
              >
                <Rocket className="h-4 w-4" />
                Create your account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 text-sm font-medium text-slate-100 px-4 py-2.5 hover:bg-white/20"
              >
                <MessageSquare className="h-4 w-4" />
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

