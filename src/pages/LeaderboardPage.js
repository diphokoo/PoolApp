// src/pages/LeaderboardPage.js
import React, { useEffect, useState } from 'react';
import { db } from '../js/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { getCurrentLeaguePeriod } from '../js/leagueUtils';

function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const currentLeaguePeriod = getCurrentLeaguePeriod();
        const statsCollection = collection(db, 'playerStats');
        const q = query(
          statsCollection,
          where('leaguePeriod', '==', currentLeaguePeriod),
          orderBy('points', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const playersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().playerName,
          wins: doc.data().wins,
          matches: doc.data().matches,
          losses: doc.data().matches - doc.data().wins,
          points: doc.data().points,
        }));
        setPlayers(playersList);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Monthly League Leaderboard</h1>
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