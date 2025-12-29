export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Scene Switch
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 pb-24 min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row gap-6">
        {children}
      </main>
    </div>
  );
}
