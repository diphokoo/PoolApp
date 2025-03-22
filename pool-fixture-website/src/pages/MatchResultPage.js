// src/pages/MatchResultPage.js
import React, { useState } from 'react';
import { db } from '../js/firebase';
import { collection, addDoc } from 'firebase/firestore';

function MatchResultPage() {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [winner, setWinner] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'fixtures'), {
      player1,
      player2,
      winner,
      date: new Date().toISOString().split('T')[0],
    });
    // Reset form
    setPlayer1('');
    setPlayer2('');
    setWinner('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Record Match Result</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Player 1</label>
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-2 border rounded"
            required
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
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

export default MatchResultPage;