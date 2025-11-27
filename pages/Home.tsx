import React from 'react';
import { AppRoute } from '../types';
import { Brain, BookOpen, Sparkles, Activity, Video } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <section className="text-center py-10 bg-white rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-4xl md:text-5xl font-bold text-teal-800 serif mb-4">
          欢迎来到火龙果失乐园
        </h2>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          一个专为成熟心智打造的数字乐园。锻炼脑力，创作漫画，参悟易经。
          保持好奇心，是永葆青春的秘诀。
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Brain Training Card */}
        <div 
          onClick={() => onNavigate(AppRoute.GAME_MEMORY)}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-md border-b-4 border-emerald-500 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <Brain className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">记忆力训练</h3>
          <p className="text-stone-500">
            多难度选择的翻牌配对游戏。开局预览帮助记忆，循序渐进锻炼大脑。
          </p>
        </div>

        {/* Focus Training Card */}
        <div 
          onClick={() => onNavigate(AppRoute.GAME_FOCUS)}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-md border-b-4 border-blue-500 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Activity className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">专注力挑战</h3>
          <p className="text-stone-500">
            斯特鲁普(Stroop)颜色测试。当字义与颜色一致时做出判断，保持思维敏捷。
          </p>
        </div>

        {/* Comic Creator Card */}
        <div 
          onClick={() => onNavigate(AppRoute.COMIC_CREATOR)}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-md border-b-4 border-amber-500 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">AI 漫画工坊</h3>
          <p className="text-stone-500">
            可高度自定义配置。将枯燥的教材、故事一键转化为生动的四格漫画，支持自定义提示词。
          </p>
        </div>

        {/* Video Publisher Card - NEW */}
        <div 
          onClick={() => onNavigate(AppRoute.VIDEO_PUBLISHER)}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-md border-b-4 border-rose-500 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="h-14 w-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
            <Video className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">视频智投</h3>
          <p className="text-stone-500">
            一键多平台分发。模拟人工操作上传，安全防封号。AI 辅助生成标题与简介。
          </p>
        </div>

        {/* I Ching Card */}
        <div 
          onClick={() => onNavigate(AppRoute.ICHING)}
          className="group cursor-pointer bg-white p-8 rounded-2xl shadow-md border-b-4 border-purple-500 hover:shadow-xl transition-all hover:-translate-y-1 lg:col-span-2 lg:w-1/2 lg:mx-auto"
        >
          <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">周易卜筮</h3>
          <p className="text-stone-500">
            内置完整六十四卦象。电子掷币，诚心问道，获取古老智慧的指引。
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;