import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3X3 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 120;
const MIN_SPEED = 60;

type Point = { x: number; y: number };

const randomFood = (): Point => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

// Custom hook to handle interval with fresh closures
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 15 },
    { x: 10, y: 16 },
    { x: 10, y: 17 },
  ]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 10, y: 5 }); // deterministic initial food
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const handleInput = useCallback((key: string) => {
    if (gameOver) return;
    
    if (!isPlaying && (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'W', 'w', 'S', 's', 'A', 'a', 'D', 'd'].includes(key))) {
      setIsPlaying(true);
    }

    const { x, y } = directionRef.current;
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (y === 1) break;
        setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (y === -1) break;
        setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (x === 1) break;
        setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (x === -1) break;
        setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        if (gameOver) resetGame();
        else setIsPlaying((p) => !p);
        break;
    }
  }, [gameOver, isPlaying]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent screen scrolling when using arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      handleInput(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput]);

  const gameLoop = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food eating
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setSpeed((s) => Math.max(MIN_SPEED, s - 3)); // Increase speed smoothly

        // Generate new food that's not on the snake
        let newFoodPos = randomFood();
        while (newSnake.some((segment) => segment.x === newFoodPos.x && segment.y === newFoodPos.y)) {
          newFoodPos = randomFood();
        }
        setFood(newFoodPos);
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [food]);

  useInterval(gameLoop, isPlaying && !gameOver ? speed : null);

  const resetGame = () => {
    setSnake([
      { x: 10, y: 15 },
      { x: 10, y: 16 },
      { x: 10, y: 17 },
    ]);
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setSpeed(INITIAL_SPEED);
    setFood(randomFood());
  };

  // Generate grid array for rendering
  const gridCells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  return (
    <div className="flex flex-col items-center gap-6 w-full font-mono">
      {/* Status Bar */}
      <div className="w-full lg:w-[500px] flex items-center justify-between px-4 py-3 bg-black/40 border border-[#39ff14]/20 mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] opacity-50 uppercase tracking-widest leading-none mb-1">Score</span>
          <span className="text-3xl font-bold neon-text-pink leading-none">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        
        {gameOver ? (
          <button 
            onClick={resetGame}
            className="flex items-center gap-2 bg-transparent hover:bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
          >
            <RefreshCw size={16} className="text-[#ff00ff]" /> Retry
          </button>
        ) : (
          <div className="text-right">
             <span className="text-[10px] opacity-50 uppercase tracking-widest block mb-1">Status</span>
             <span className={`text-sm font-bold uppercase tracking-widest ${isPlaying ? 'text-[#39ff14]' : 'text-[#00f3ff]'}`}>
               {isPlaying ? 'Running' : 'Paused'}
             </span>
          </div>
        )}
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        <div 
          className="relative aspect-square w-full lg:w-[500px] h-full lg:h-[500px] bg-black/50 border border-[#39ff14]/40 overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
          onClick={() => !isPlaying && !gameOver && setIsPlaying(true)}
        >
          {/* Faint Background Grid purely for aesthetics */}
          <div className="absolute inset-0 grid-line pointer-events-none opacity-40" />

          {/* Render snake and food over the CSS grid */}
          {gridCells.map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((segment) => segment.x === x && segment.y === y);
            const isFoodItem = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-full h-full ${
                  isHead
                    ? `bg-[#39ff14] neon-border ${gameOver ? 'bg-red-500 border-red-500 shadow-[0_0_10px_red]' : ''}`
                    : isBody
                    ? `bg-[#39ff14]/80 border border-[#39ff14]/50 ${gameOver ? 'bg-red-700/80 border-red-700' : ''}`
                    : isFoodItem
                    ? "bg-[#ff00ff] rounded-full shadow-[0_0_15px_#ff00ff] animate-bounce scale-75"
                    : "bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Start / Pause Overlays */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10 cursor-pointer" onClick={() => setIsPlaying(true)}>
            <div className="text-center flex flex-col items-center gap-4">
              <Play className="text-[#39ff14] w-16 h-16 drop-shadow-[0_0_15px_#39ff14] animate-pulse ml-2" fill="currentColor" />
              <p className="text-[#39ff14] font-bold uppercase tracking-[0.2em] animate-pulse drop-shadow-[0_0_8px_#39ff14]">
                Press Space / Tap
              </p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 backdrop-blur-[2px] z-10 cursor-pointer" onClick={resetGame}>
            <div className="text-center p-6 border border-red-500 bg-black/90 shadow-[0_0_30px_red]">
              <h2 className="text-4xl font-bold text-red-500 drop-shadow-[0_0_10px_red] mb-2">GAME OVER</h2>
              <p className="text-gray-400 mb-6 uppercase tracking-widest text-xs">Final Score: {score}</p>
              <button 
                onClick={resetGame}
                className="bg-red-600/20 hover:bg-red-600/40 border border-red-500 w-full text-red-500 py-3 text-xs font-bold uppercase tracking-widest transition-colors active:scale-95"
              >
                Insert Coin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-Pad Controls */}
      <div className="md:hidden grid grid-cols-3 gap-2 w-48 mt-4">
        <div />
        <button 
          onClick={() => handleInput('ArrowUp')}
          className="bg-[#39ff14]/5 hover:bg-[#39ff14]/10 border border-[#39ff14]/30 p-4 flex items-center justify-center active:bg-[#39ff14]/20"
          aria-label="Up"
        ><ArrowUp size={24} className="text-[#39ff14]" /></button>
        <div />
        
        <button 
          onClick={() => handleInput('ArrowLeft')}
          className="bg-[#39ff14]/5 hover:bg-[#39ff14]/10 border border-[#39ff14]/30 p-4 flex items-center justify-center active:bg-[#39ff14]/20"
          aria-label="Left"
        ><ArrowLeft size={24} className="text-[#39ff14]" /></button>
        <button 
          onClick={() => handleInput(' ')}
          className="bg-[#ff00ff]/5 hover:bg-[#ff00ff]/10 border border-[#ff00ff]/30 p-4 flex items-center justify-center active:bg-[#ff00ff]/20"
          aria-label="Play/Pause Action"
        ><Grid3X3 size={24} className="text-[#ff00ff] opacity-50" /></button>
        <button 
          onClick={() => handleInput('ArrowRight')}
          className="bg-[#39ff14]/5 hover:bg-[#39ff14]/10 border border-[#39ff14]/30 p-4 flex items-center justify-center active:bg-[#39ff14]/20"
          aria-label="Right"
        ><ArrowRight size={24} className="text-[#39ff14]" /></button>
        
        <div />
        <button 
          onClick={() => handleInput('ArrowDown')}
          className="bg-[#39ff14]/5 hover:bg-[#39ff14]/10 border border-[#39ff14]/30 p-4 flex items-center justify-center active:bg-[#39ff14]/20"
          aria-label="Down"
        ><ArrowDown size={24} className="text-[#39ff14]" /></button>
        <div />
      </div>
    </div>
  );
}
