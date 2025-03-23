import React, { useEffect, useState } from 'react';
import { db } from '../js/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function HomePage() {
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent matches (completed fixtures)
        const matchesQuery = query(
          collection(db, 'fixtures'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchesData = matchesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(match => match.winner); // Only show completed matches

        // Fetch upcoming fixtures (without winners)
        const fixturesQuery = query(
          collection(db, 'fixtures'),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        const fixturesSnapshot = await getDocs(fixturesQuery);
        const fixturesData = fixturesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(fixture => !fixture.winner); // Only show pending fixtures

        setRecentMatches(matchesData);
        setUpcomingFixtures(fixturesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Pool League</h1>
        <p className="text-gray-600">Track matches, view fixtures, and check the leaderboard</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          {recentMatches.length === 0 ? (
            <p className="text-gray-500">No recent matches</p>
          ) : (
            <div className="space-y-4">
              {recentMatches.map(match => (
                <div key={match.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {match.player1} vs {match.player2}
                      </p>
                      <p className="text-sm text-gray-600">
                        Winner: {match.winner}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(match.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Fixtures</h2>
          {upcomingFixtures.length === 0 ? (
            <p className="text-gray-500">No upcoming fixtures</p>
          ) : (
            <div className="space-y-4">
              {upcomingFixtures.map(fixture => (
                <div key={fixture.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">
                      {fixture.player1} vs {fixture.player2}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(fixture.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Link
          to="/create-fixtures"
          className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        >
          Create New Fixture
        </Link>
        <Link
          to="/match-result"
          className="block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
        >
          Record Match Result
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/leaderboard"
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          View Full Leaderboard →
        </Link>
      </div>
    </div>
  );
}

export default HomePage;