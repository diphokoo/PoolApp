// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { db } from '../js/firebase';
import { collection, getDocs } from 'firebase/firestore';

function HomePage() {
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const fetchFixtures = async () => {
      const fixturesCollection = collection(db, 'fixtures');
      const fixturesSnapshot = await getDocs(fixturesCollection);
      const fixturesList = fixturesSnapshot.docs.map(doc => doc.data());
      setFixtures(fixturesList);
    };

    fetchFixtures();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upcoming Fixtures</h1>
      <ul className="space-y-2">
        {fixtures.map((fixture, index) => (
          <li key={index} className="bg-white p-4 rounded shadow">
            {fixture.player1} vs {fixture.player2} on {fixture.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
