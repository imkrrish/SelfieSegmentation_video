export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background grid grid-rows-[auto_1fr] overflow-hidden">
      <header className="border-b bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-12 flex items-center">
          <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Scene Switch
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 overflow-auto max-h-[calc(100dvh-3.5rem)] md:p-6 pb-24 flex-1 flex flex-col lg:flex-row gap-6">
        {children}
      </main>
    </div>
  );
}
