import React, { useEffect, useState } from 'react';
import { db } from '../js/firebase';
import { collection, getDocs } from 'firebase/firestore';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('wins'); // wins, winRate, matches

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const fixturesRef = collection(db, 'fixtures');
        const snapshot = await getDocs(fixturesRef);
        
        // Calculate stats for each player
        const playerStats = {};
        
        snapshot.forEach(doc => {
          const match = doc.data();
          if (!match.winner) return; // Skip pending matches

          // Initialize player stats if needed
          [match.player1, match.player2].forEach(player => {
            if (!playerStats[player]) {
              playerStats[player] = {
                name: player,
                matches: 0,
                wins: 0,
                losses: 0,
                points: 0,
                winRate: 0
              };
            }
          });

          // Update stats
          playerStats[match.player1].matches++;
          playerStats[match.player2].matches++;
          
          if (match.winner === match.player1) {
            playerStats[match.player1].wins++;
            playerStats[match.player1].points += 3;
            playerStats[match.player2].losses++;
          } else {
            playerStats[match.player2].wins++;
            playerStats[match.player2].points += 3;
            playerStats[match.player1].losses++;
          }
        });

        // Calculate win rates and convert to array
        const leaderboardData = Object.values(playerStats).map(player => ({
          ...player,
          winRate: player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : 0
        }));

        // Sort data
        sortLeaderboard(leaderboardData);
        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const sortLeaderboard = (data) => {
    switch (sortBy) {
      case 'wins':
        data.sort((a, b) => b.points - a.points || b.wins - a.wins || b.winRate - a.winRate);
        break;
      case 'winRate':
        data.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
        break;
      case 'matches':
        data.sort((a, b) => b.matches - a.matches || b.wins - a.wins);
        break;
      default:
        data.sort((a, b) => b.wins - a.wins);
    }
  };

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
    const newLeaderboard = [...leaderboard];
    sortLeaderboard(newLeaderboard);
    setLeaderboard(newLeaderboard);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Leaderboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => handleSort('wins')}
            className={`px-4 py-2 rounded ${
              sortBy === 'wins'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Sort by Wins
          </button>
          <button
            onClick={() => handleSort('winRate')}
            className={`px-4 py-2 rounded ${
              sortBy === 'winRate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Sort by Win Rate
          </button>
          <button
            onClick={() => handleSort('matches')}
            className={`px-4 py-2 rounded ${
              sortBy === 'matches'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Sort by Matches
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matches
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wins
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Losses
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((player, index) => (
              <tr 
                key={player.name}
                className={`${index < 3 ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-yellow-700' : 'bg-gray-100'
                  } text-sm font-medium`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {player.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.matches}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {player.wins}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {player.losses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  {player.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.winRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardPage;