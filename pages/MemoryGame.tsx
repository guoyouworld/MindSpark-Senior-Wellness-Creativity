import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Eye, Sparkles, Clock, Calculator } from 'lucide-react';

const ICONS = ['🌸', '🐱', '🍎', '🚗', '🏠', '🎵', '⌚', '🌞', '🦋', '🏀', '🍉', '👓', '🎁', '💎', '🌈', '🍦', '🍕', '🚀', '🎸', '📷', '📚', '💡', '🚲', '🍔'];

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // Preview State
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewTimer, setPreviewTimer] = useState(0);

  // Game Timer & Score State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Preview Timer Logic
  useEffect(() => {
    let interval: number;
    if (isPreviewing && previewTimer > 0) {
      interval = window.setInterval(() => {
        setPreviewTimer((prev) => prev - 1);
      }, 1000);
    } else if (previewTimer === 0 && isPreviewing) {
      // End preview
      setIsPreviewing(false);
      setCards((prev) => prev.map(c => ({ ...c, isFlipped: false })));
      // Reset game timer when actual game starts
      setElapsedTime(0); 
    }
    return () => clearInterval(interval);
  }, [isPreviewing, previewTimer]);

  // Game Timer Logic
  useEffect(() => {
    let interval: number;
    const currentConfig = getGameConfig(difficulty);
    // Timer runs only when not previewing and game is not finished
    if (!isPreviewing && matches < currentConfig.pairs) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPreviewing, matches, difficulty]);

  // Calculate Final Score when game ends
  useEffect(() => {
    const currentConfig = getGameConfig(difficulty);
    if (matches === currentConfig.pairs && matches > 0) {
      // Logic: 
      // Base: 1000 points per pair (rewards higher difficulty)
      // Penalty: -50 points per move
      // Penalty: -10 points per second
      const basePoints = currentConfig.pairs * 1000;
      const movePenalty = moves * 50;
      const timePenalty = elapsedTime * 10;
      
      const calculated = Math.max(0, basePoints - movePenalty - timePenalty);
      setFinalScore(calculated);
    }
  }, [matches, moves, elapsedTime, difficulty]);

  const getGameConfig = (diff: Difficulty) => {
    switch (diff) {
      // Adjusted columns for better fit
      case 'easy': return { pairs: 6, cols: 'grid-cols-3 md:grid-cols-4', previewTime: 3 }; // 12 cards
      case 'medium': return { pairs: 10, cols: 'grid-cols-4 md:grid-cols-5', previewTime: 5 }; // 20 cards
      case 'hard': return { pairs: 15, cols: 'grid-cols-5 md:grid-cols-6', previewTime: 8 }; // 30 cards
      case 'expert': return { pairs: 21, cols: 'grid-cols-6 md:grid-cols-7', previewTime: 10 }; // 42 cards
      default: return { pairs: 6, cols: 'grid-cols-4', previewTime: 3 };
    }
  };

  const initializeGame = () => {
    const config = getGameConfig(difficulty);
    // Slice needed icons
    const selectedIcons = ICONS.slice(0, config.pairs);
    // Duplicate icons to create pairs
    const gameIcons = [...selectedIcons, ...selectedIcons];
    // Shuffle
    const shuffled = gameIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: true, // Start flipped for preview
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setElapsedTime(0);
    setFinalScore(0);
    setIsPreviewing(true);
    setPreviewTimer(config.previewTime);
  };

  const handleCardClick = (id: number) => {
    // Prevent interaction during preview
    if (isPreviewing) return;

    // Prevent clicking if already 2 flipped or clicking same card or matched card
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      cards.find((c) => c.id === id)?.isMatched
    ) {
      return;
    }

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (id1: number, id2: number) => {
    const card1 = cards.find(c => c.id === id1);
    const card2 = cards.find(c => c.id === id2);

    if (card1 && card2 && card1.icon === card2.icon) {
      // Match found
      setCards(prev => prev.map(card => 
        card.id === id1 || card.id === id2 ? { ...card, isMatched: true } : card
      ));
      setMatches(m => m + 1);
      setFlippedCards([]);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === id1 || card.id === id2 ? { ...card, isFlipped: false } : card
        ));
        setFlippedCards([]);
      }, 1000);
    }
  };

  const currentConfig = getGameConfig(difficulty);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      
      {/* Header Compact */}
      <div className="flex flex-col w-full mb-2 gap-2">
        <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-stone-200">
            <h2 className="text-lg md:text-xl font-bold text-teal-800">记忆力训练</h2>
            <div className="flex gap-3 text-sm font-mono text-stone-600">
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                <span>{moves}步</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
        </div>

        {/* Difficulty Buttons */}
        <div className="flex justify-between gap-1 bg-stone-200 p-1 rounded-lg">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-1 rounded text-xs md:text-sm transition-all ${difficulty === d ? 'bg-white text-teal-700 shadow font-bold' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {d === 'easy' && '简单'}
                {d === 'medium' && '中等'}
                {d === 'hard' && '困难'}
                {d === 'expert' && '地狱'}
              </button>
            ))}
        </div>

        {/* Status Bar */}
        {isPreviewing ? (
           <div className="w-full bg-amber-50 text-amber-700 px-3 py-1 rounded text-center text-sm font-bold border border-amber-200 flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              <span>请记忆！倒计时: {previewTimer}</span>
           </div>
        ) : matches === currentConfig.pairs ? (
            <div className="w-full bg-green-50 text-green-700 px-3 py-1 rounded text-center text-sm font-bold border border-green-200">
               恭喜完成！
            </div>
        ) : (
            <div className="w-full bg-stone-50 text-stone-400 px-3 py-1 rounded text-center text-xs border border-stone-200">
               点击卡片配对
            </div>
        )}
      </div>

      {matches === currentConfig.pairs ? (
        <div className="bg-amber-50 p-6 rounded-2xl text-center shadow border border-amber-100 mt-4 animate-in zoom-in w-full">
          <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-stone-800 mb-1">挑战成功!</h3>
          
          <div className="flex justify-center gap-4 my-4">
             <div className="bg-white p-3 rounded-lg shadow-sm w-24">
               <div className="text-xs text-stone-500 uppercase">最终得分</div>
               <div className="text-2xl font-black text-amber-600">{finalScore}</div>
             </div>
             <div className="bg-white p-3 rounded-lg shadow-sm w-24">
               <div className="text-xs text-stone-500 uppercase">总用时</div>
               <div className="text-xl font-bold text-stone-700">{formatTime(elapsedTime)}</div>
             </div>
             <div className="bg-white p-3 rounded-lg shadow-sm w-24">
               <div className="text-xs text-stone-500 uppercase">步数</div>
               <div className="text-xl font-bold text-stone-700">{moves}</div>
             </div>
          </div>

          <p className="text-stone-500 text-xs mb-4">
             得分公式: (卡片对数 x 1000) - (步数 x 50) - (秒数 x 10)
          </p>

          <button 
            onClick={initializeGame}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-semibold flex items-center gap-2 mx-auto shadow-lg"
          >
            <RefreshCw className="h-4 w-4" /> 再玩一次
          </button>
        </div>
      ) : (
        /* Game Grid - Super Compact for Mobile */
        <div className={`grid ${currentConfig.cols} gap-1 w-full p-1 bg-stone-200/50 rounded-lg`}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square cursor-pointer rounded md:rounded-lg shadow-sm flex items-center justify-center 
                text-xl md:text-3xl select-none transition-all duration-300 transform perspective-1000
                ${card.isFlipped || card.isMatched ? 'bg-white rotate-y-180' : 'bg-teal-600 hover:bg-teal-500'}
                ${card.isMatched ? 'border-2 border-amber-400 opacity-60 grayscale-[0.3]' : ''}
              `}
            >
              {(card.isFlipped || card.isMatched) ? card.icon : <Sparkles className="text-teal-800/20 w-3 h-3 md:w-5 md:h-5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryGame;