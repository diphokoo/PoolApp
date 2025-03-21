// src/pages/LeaderboardPage.js
import React, { useEffect, useState } from 'react';
import { db } from '../js/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

function LeaderboardPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersCollection = collection(db, 'players');
      const q = query(playersCollection, orderBy('points', 'desc'));
      const querySnapshot = await getDocs(q);
      const playersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersList);
    };

    fetchPlayers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Rank</th>
            <th className="py-2">Player</th>
            <th className="py-2">Wins</th>
            <th className="py-2">Losses</th>
            <th className="py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id} className="text-center">
              <td className="py-2">{index + 1}</td>
              <td className="py-2">{player.name}</td>
              <td className="py-2">{player.wins}</td>
              <td className="py-2">{player.losses}</td>
              <td className="py-2">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardPage;
