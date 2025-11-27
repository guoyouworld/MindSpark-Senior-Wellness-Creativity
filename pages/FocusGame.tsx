import React, { useState, useEffect, useRef } from 'react';
import { Play, Check, X, AlertCircle } from 'lucide-react';

const COLORS = [
  { name: '红', value: 'red', hex: '#ef4444' }, // Red-500
  { name: '蓝', value: 'blue', hex: '#3b82f6' }, // Blue-500
  { name: '绿', value: 'green', hex: '#22c55e' }, // Green-500
  { name: '黄', value: 'yellow', hex: '#d97706' }, // Amber-600
  { name: '黑', value: 'black', hex: '#1c1917' }, // Stone-900
];

const FocusGame: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState(COLORS[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setFeedback(null);
    nextRound();
  };

  const nextRound = () => {
    const randWord = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    setCurrentWord(randWord);
    setCurrentColor(randColor);
  };

  const handleAnswer = (userSaysYes: boolean) => {
    if (!isPlaying) return;

    // Logic: Does the MEANING match the COLOR?
    const isCongruent = currentWord.value === currentColor.value;
    
    // Check if user answer matches reality
    const isCorrect = userSaysYes === isCongruent;

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setScore(s => Math.max(0, s - 1)); // Penalty
      setFeedback('wrong');
    }
    
    // Clear feedback and next round
    setTimeout(() => {
      setFeedback(null);
      nextRound();
    }, 400);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full">
      
      {/* Title / Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-teal-800">专注力挑战 (Stroop)</h2>
      </div>

      {!isPlaying && timeLeft === 30 ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md mt-4">
          <div className="bg-amber-50 p-4 rounded-xl text-stone-700 mb-6 text-left">
             <h4 className="font-bold mb-2 flex items-center gap-2 text-amber-800">
               <AlertCircle className="h-5 w-5"/> 游戏规则
            </h4>
             <p className="mb-2 text-sm leading-relaxed">
               屏幕上会出现一个彩色汉字。请忽略它的颜色，只看它的<strong className="text-stone-900">含义</strong>。
             </p>
             <p className="text-sm font-bold bg-white p-3 rounded border border-amber-200 text-center">
               如果 <span className="text-teal-700">字义</span> 等于 <span className="text-teal-700">颜色</span>，选 "对"
             </p>
          </div>

          <button 
            onClick={startGame}
            className="w-full bg-teal-600 text-white text-xl py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="fill-current" /> 开始测试
          </button>
        </div>
      ) : !isPlaying && timeLeft === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md animate-in zoom-in mt-4">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">时间到!</h3>
          <p className="text-4xl font-bold text-teal-600 mb-6">{score} 分</p>
          <button 
            onClick={startGame}
            className="w-full bg-teal-600 text-white text-lg py-3 rounded-xl hover:bg-teal-700 font-semibold"
          >
            再试一次
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          
          {/* Main Question - HIGH VISIBILITY */}
          <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-stone-200 text-center">
             <h3 className="text-xl md:text-2xl font-black text-stone-800">
               文字含义 <span className="text-teal-600">是否等于</span> 颜色？
             </h3>
          </div>

          {/* Game Card */}
          <div className="relative bg-white w-full h-64 rounded-3xl shadow-xl flex flex-col items-center justify-center border-4 border-stone-100 overflow-hidden">
             
             {/* Visual Feedback Overlay */}
             {feedback && (
               <div className={`absolute inset-0 z-10 flex items-center justify-center bg-opacity-20 ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                 {feedback === 'correct' ? <Check className="h-32 w-32 text-green-600" /> : <X className="h-32 w-32 text-red-600" />}
               </div>
             )}

             <div 
               className="text-[8rem] font-black leading-none select-none transition-all duration-150"
               style={{ color: currentColor.hex }}
             >
               {currentWord.name}
             </div>
          </div>

          {/* HUD Info */}
          <div className="flex justify-between w-full text-base font-bold text-stone-500 px-4">
             <span>得分: <span className="text-teal-600 text-xl">{score}</span></span>
             <span>时间: <span className={`text-xl ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-stone-800'}`}>{timeLeft}s</span></span>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            <button 
              onClick={() => handleAnswer(false)}
              className="bg-rose-100 text-rose-700 border-b-4 border-rose-500 active:border-b-0 active:translate-y-1 hover:bg-rose-200 py-6 rounded-2xl text-2xl font-bold flex flex-col items-center gap-1 transition-all"
            >
              <X className="h-8 w-8" />
              <span>不对</span>
            </button>
            <button 
              onClick={() => handleAnswer(true)}
              className="bg-emerald-100 text-emerald-700 border-b-4 border-emerald-500 active:border-b-0 active:translate-y-1 hover:bg-emerald-200 py-6 rounded-2xl text-2xl font-bold flex flex-col items-center gap-1 transition-all"
            >
              <Check className="h-8 w-8" />
              <span>对</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusGame;