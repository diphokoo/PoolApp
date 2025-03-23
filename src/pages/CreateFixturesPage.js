// src/pages/CreateFixturesPage.js
import React, { useState } from 'react';
import { db } from '../js/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getCurrentLeaguePeriod } from '../js/leagueUtils';

function CreateFixturesPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const players = ['Obakeng', 'Potso', 'Kyle', 'Willie'];

  const createFixtures = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const daysInMonth = 20;
      const gamesPerPlayer = 33;
      const gamesPerDay = Math.ceil((players.length * gamesPerPlayer) / (2 * daysInMonth)); // Divide by 2 since each game involves 2 players

      // Generate all possible combinations of players
      let fixtures = [];
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          const required = Math.ceil(gamesPerPlayer / (players.length - 1));
          for (let k = 0; k < required; k++) {
            fixtures.push({
              player1: players[i],
              player2: players[j],
            });
          }
        }
      }

      // Shuffle the fixtures randomly
      fixtures = fixtures.sort(() => Math.random() - 0.5);

      // Distribute games across the 20 days
      let dayIndex = 0;
      for (let i = 0; i < fixtures.length; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + dayIndex);
        
        await addDoc(collection(db, 'fixtures'), {
          ...fixtures[i],
          winner: null,
          date: currentDate.toISOString().split('T')[0],
          leaguePeriod: getCurrentLeaguePeriod(),
          isFixture: true
        });

        // Move to next day if we've reached games per day limit
        if ((i + 1) % gamesPerDay === 0) {
          dayIndex = (dayIndex + 1) % daysInMonth;
        }
      }

      alert('Fixtures created successfully!');
    } catch (error) {
      console.error('Error creating fixtures:', error);
      setError(error.message || 'Failed to create fixtures. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Fixtures</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button
        onClick={createFixtures}
        disabled={submitting}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {submitting ? 'Creating Fixtures...' : 'Create Fixtures'}
      </button>
    </div>
  );
}

export default CreateFixturesPage;