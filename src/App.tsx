import { Layout } from "@/app/Layout";

function App() {
  return (
    <Layout>
      {/* Primary Preview Region */}
      <section className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col relative min-h-[400px]">
        <div className="flex-1 flex items-center justify-center p-8 text-center text-zinc-500">
          <p>Camera Pipeline will connect here in Checkpoint 2.</p>
        </div>
      </section>

      {/* Controls & Settings Sidebar */}
      <aside className="w-full md:w-80 flex flex-col gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 h-full flex items-center justify-center text-zinc-500">
          <p className="text-center text-sm">Controls Panel Placeholder</p>
        </div>
      </aside>
    </Layout>
  );
}

export default App;
