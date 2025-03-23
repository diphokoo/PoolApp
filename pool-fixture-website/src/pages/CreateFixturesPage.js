import React, { useState, useEffect } from 'react';
import { db } from '../js/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { generateMonthlyFixtures } from '../js/fixtureGenerator';

function CreateFixturesPage() {
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPlayersAndFixtures = async () => {
      try {
        const fixturesRef = collection(db, 'fixtures');
        const snapshot = await getDocs(fixturesRef);
        const uniquePlayers = new Set();
        const fixturesList = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.player1) uniquePlayers.add(data.player1);
          if (data.player2) uniquePlayers.add(data.player2);
          const fixtureData = doc.data();
          fixturesList.push({
            id: doc.id,
            ...fixtureData,
            date: fixtureData.date ? (typeof fixtureData.date.toDate === 'function' ? fixtureData.date.toDate() : new Date(fixtureData.date)) : null
          });
        });
        
        setPlayers(Array.from(uniquePlayers).sort());
        setFixtures(fixturesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchPlayersAndFixtures();
  }, []);

  const handleAutoGenerate = async () => {
    if (players.length < 2) {
      setError('Need at least 2 players to generate fixtures');
      return;
    }

    try {
      setLoading(true);
      await generateMonthlyFixtures(players);
      
      // Refresh the fixtures list
      const fixturesRef = collection(db, 'fixtures');
      const snapshot = await getDocs(fixturesRef);
      const fixturesList = [];
      snapshot.forEach(doc => {
        const fixtureData = doc.data();
        fixturesList.push({
          id: doc.id,
          ...fixtureData,
          date: fixtureData.date ? (typeof fixtureData.date.toDate === 'function' ? fixtureData.date.toDate() : new Date(fixtureData.date)) : null
        });
      });
      
      setFixtures(fixturesList);
      setSuccess('Fixtures generated successfully!');
    } catch (err) {
      console.error('Error generating fixtures:', err);
      setError('Failed to generate fixtures');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Fixtures</h2>
          <button
            onClick={handleAutoGenerate}
            disabled={loading || players.length < 2}
            className={`p-3 rounded ${
              loading || players.length < 2
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Generate Monthly Fixtures
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fixtures
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((fixture) => (
                <tr key={fixture.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fixture.date ? fixture.date.toLocaleDateString() : 'No date'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{fixture.player1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fixture.player2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {Math.ceil(fixtures.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(fixtures.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(fixtures.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(fixtures.length / itemsPerPage)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFixturesPage;