import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const IPFS_BASE = "https://bafybeibcfudxeu2745vdtfvzsmxf2i4wjgishoaccqku7ey4wryfnheaku.ipfs.w3s.link/";
const SHOWCASE_IDS = [1, 2, 3, 4, 5, 6, 7, 8]; 
const CONTRACT_ADDRESS = "0x596C8B84f62F6e1B0AFa1989083839a5F208153f";
const RPC_URL = "https://rpc.monad.xyz";
const MAX_SUPPLY = 888;

// --- HOOKS ---

// Hook to fetch Mint Count from Monad RPC
const useMintSupply = () => {
  const [supply, setSupply] = useState<number | null>(null);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        // Function selector for totalSupply() is 0x18160ddd
        const payload = {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [{
                to: CONTRACT_ADDRESS,
                data: "0x18160ddd"
            }, "latest"]
        };

        const response = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.result) {
            const count = parseInt(data.result, 16);
            setSupply(count);
        }
      } catch (e) {
        console.error("Failed to fetch supply from Monad", e);
      }
    };

    fetchSupply();
    const interval = setInterval(fetchSupply, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return supply;
};

// --- COMPONENTS ---

const IntroBoot = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const bootSequence = [
      "MONAD BIOS v1.0.4",
      "Checking Mana Levels... 100% OK",
      "Loading Pixel Engine...",
      "Materializing Sprites...",
      "Opening Portal to Realm...",
      "OK."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 300 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col justify-start items-start p-10 font-vt text-green-500 text-2xl leading-relaxed cursor-wait">
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <div className="animate-pulse mt-2">_</div>
    </div>
  );
};

const SoundController = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleSound = () => {
    if (isMuted) {
      // Init Audio Context on first click
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        
        // Create a low drone sound (Retro Ambience)
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, audioCtxRef.current.currentTime); // Low drone
        
        // LFO for texture
        const lfo = audioCtxRef.current.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, audioCtxRef.current.currentTime);
        const lfoGain = audioCtxRef.current.createGain();
        lfoGain.gain.setValueAtTime(500, audioCtxRef.current.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        lfo.start();

        // Lowpass filter to make it distant
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioCtxRef.current.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        
        osc.start();
        gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime); // Very quiet

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      }
      audioCtxRef.current?.resume();
    } else {
      audioCtxRef.current?.suspend();
    }
    setIsMuted(!isMuted);
  };

  return (
    <button 
      onClick={toggleSound}
      className="fixed bottom-6 right-6 z-50 font-pixel text-[8px] md:text-[10px] text-[#d946ef] border-2 border-[#d946ef] p-2 md:p-3 bg-black hover:bg-[#d946ef] hover:text-black transition-colors"
    >
      {isMuted ? "🔇 SOUND" : "🔊 AMBIENCE"}
    </button>
  );
};

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-[#d946ef] opacity-20 animate-float"
          style={{
            width: Math.random() > 0.5 ? '4px' : '8px',
            height: Math.random() > 0.5 ? '4px' : '8px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${10 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

const RetroTerminal = () => {
  const [logs, setLogs] = useState<string[]>([
    "> System initialized...",
    "> Linking to Monad Realm...",
  ]);

  useEffect(() => {
    // GAME LORE TERMS (No Web3 Jargon)
    const possibleLogs = [
      "Scan complete. Sector safe.",
      "Detected mana spike in Zone 7.",
      "Molandak #142 is resting.",
      "Reading Astral Archives...",
      "Spirit Satchel synced.",
      "Waiting for new summoner...",
      "Atmosphere: 8-bit stable.",
      "Checking Mana Leylines...",
      "Dimensional rift stable.",
      "Loading texture pack...",
      "NPCs are wandering..."
    ];

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = `> ${possibleLogs[Math.floor(Math.random() * possibleLogs.length)]}`;
        const newState = [...prev, newLog];
        return newState.slice(-5); // Keep last 5
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden lg:block w-72 opacity-80 hover:opacity-100 transition-opacity">
      <div className="bg-[#05020a]/90 border border-[#2d1b4e] p-4 font-vt text-sm text-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <div className="mb-2 border-b border-green-900 pb-1 text-xs opacity-50 flex justify-between">
            <span>WORLD_STATUS</span>
            <span>ONLINE</span>
        </div>
        {logs.map((log, i) => (
          <div key={i} className="animate-typewriter overflow-hidden whitespace-nowrap">
            {log}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};

const ShowcaseMarquee = () => {
  return (
    <div className="w-full overflow-hidden py-16 bg-[#0a0514]/80 border-y-4 border-[#2d1b4e] relative group backdrop-blur-sm">
       <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#05020a] to-transparent z-10 pointer-events-none"></div>
       <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05020a] to-transparent z-10 pointer-events-none"></div>
       
      <div className="flex w-[200%] animate-scroll hover:[animation-play-state:paused]">
        {[...SHOWCASE_IDS, ...SHOWCASE_IDS, ...SHOWCASE_IDS].map((id, index) => (
          <div key={index} className="flex-shrink-0 mx-6 transition-transform hover:scale-110 duration-200 cursor-pointer">
             <div className="w-64 h-64 md:w-80 md:h-80 bg-[#1a1025] shadow-[8px_8px_0px_0px_rgba(76,29,149,0.5)] border-4 border-[#4c1d95] hover:border-[#d946ef] hover:shadow-[8px_8px_0px_0px_rgba(217,70,239,0.5)] transition-all">
                <img 
                  src={`${IPFS_BASE}${id}.png`} 
                  alt={`Molandak #${id}`}
                  className="w-full h-full object-cover rendering-pixelated" 
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2e1a47/FFF?text=Loading...';
                  }}
                />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [booted, setBooted] = useState(false);
  const supply = useMintSupply();
  const [logoClicks, setLogoClicks] = useState(0);
  const [summoned, setSummoned] = useState<number | null>(null);

  const handleLogoClick = () => {
    setLogoClicks(prev => prev + 1);
    if (logoClicks + 1 === 5) {
      triggerSummon();
      setLogoClicks(0);
    }
  };

  const triggerSummon = () => {
    const randomId = Math.floor(Math.random() * 8) + 1;
    setSummoned(randomId);
    // Removed auto-close timeout to let user enjoy the "encounter"
  };

  if (!booted) {
    return <IntroBoot onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#05020a] text-white selection:bg-[#d946ef] selection:text-black relative overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes chromatic {
          0% { text-shadow: 2px 0 #ff0000, -2px 0 #0000ff; }
          50% { text-shadow: -2px 0 #ff0000, 2px 0 #0000ff; }
          100% { text-shadow: 2px 0 #ff0000, -2px 0 #0000ff; }
        }
        @keyframes flash {
            0% { background-color: white; opacity: 0.8; }
            100% { background-color: transparent; opacity: 0; }
        }
        .animate-scroll { animation: scroll 40s linear infinite; }
        .animate-float { animation: float linear infinite; }
        .animate-chromatic { animation: chromatic 2s infinite linear; }
        .rendering-pixelated { image-rendering: pixelated; }
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        .font-vt { font-family: 'VT323', monospace; }
        
        /* CRT & DISTORTION */
        .scanline {
            background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%);
            background-size: 100% 3px;
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 50; pointer-events: none;
            opacity: 0.4;
            mix-blend-mode: overlay;
        }
        .vignette {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 51; pointer-events: none;
            background: radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.8) 100%);
        }
        
        /* NEW: DITHERING TEXTURE */
        .bg-dither {
            background-image: radial-gradient(#1a1025 1px, transparent 1px);
            background-size: 4px 4px;
            opacity: 0.3;
        }

        /* NEW: RETRO GRID MAP */
        .bg-grid {
             background-image: 
                linear-gradient(to right, rgba(45, 27, 78, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(45, 27, 78, 0.3) 1px, transparent 1px);
            background-size: 40px 40px;
            perspective: 1000px;
            transform-style: preserve-3d;
        }

        /* NEW: PIXEL CIRCLE CLIP PATH (Octagonal-ish) */
        .pixel-circle-frame {
            clip-path: polygon(
                20px 0, calc(100% - 20px) 0, 
                100% 20px, 100% calc(100% - 20px), 
                calc(100% - 20px) 100%, 20px 100%, 
                0 calc(100% - 20px), 0 20px
            );
        }
        
        .retro-shadow { text-shadow: 4px 4px 0px #4c1d95; }
        .btn-retro { box-shadow: 4px 4px 0px 0px #ffffff; }
        .btn-retro:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0px 0px #ffffff; }
        .btn-retro:active { transform: translate(4px, 4px); box-shadow: 0px 0px 0px 0px #ffffff; }
        
        .btn-primary { box-shadow: 4px 4px 0px 0px #4c1d95; }
        .btn-primary:hover { transform: translate(2px, 2px); box-shadow: 2px 2px 0px 0px #4c1d95; }

        .battle-flash {
            animation: flash 0.5s ease-out forwards;
        }
      `}</style>

      {/* TIER S: EFFECTS */}
      <div className="fixed inset-0 bg-[#05020a] -z-20"></div>
      <div className="fixed inset-0 bg-grid -z-10"></div>
      <div className="fixed inset-0 bg-dither pointer-events-none -z-10"></div>
      
      <div className="scanline"></div>
      <div className="vignette"></div>
      <ParticleBackground />
      <SoundController />
      <RetroTerminal />

      {/* EASTER EGG SUMMON OVERLAY (Battle Style) */}
      {summoned && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
            <div className="absolute inset-0 bg-white/20 battle-flash pointer-events-none"></div>
            
            <div className="relative p-8 max-w-md w-full mx-4 text-center">
                <h2 className="font-pixel text-[#d946ef] text-sm md:text-lg mb-8 animate-chromatic leading-relaxed">
                   ⚠️ A WILD MOLANDAK APPEARED!
                </h2>
                
                {/* PIXEL CIRCLE FRAME */}
                <div className="relative mx-auto mb-10 w-64 h-64 pixel-circle-frame bg-[#1a1025] border-[4px] border-[#d946ef] shadow-[0_0_60px_rgba(217,70,239,0.4)] flex items-center justify-center overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                     <img 
                        src={`${IPFS_BASE}${summoned}.png`} 
                        className="w-[90%] h-[90%] object-contain rendering-pixelated animate-bounce"
                        style={{ animationDuration: '2s' }}
                    />
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setSummoned(null)}
                        className="font-pixel text-[10px] bg-white text-black px-6 py-4 hover:bg-red-500 hover:text-white transition-colors uppercase btn-retro"
                    >
                        RUN AWAY
                    </button>
                    <a 
                        href="https://www.scatter.art/collection/pixel-molandak"
                        target="_blank"
                        rel="noreferrer"
                        className="font-pixel text-[10px] bg-[#d946ef] text-black px-6 py-4 hover:bg-[#f0abfc] transition-colors uppercase btn-primary"
                    >
                        CATCH (MINT)
                    </a>
                </div>
            </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-[60] px-6 py-6 flex justify-between items-center bg-[#05020a]/80 backdrop-blur-md border-b-2 border-[#2d1b4e]">
        <div 
          onClick={handleLogoClick}
          className="font-pixel text-xs md:text-sm text-[#d946ef] tracking-widest hover:text-white transition-colors cursor-pointer select-none"
        >
            PIXEL MOLANDAK {logoClicks > 0 && <span className="text-[10px] text-gray-500 ml-2">({logoClicks}/5)</span>}
        </div>
        <div className="flex gap-4 md:gap-8 items-center">
            <a href="https://x.com/pixelmolandak" target="_blank" rel="noreferrer" className="hidden md:block font-vt text-2xl text-gray-400 hover:text-white uppercase hover:animate-pulse">
                Twitter
            </a>
            <a href="https://opensea.io/" target="_blank" rel="noreferrer" className="font-pixel text-[10px] md:text-xs bg-[#1a1025] border-2 border-white text-white px-4 py-2 md:px-6 md:py-3 hover:bg-white hover:text-black transition-colors">
                OpenSea
            </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-8">
            
            <div className="font-pixel text-[10px] md:text-xs text-[#d946ef] bg-[#2d1b4e]/80 px-4 py-2 border border-[#d946ef]/50 mb-4 animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                🟢 MONAD MAINNET LIVE
            </div>
            
            <h1 className="font-pixel text-4xl md:text-6xl lg:text-7xl leading-tight md:leading-snug retro-shadow text-white mb-2 cursor-default hover:animate-chromatic transition-all">
              PIXEL<br/><span className="text-[#d946ef]">MOLANDAK</span>
            </h1>
            
            {/* TIER B: MINT STATUS BAR */}
            <div className="w-full max-w-md mx-auto mb-4 group bg-black/50 p-4 border border-[#2d1b4e]">
              <div className="flex justify-between font-vt text-xl text-gray-400 mb-2">
                <span>SUMMON_PROGRESS:</span>
                <span className="text-[#d946ef]">
                  {supply !== null ? supply : "SCANNING..."} / {MAX_SUPPLY}
                </span>
              </div>
              <div className="w-full h-6 border-2 border-white p-1 bg-[#0a0514]">
                 <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-[#d946ef] transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: supply !== null ? `${(supply / MAX_SUPPLY) * 100}%` : '0%' }}
                 >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                 </div>
              </div>
              <div className="text-center mt-3 font-pixel text-[8px] text-gray-600 group-hover:text-gray-400 transition-colors">
                REALM_CONTRACT: {CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}
              </div>
            </div>
            
            <p className="font-vt text-2xl md:text-4xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              An 8-bit pixel fantasy collection born from a mystical retro realm within the <span className="text-white border-b-2 border-purple-500 hover:text-[#d946ef] hover:border-[#d946ef] transition-colors cursor-help" title="L1 Blockchain">Monad</span> universe.
            </p>

            <div className="mt-8 flex flex-col md:flex-row gap-6 w-full md:w-auto items-center">
                 <a 
                    href="https://www.scatter.art/collection/pixel-molandak" 
                    target="_blank"
                    rel="noreferrer"
                    className="w-full md:w-auto px-8 py-5 bg-[#d946ef] text-black font-pixel text-xs md:text-sm btn-primary border-4 border-black hover:bg-[#f0abfc] transition-all"
                 >
                    MINTING ON SCATTER.ART
                 </a>
                 
                 {/* FUN: SUMMON BUTTON */}
                 <button 
                    onClick={triggerSummon}
                    className="w-full md:w-auto px-8 py-5 bg-transparent text-white font-pixel text-xs md:text-sm btn-retro border-4 border-white hover:bg-white hover:text-black transition-all"
                 >
                    SUMMON ENTITY
                 </button>
            </div>
        </div>
      </section>

      {/* MARQUEE SECTION */}
      <section className="py-10 md:py-20 relative z-20">
         <ShowcaseMarquee />
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t-2 border-[#2d1b4e] bg-[#020105] text-center relative z-20">
          <h2 className="font-pixel text-xl md:text-2xl text-white mb-8 retro-shadow">MOLANDAK</h2>
          
          <div className="flex justify-center gap-8 md:gap-16 text-gray-500 mb-12 font-vt text-2xl uppercase">
              <a href="https://x.com/pixelmolandak" target="_blank" rel="noreferrer" className="hover:text-[#d946ef] hover:underline decoration-2 underline-offset-4 transition-all">Twitter</a>
              <a href="https://www.scatter.art/collection/pixel-molandak" target="_blank" rel="noreferrer" className="hover:text-[#d946ef] hover:underline decoration-2 underline-offset-4 transition-all">Scatter</a>
          </div>
          
          <p className="font-pixel text-[10px] text-gray-700 leading-loose">
            © 2025 PIXEL MOLANDAK.<br/>ALL RIGHTS RESERVED IN THE MONAD REALM.
          </p>
      </footer>
    </div>
  );
}

export default App;
