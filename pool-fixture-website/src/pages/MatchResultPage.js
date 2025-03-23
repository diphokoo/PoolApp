import React, { useState, useEffect } from 'react';
import { db } from '../js/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function MatchResultPage() {
  const [players, setPlayers] = useState([]);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [winner, setWinner] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const fixturesRef = collection(db, 'fixtures');
        const snapshot = await getDocs(fixturesRef);
        const uniquePlayers = new Set();
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.player1) uniquePlayers.add(data.player1);
          if (data.player2) uniquePlayers.add(data.player2);
        });
        
        setPlayers(Array.from(uniquePlayers).sort());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load existing players');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!player1 || !player2) {
      setError('Both player names are required');
      return;
    }

    if (player1 === player2) {
      setError('Players must be different');
      return;
    }

    if (!winner) {
      setError('Please select a winner');
      return;
    }

    if (winner !== player1 && winner !== player2) {
      setError('Winner must be either Player 1 or Player 2');
      return;
    }

    try {
      // Save to Firebase
      await addDoc(collection(db, 'fixtures'), {
        player1: player1.trim(),
        player2: player2.trim(),
        winner: winner.trim(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
      });
      
      setSuccess('Match result recorded successfully!');
      
      // Reset form
      setPlayer1('');
      setPlayer2('');
      setWinner('');
    } catch (err) {
      console.error('Error saving match result:', err);
      setError('Failed to save match result. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Record Match Result</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="player1">
            Player 1
          </label>
          <select
            id="player1"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Player 1</option>
            {players
              .filter(p => p !== player2)
              .map(player => (
                <option key={player} value={player}>{player}</option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="player2">
            Player 2
          </label>
          <select
            id="player2"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Player 2</option>
            {players
              .filter(p => p !== player1)
              .map(player => (
                <option key={player} value={player}>{player}</option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="winner">
            Winner
          </label>
          <select
            id="winner"
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!player1 || !player2}
          >
            <option value="">Select winner</option>
            {player1 && <option value={player1}>{player1}</option>}
            {player2 && <option value={player2}>{player2}</option>}
          </select>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Submit Result
        </button>
      </form>
    </div>
  );
}

export default MatchResultPage;