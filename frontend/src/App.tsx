import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import CreateGamePage from '@/pages/CreateGamePage';
import JoinGamePage from '@/pages/JoinGamePage';
import GameRoom from '@/pages/GameRoom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-game" element={<CreateGamePage />} />
          <Route path="/join-game" element={<JoinGamePage />} />
          <Route path="/game/:gameId" element={<GameRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
