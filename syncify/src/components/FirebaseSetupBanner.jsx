import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function FirebaseSetupBanner() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-lg w-full glass rounded-2xl p-8 border border-yellow-700/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Firebase Setup Required</h2>
            <p className="text-white/40 text-sm">Complete these steps to run Syncify</p>
          </div>
        </div>

        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-medium mb-1">Create a Firebase project</p>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                console.firebase.google.com <ExternalLink size={12} />
              </a>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-medium mb-1">Enable Realtime Database</p>
              <p className="text-white/40">Build → Realtime Database → Create database → Start in test mode</p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-medium mb-1">Enable Anonymous Authentication</p>
              <p className="text-white/40">Build → Authentication → Sign-in method → Anonymous → Enable</p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
            <div>
              <p className="font-medium mb-1">Paste your config into <code className="bg-white/10 px-1 rounded">src/firebase.js</code></p>
              <p className="text-white/40">Project Settings → Your apps → Web app → SDK config</p>
            </div>
          </li>
        </ol>

        <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-white/50 leading-relaxed">
          <p className="text-white/30 mb-2">// src/firebase.js</p>
          <p><span className="text-purple-400">apiKey</span>: <span className="text-green-400">"AIza..."</span>,</p>
          <p><span className="text-purple-400">databaseURL</span>: <span className="text-green-400">"https://your-app-default-rtdb.firebaseio.com"</span>,</p>
          <p><span className="text-purple-400">projectId</span>: <span className="text-green-400">"your-app"</span>,</p>
          <p className="text-white/20">// ... etc</p>
        </div>
      </div>
    </div>
  );
}
