import { useNavigate } from 'react-router-dom';
import { Music2, Users, Zap, Globe, Shield, Headphones, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-rose-500/6 blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative flex items-center justify-between px-4 md:px-10 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg">
            <Music2 size={17} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Syncify</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/join')}
            className="px-3 py-1.5 rounded-xl glass text-xs font-medium hover:bg-white/8 transition-all">
            Join
          </button>
          <button onClick={() => navigate('/create')}
            className="px-3 py-1.5 rounded-xl gradient-btn text-xs font-semibold transition-all hover:opacity-90 shadow-lg">
            Create
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-16 pb-16 md:pt-24">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300 mb-8 border-cyan-500/20">
            <Sparkles size={11} />
            Real-time music sync · No account required
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            Music is better<br />
            <span className="shimmer-text">together.</span>
          </h1>

          <p className="text-base md:text-lg text-white/40 max-w-lg mx-auto mb-10 leading-relaxed">
            Create a room, share the link, and listen to YouTube songs
            in perfect sync — no matter where your friends are.
          </p>

          <div className="flex flex-row gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/create')}
              className="group flex items-center justify-center gap-2 px-6 py-3 gradient-btn rounded-2xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] shadow-xl shadow-cyan-500/20">
              Start a Room
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/join')}
              className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-2xl font-semibold text-sm hover:bg-white/8 transition-all hover:scale-[1.02]">
              Join with Code
            </button>
          </div>
        </div>

        {/* ── Mock player card ── */}
        <div className="relative mt-16 w-full max-w-sm mx-auto fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass-strong rounded-3xl p-5 glow-cyan">
            {/* Song row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center shadow-lg shrink-0">
                <Music2 size={22} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm truncate">Lo-fi Chill Beats</p>
                <p className="text-white/40 text-xs mt-0.5">3 friends listening</p>
              </div>
              {/* Live equaliser */}
              <div className="flex items-end gap-0.5 h-5">
                {[0.6,1,0.4,0.9,0.5].map((d,i) => (
                  <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.15}s`, height: `${d*16}px` }} />
                ))}
              </div>
            </div>
            {/* Progress */}
            <div className="h-1 rounded-full bg-white/8 overflow-hidden mb-2">
              <div className="h-full w-[58%] rounded-full"
                style={{ background: 'linear-gradient(90deg, #22d3ee, #818cf8)' }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/25">
              <span>1:47</span><span>3:12</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              {['A','J','S'].map((l,i) => (
                <div key={i} className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center text-xs font-bold border-2 border-[#080b14]"
                  style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 3-i }}>
                  {l}
                </div>
              ))}
              <span className="text-xs text-white/30 ml-2">+1 more</span>
              <div className="ml-auto flex items-center gap-1 text-xs text-cyan-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative px-6 py-16 max-w-4xl mx-auto">
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-10 font-medium">Everything included</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: <Globe size={18}/>, title: 'Cross-Device Sync', desc: 'Millisecond-accurate playback across any device.' },
            { icon: <Users size={18}/>, title: 'Shared Queue', desc: 'Everyone can search and add songs to the playlist.' },
            { icon: <Headphones size={18}/>, title: 'Room Chat', desc: 'Chat with friends while the music plays.' },
            { icon: <Zap size={18}/>, title: 'Instant Invite', desc: 'One link to share — no sign-up required.' },
            { icon: <Shield size={18}/>, title: 'Owner Controls', desc: 'The host has exclusive DJ controls.' },
            { icon: <Music2 size={18}/>, title: 'YouTube Library', desc: 'Search and play any song from YouTube.' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover:bg-white/6 transition-all group cursor-default"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:bg-cyan-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 py-20 text-center">
        <div className="glass-strong rounded-3xl max-w-lg mx-auto p-10">
          <h2 className="text-3xl font-bold mb-3">Ready to jam?</h2>
          <p className="text-white/40 text-sm mb-8">Create a room in under 10 seconds.</p>
          <button onClick={() => navigate('/create')}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 gradient-btn rounded-2xl font-semibold hover:opacity-90 transition-all">
            Create a Free Room
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/4 py-8 text-center text-white/15 text-xs">
        © 2025 Syncify — Listen Together
      </footer>
    </div>
  );
}
