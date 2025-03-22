// src/pages/MatchResultPage.js
import React, { useState } from 'react';
import { db } from '../js/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getCurrentLeaguePeriod, updatePlayerStats } from '../js/leagueUtils';

function MatchResultPage() {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [winner, setWinner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate winner
      if (winner !== player1 && winner !== player2) {
        throw new Error('Winner must be one of the selected players');
      }

      // Save match result
      await addDoc(collection(db, 'fixtures'), {
        player1,
        player2,
        winner,
        date: new Date().toISOString().split('T')[0],
        leaguePeriod: getCurrentLeaguePeriod()
      });
      
      // Update player stats
      await updatePlayerStats(player1, player2, winner);
      
      // Reset form
      setPlayer1('');
      setPlayer2('');
      setWinner('');
    } catch (error) {
      console.error('Error saving match result:', error);
      setError(error.message || 'Failed to save match result. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Record Match Result</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Player 1</label>
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block mb-1">Player 2</label>
          <input
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block mb-1">Winner</label>
          <input
            type="text"
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={submitting}
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default MatchResultPage;