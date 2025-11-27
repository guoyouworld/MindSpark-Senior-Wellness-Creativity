import React, { useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import MemoryGame from './pages/MemoryGame';
import FocusGame from './pages/FocusGame';
import ComicCreator from './pages/ComicCreator';
import VideoPublisher from './pages/VideoPublisher';
import IChing from './pages/IChing';
import { AppRoute } from './types';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Home onNavigate={setCurrentRoute} />;
      case AppRoute.GAME_MEMORY:
        return <MemoryGame />;
      case AppRoute.GAME_FOCUS:
        return <FocusGame />;
      case AppRoute.COMIC_CREATOR:
        return <ComicCreator />;
      case AppRoute.VIDEO_PUBLISHER:
        return <VideoPublisher />;
      case AppRoute.ICHING:
        return <IChing />;
      default:
        return <Home onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderPage()}
    </Layout>
  );
};

export default App;