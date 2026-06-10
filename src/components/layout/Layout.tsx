import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/** Public site shell: navbar + routed page + footer. */
export function Layout() {
  return (
    <div className="min-h-screen w-full bg-[#0d0a14] py-4 px-2 sm:py-8 sm:px-6 md:py-12 md:px-12 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background ambient lighting blobs */}
      <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-[var(--color-secondary)]/20 blur-[150px] pointer-events-none" />

      {/* Main framed card canvas */}
      <div className="w-full max-w-7xl bg-white border border-slate-200/50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col overflow-hidden relative z-10 flex-1 min-h-[85vh]">
        <Navbar />
        <main className="flex-1 flex flex-col relative z-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
