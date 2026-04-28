/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#050505] font-mono text-white p-4 md:p-6 overflow-hidden">
      <div className="scanline crt-flicker fixed font-mono"></div>
      
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col h-full gap-6 flex-1 drop-shadow-md">
        
        <header className="flex flex-col md:flex-row justify-between md:items-end mb-2 border-b border-[#39ff14]/30 pb-4 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold neon-text-blue tracking-tighter">
              SYNTH_SNAKE v1.0.4
            </h1>
            <p className="text-[10px] text-[#39ff14] opacity-70 uppercase tracking-widest mt-1">
              Neural-Audio Interface Active
            </p>
          </div>
        </header>

        <main className="flex-1 flex gap-6 overflow-hidden flex-col xl:flex-row">
            <section className="flex-1 relative flex items-center justify-center bg-[#050505] neon-border grid-line overflow-hidden p-4 min-h-[450px]">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none text-[80px] md:text-[120px] font-bold text-white z-0">
                SNAKE
              </div>
              <div className="z-10 w-full h-full flex flex-col items-center justify-center">
                <SnakeGame />
              </div>
            </section>
            
            <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
                <MusicPlayer />
                <p className="text-center text-[10px] text-[#39ff14]/70 mt-auto uppercase tracking-widest leading-loose">
                  [W/A/S/D] to Move<br/>[Space] to Pause
                </p>
            </aside>
        </main>
      </div>
    </div>
  );
}
