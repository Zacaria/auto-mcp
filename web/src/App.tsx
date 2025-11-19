import { useState } from 'react';
import { Button } from '@/components/ui/button';

function App() {
  const [url, setUrl] = useState('https://api.clubmed.com/doc/swagger.json');

  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <header>
          <p className="text-sm uppercase tracking-widest text-slate-500">OpenAPI → MCP</p>
          <h1 className="text-3xl font-semibold mt-2">OpenAPI MCP Builder</h1>
          <p className="text-base text-slate-600 mt-2">
            Paste an OpenAPI spec URL to generate Model Context Protocol tools and chat with them.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
          <label htmlFor="spec-url" className="text-sm font-medium text-slate-700">
            OpenAPI spec URL
          </label>
          <input
            id="spec-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="https://example.com/openapi.json"
          />
          <Button type="button" onClick={() => alert(`Spec URL capture only: ${url}`)}>
            Generate tools (placeholder)
          </Button>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-slate-500">
          Chat UI placeholder – will connect to OpenAI + MCP soon.
        </section>
      </div>
    </main>
  );
}

export default App;
