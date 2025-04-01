// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MatchResultPage from './pages/MatchResultPage';
import CreateFixturesPage from './pages/CreateFixturesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-blue-600 p-4 text-white">
          <ul className="flex space-x-4">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create-fixtures">Create Fixtures</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            <li><Link to="/match-result">Match Results</Link></li>
          </ul>
        </nav>
        <div className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-fixtures" element={<CreateFixturesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/match-result" element={<MatchResultPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
