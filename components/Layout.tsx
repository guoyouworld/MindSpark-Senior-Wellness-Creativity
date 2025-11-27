import React, { useState } from 'react';
import { AppRoute } from '../types';
import { Menu, X, Home, Brain, BookOpen, Sparkles, Video } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { route: AppRoute.HOME, label: '主页 (Home)', icon: Home },
    { route: AppRoute.GAME_MEMORY, label: '记忆训练', icon: Brain },
    { route: AppRoute.GAME_FOCUS, label: '专注测试', icon: Brain },
    { route: AppRoute.COMIC_CREATOR, label: 'AI 漫画工坊', icon: BookOpen },
    { route: AppRoute.VIDEO_PUBLISHER, label: '视频智投', icon: Video },
    { route: AppRoute.ICHING, label: '周易卜筮', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate(AppRoute.HOME)}
          >
            <Sparkles className="h-8 w-8 text-amber-300" />
            <h1 className="text-2xl font-bold serif tracking-wide">火龙果失乐园</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentRoute === item.route
                    ? 'bg-teal-800 text-amber-300 font-semibold'
                    : 'hover:bg-teal-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-teal-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-teal-800 text-white border-b border-teal-600 animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-2">
             {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  currentRoute === item.route
                    ? 'bg-teal-900 text-amber-300 font-semibold'
                    : 'hover:bg-teal-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-200 text-stone-600 py-6 text-center text-sm">
        <p>© 2024 火龙果失乐园. 专为银发族设计的益智与养生空间.</p>
        <p className="mt-1">Designed for Senior Wellness & Creativity.</p>
      </footer>
    </div>
  );
};

export default Layout;