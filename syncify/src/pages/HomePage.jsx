import { useNavigate } from 'react-router-dom';
import { Music, Users, Zap, Globe, Shield, Headphones } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <Music size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight">Syncify</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/join')}
            className="px-4 py-2 rounded-full border border-white/20 text-sm hover:border-purple-500 hover:text-purple-400 transition-colors"
          >
            Join Room
          </button>
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors"
          >
            Create Room
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

        <div className="relative fade-in">
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-6">
            <Zap size={12} />
            Real-time music sync for everyone
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Listen Together,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Anywhere
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Create a music room, invite friends, and experience perfectly
            synchronized playback — no matter where you are in the world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-lg transition-all hover:scale-105 glow-purple"
            >
              Create a Room
            </button>
            <button
              onClick={() => navigate('/join')}
              className="w-full sm:w-auto px-8 py-4 glass rounded-full font-semibold text-lg hover:border-purple-500/50 transition-all hover:scale-105"
            >
              Join with Code
            </button>
          </div>
        </div>

        {/* Floating album art mockup */}
        <div className="relative mt-16 w-full max-w-3xl mx-auto fade-in">
          <div className="glass rounded-2xl p-6 glow-purple-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shrink-0">
                <Music size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">Now Playing in Room</div>
                <div className="text-white/40 text-sm">4 people listening</div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-500 rounded-full pulse-purple"
                    style={{
                      height: `${12 + Math.sin(i * 1.3) * 10}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fake progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
              <div className="h-full w-2/3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-white/30">
              <span>2:14</span>
              <span>3:28</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-12">
          Everything you need for a shared session
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Globe size={24} />,
              title: 'Cross-Device Sync',
              desc: 'Millisecond-accurate playback sync across phones, tablets, and desktops.',
            },
            {
              icon: <Users size={24} />,
              title: 'Shared Playlist',
              desc: 'Everyone in the room can search and add YouTube songs to the queue.',
            },
            {
              icon: <Headphones size={24} />,
              title: 'Room Chat',
              desc: 'React in real time with a built-in chat while the music plays.',
            },
            {
              icon: <Zap size={24} />,
              title: 'Instant Invite',
              desc: 'Share a single link — no account required to join.',
            },
            {
              icon: <Shield size={24} />,
              title: 'Owner Controls',
              desc: 'The room owner has exclusive playback control. Others can suggest songs.',
            },
            {
              icon: <Music size={24} />,
              title: 'YouTube Library',
              desc: 'Search millions of tracks powered by the YouTube Data API.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 hover:border-purple-700/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-900/60 flex items-center justify-center text-purple-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to listen together?</h2>
        <p className="text-white/40 mb-8">Create a free room in seconds.</p>
        <button
          onClick={() => navigate('/create')}
          className="px-10 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-bold text-lg transition-all hover:scale-105 glow-purple"
        >
          Get Started
        </button>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-white/20 text-sm">
        © 2024 Syncify — Listen Together
      </footer>
    </div>
  );
}
