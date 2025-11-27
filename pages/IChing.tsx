import React, { useState } from 'react';
import { CoinSide } from '../types';
import { HEXAGRAMS, HexagramData } from '../data/ichingData';
import { Sparkles, RefreshCcw, ArrowRight, BookOpen } from 'lucide-react';

const IChing: React.FC = () => {
  const [step, setStep] = useState(0); // 0: Input, 1..6: Tossing lines, 7: Result
  const [question, setQuestion] = useState('');
  
  // Store the raw sum of 3 coins (6, 7, 8, or 9)
  // 6: Old Yin (X) -> Becomes Yang
  // 7: Young Yang (Solid) -> Stays Yang
  // 8: Young Yin (Broken) -> Stays Yin
  // 9: Old Yang (O) -> Becomes Yin
  const [lines, setLines] = useState<number[]>([]); 
  
  const [coins, setCoins] = useState<number[]>([3, 3, 3]); // 3=Heads, 2=Tails
  const [isTossing, setIsTossing] = useState(false);

  const tossCoins = async () => {
    setIsTossing(true);
    
    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate 3 coins: Heads(3) or Tails(2)
    // Probability: Standard coin toss (50/50 per coin)
    const newCoins = [
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ];
    setCoins(newCoins);
    
    const sum = newCoins.reduce((a, b) => a + b, 0);
    
    // Append new line (Bottom to Top)
    const newLines = [...lines, sum];
    setLines(newLines);
    
    setIsTossing(false);
    
    if (newLines.length === 6) {
      setTimeout(() => setStep(7), 500);
    } else {
      setStep(s => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setLines([]);
    setQuestion('');
  };

  // Helper to convert lines to binary string for lookup
  const getHexagramKey = (rawLines: number[], type: 'original' | 'transformed'): string => {
    return rawLines.map(val => {
       if (type === 'original') {
         // 6(Old Yin)->0, 8(Young Yin)->0, 7(Young Yang)->1, 9(Old Yang)->1
         return (val === 7 || val === 9) ? '1' : '0';
       } else {
         // Transformed: 
         // 6(Old Yin)->1 (Change to Yang)
         // 8(Young Yin)->0 (No Change)
         // 7(Young Yang)->1 (No Change)
         // 9(Old Yang)->0 (Change to Yin)
         if (val === 6) return '1';
         if (val === 9) return '0';
         return (val === 7) ? '1' : '0';
       }
    }).join('');
  };

  // Render a single line based on value (6,7,8,9)
  const renderLine = (val: number, showSymbol = true) => {
    const isYang = (val === 7 || val === 9);
    const isMoving = (val === 6 || val === 9); // 6=Old Yin, 9=Old Yang
    
    // Colors
    const colorClass = isMoving ? 'bg-amber-600' : 'bg-stone-800';
    
    return (
      <div className="h-5 w-full flex justify-between items-center relative my-1">
         {/* Symbol for moving lines */}
         {showSymbol && isMoving && (
            <div className="absolute -right-8 text-xs font-bold text-amber-600 w-4">
               {val === 9 ? 'O' : 'X'}
            </div>
         )}

         {isYang ? (
           // Solid Line
           <div className={`w-full h-full rounded-sm flex items-center justify-center ${colorClass}`}>
              {showSymbol && val === 9 && <div className="w-3 h-3 rounded-full border-2 border-white"></div>}
           </div>
         ) : (
           // Broken Line
           <>
             <div className={`w-[42%] h-full rounded-sm ${colorClass}`}></div>
             {/* Gap */}
             <div className="w-[16%] h-full flex items-center justify-center">
                {showSymbol && val === 6 && <span className="text-amber-600 font-bold text-sm">✕</span>}
             </div>
             <div className={`w-[42%] h-full rounded-sm ${colorClass}`}></div>
           </>
         )}
      </div>
    );
  };

  const originalKey = getHexagramKey(lines, 'original');
  const transformedKey = getHexagramKey(lines, 'transformed');
  const originalHex = HEXAGRAMS[originalKey];
  const transformedHex = HEXAGRAMS[transformedKey];
  const hasChange = originalKey !== transformedKey;
  
  // Identify moving line indices (0-5)
  const movingIndices = lines.map((val, idx) => (val === 6 || val === 9) ? idx : -1).filter(idx => idx !== -1);

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center pb-12">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-teal-800 serif mb-2">周易卜筮</h2>
        <p className="text-stone-500 italic">"天行健，君子以自强不息"</p>
      </div>

      {step === 0 && (
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
          <label className="block text-lg font-medium text-stone-700 mb-4">心中默念您的问题：</label>
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：近期的健康运势如何？"
            className="w-full p-4 border border-stone-300 rounded-xl mb-6 text-lg outline-none focus:border-teal-500 transition-colors bg-white"
          />
          <button 
            onClick={() => {
               if(!question.trim()) return alert("请先输入您的问题");
               setStep(1);
            }}
            className="w-full bg-teal-800 text-amber-50 py-4 rounded-xl text-xl font-bold hover:bg-teal-700 shadow-md transition-all"
          >
            诚心起卦
          </button>
        </div>
      )}

      {(step >= 1 && step <= 6) && (
        <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in">
           
           <div className="text-center space-y-2">
             <h3 className="text-xl font-bold text-stone-800">正在求取第 {step} 爻 (由下至上)</h3>
             <p className="text-stone-500 text-sm">请保持心中默念问题...</p>
           </div>

           <div className="bg-stone-100 w-full p-8 rounded-2xl flex flex-col items-center min-h-[300px] justify-center relative shadow-inner">
              
              {/* Coins Visualization */}
              <div className="flex gap-4 mb-10">
                {coins.map((val, idx) => (
                   <div 
                     key={idx} 
                     className={`
                       w-24 h-24 rounded-full border-8 flex items-center justify-center text-3xl font-bold shadow-xl 
                       transition-all duration-500 ease-out transform
                       ${isTossing ? 'animate-spin opacity-80 scale-90' : 'scale-100'}
                       ${val === 3 
                          ? 'bg-amber-400 border-amber-500 text-amber-900' // Head (Yang)
                          : 'bg-stone-300 border-stone-400 text-stone-700' // Tail (Yin)
                        }
                     `}
                   >
                     {val === 3 ? '阳' : '阴'}
                     <span className="block text-xs absolute mt-8 opacity-60">{val === 3 ? '3' : '2'}</span>
                   </div>
                ))}
              </div>

              <button
                onClick={tossCoins}
                disabled={isTossing}
                className={`
                  px-10 py-4 rounded-full text-xl font-bold shadow-lg transition-all
                  ${isTossing 
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                    : 'bg-teal-700 text-white hover:bg-teal-600 hover:scale-105 hover:shadow-xl'}
                `}
              >
                {isTossing ? '掷币中...' : '掷出铜钱'}
              </button>
           </div>

           {/* Current Lines Building Area */}
           <div className="w-64 bg-white p-4 rounded-xl shadow border border-stone-200">
             <div className="flex flex-col-reverse gap-2">
               {[0, 1, 2, 3, 4, 5].map(idx => {
                 // Placeholder slots
                 if (idx >= lines.length) {
                   return (
                     <div key={idx} className="h-5 w-full border-2 border-dashed border-stone-200 rounded flex items-center justify-center">
                        <span className="text-stone-300 text-xs">{idx + 1}</span>
                     </div>
                   );
                 }
                 // Actual lines
                 return (
                   <div key={idx} className="animate-in slide-in-from-right duration-500">
                     {renderLine(lines[idx])}
                   </div>
                 );
               })}
             </div>
             <div className="text-center mt-2 text-xs text-stone-400">上 (Upper)</div>
           </div>
        </div>
      )}

      {step === 7 && (
         <div className="w-full animate-in zoom-in duration-500 space-y-8">
            
            {/* Question Display */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <span className="text-amber-800 font-bold opacity-75 mr-2">问：</span>
              <span className="text-xl text-stone-800 font-serif font-bold">{question}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Original Hexagram */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-stone-800 flex flex-col h-full">
                 <div className="text-center border-b pb-4 mb-4">
                    <span className="bg-stone-800 text-white text-xs px-2 py-1 rounded uppercase tracking-wider">本卦 (Original)</span>
                    <h3 className="text-3xl font-bold text-stone-800 mt-2 serif">第{originalHex?.number}卦 {originalHex?.name}</h3>
                 </div>

                 <div className="flex flex-col-reverse gap-2 w-32 mx-auto mb-6">
                    {lines.map((val, idx) => (
                      <div key={idx}>{renderLine(val)}</div>
                    ))}
                 </div>

                 <div className="flex-grow space-y-4">
                   <div className="bg-stone-50 p-4 rounded-xl">
                     <h4 className="text-sm font-bold text-stone-500 uppercase mb-2">卦辞 (Judgment)</h4>
                     <p className="whitespace-pre-wrap text-stone-900 leading-relaxed font-serif text-lg font-medium">
                       {originalHex?.judgment}
                     </p>
                   </div>
                   
                   <div className="bg-stone-50 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-stone-500 uppercase mb-2">象曰 (The Image)</h4>
                      <p className="whitespace-pre-wrap text-stone-800 leading-relaxed font-serif text-lg italic">
                        {originalHex?.image}
                      </p>
                   </div>

                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-800 uppercase mb-2 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> 白话详解 (Interpretation)
                      </h4>
                      <p className="whitespace-pre-wrap text-stone-800 leading-relaxed text-base">
                        {originalHex?.explanation}
                      </p>
                   </div>
                 </div>
              </div>

              {/* Transformed Hexagram (Only if changed) */}
              {hasChange ? (
                <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-teal-600 flex flex-col h-full">
                   <div className="text-center border-b pb-4 mb-4">
                      <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded uppercase tracking-wider">之卦 (Transformed)</span>
                      <h3 className="text-3xl font-bold text-teal-800 mt-2 serif">第{transformedHex?.number}卦 {transformedHex?.name}</h3>
                   </div>

                   <div className="flex flex-col-reverse gap-2 w-32 mx-auto mb-6">
                      {/* Render purified lines without moving markers */}
                      {lines.map((val, idx) => {
                         // Transform logic for visual
                         let newVal = val;
                         if (val === 6) newVal = 7; // Old Yin becomes Yang
                         if (val === 9) newVal = 8; // Old Yang becomes Yin
                         return <div key={idx}>{renderLine(newVal, false)}</div>;
                      })}
                   </div>

                   <div className="flex-grow space-y-4">
                     <div className="bg-teal-50 p-4 rounded-xl">
                       <h4 className="text-sm font-bold text-teal-600 uppercase mb-2">变化后 (Outcome)</h4>
                       <p className="whitespace-pre-wrap text-stone-800 leading-relaxed font-serif text-lg font-medium">
                         {transformedHex?.judgment}
                       </p>
                     </div>
                     <div className="bg-teal-50 p-4 rounded-xl">
                       <h4 className="text-sm font-bold text-teal-600 uppercase mb-2">象曰 (The Image)</h4>
                       <p className="whitespace-pre-wrap text-stone-800 leading-relaxed font-serif text-lg italic">
                         {transformedHex?.image}
                       </p>
                     </div>
                     <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                        <h4 className="text-sm font-bold text-teal-800 uppercase mb-2 flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> 白话详解
                        </h4>
                        <p className="whitespace-pre-wrap text-stone-800 leading-relaxed text-base">
                          {transformedHex?.explanation}
                        </p>
                     </div>
                   </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-center opacity-70">
                   <Sparkles className="h-12 w-12 text-stone-300 mb-4" />
                   <h3 className="text-xl font-bold text-stone-500">无变卦</h3>
                   <p className="text-stone-400 mt-2">六爻安靜，事态稳定。<br/>以本卦卦辞为主。</p>
                </div>
              )}

            </div>

            {/* Explanation of Moving Lines */}
            {hasChange && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200 text-stone-600">
                <h4 className="font-bold text-lg text-amber-800 mb-4 flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5"/> 变爻详解 (Changing Lines Analysis)
                </h4>
                <div className="space-y-4">
                  {movingIndices.map((lineIndex) => {
                    const lineVal = lines[lineIndex];
                    const lineText = originalHex?.lines?.[lineIndex] || "暂无爻辞";
                    return (
                      <div key={lineIndex} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="font-bold text-stone-800 mb-1">
                          第 {lineIndex + 1} 爻 ({lineVal === 6 ? '老阴' : '老阳'})：
                        </div>
                        <div className="font-serif text-lg text-stone-900 pl-4 border-l-4 border-amber-400">
                          {lineText}
                        </div>
                        <div className="text-sm text-stone-500 mt-2">
                           {lineVal === 6 ? '阴极生阳，变卦由此而生。' : '阳极生阴，变卦由此而生。'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-400 mt-4 italic">
                  * 传统解卦通常以变爻爻辞为主，若多爻变，则参考变卦卦辞。
                </p>
              </div>
            )}

            <button 
              onClick={reset}
              className="mt-8 mx-auto block bg-stone-800 text-white px-8 py-3 rounded-full hover:bg-stone-700 transition-colors shadow-lg font-bold flex items-center gap-2"
            >
              <RefreshCcw className="h-5 w-5" /> 重新卜问
            </button>
         </div>
      )}

    </div>
  );
};

export default IChing;