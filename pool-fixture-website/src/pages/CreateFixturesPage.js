import React, { useState, useEffect } from 'react';
import { db } from '../js/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function CreateFixturesPage() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
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

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    const trimmedName = newPlayer.trim();
    
    if (!trimmedName) {
      setError('Please enter a player name');
      return;
    }
    
    if (players.includes(trimmedName)) {
      setError('This player already exists');
      return;
    }

    setPlayers(prev => [...prev, trimmedName].sort());
    setNewPlayer('');
    setError('');
    setSuccess(`Player ${trimmedName} added successfully`);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreateFixture = async () => {
    if (selectedPlayers.length !== 2) {
      setError('Please select exactly 2 players');
      return;
    }

    try {
      const [player1, player2] = selectedPlayers;
      
      await addDoc(collection(db, 'fixtures'), {
        player1,
        player2,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date(),
        status: 'pending'
      });

      setSuccess('Fixture created successfully!');
      setSelectedPlayers([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating fixture:', err);
      setError('Failed to create fixture. Please try again.');
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        return prev.filter(p => p !== player);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, player];
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-8">Create Fixtures</h1>

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

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Player</h2>
        <form onSubmit={handleAddPlayer} className="flex gap-2">
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter player name"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Player
          </button>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Fixture</h2>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Players</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {players.map(player => (
              <button
                key={player}
                onClick={() => handlePlayerSelect(player)}
                className={`p-2 text-sm rounded transition-colors ${
                  selectedPlayers.includes(player)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {player}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Players</h3>
          <div className="flex gap-4">
            {selectedPlayers.map(player => (
              <div key={player} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {player}
              </div>
            ))}
            {selectedPlayers.length === 0 && (
              <p className="text-gray-500 text-sm">No players selected</p>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateFixture}
          disabled={selectedPlayers.length !== 2}
          className={`w-full p-3 rounded ${
            selectedPlayers.length === 2
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
        >
          Create Fixture
        </button>
      </div>
    </div>
  );
}

export default CreateFixturesPage;