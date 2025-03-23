import { getCurrentLeaguePeriod } from './leagueUtils';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Helper function to get business days in a month
const getBusinessDaysInMonth = (year, month) => {
    const dates = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
            dates.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// Generate round-robin pairings
const generatePairings = (players) => {
    const pairings = [];
    const gamesPerPlayer = 33;
    
    // Calculate how many times we need to repeat the round-robin to get close to 33 games per player
    const baseRoundRobinGames = (players.length - 1); // Games per player in one round
    const roundsNeeded = Math.ceil(gamesPerPlayer / baseRoundRobinGames);
    
    // Generate multiple rounds of pairings
    for (let round = 0; round < roundsNeeded; round++) {
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                pairings.push([players[i], players[j]]);
            }
        }
    }
    
    // Shuffle the pairings to make the schedule more random
    for (let i = pairings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairings[i], pairings[j]] = [pairings[j], pairings[i]];
    }
    
    // Now ensure each player gets exactly 33 games
    const playerGames = {};
    players.forEach(p => playerGames[p] = 0);
    
    // Filter pairings to get exactly 33 games per player
    return pairings.filter(([p1, p2]) => {
        if (playerGames[p1] >= gamesPerPlayer || playerGames[p2] >= gamesPerPlayer) {
            return false;
        }
        playerGames[p1]++;
        playerGames[p2]++;
        return true;
    });
};

// Distribute fixtures across available business days
const distributeFixtures = (pairings, businessDays) => {
    const fixtures = [];
    // Take first 20 business days
    const scheduleDays = businessDays.slice(0, 20);
    
    // Calculate average games per day needed
    const gamesPerDay = Math.ceil(pairings.length / scheduleDays.length);
    let pairingIndex = 0;
    
    // Distribute games evenly across the 20 business days
    scheduleDays.forEach(date => {
        // Add up to gamesPerDay fixtures for this date
        for (let i = 0; i < gamesPerDay && pairingIndex < pairings.length; i++) {
            const [player1, player2] = pairings[pairingIndex];
            fixtures.push({
                player1,
                player2,
                date,
                completed: false,
                winner: null
            });
            pairingIndex++;
        }
    });
    
    return fixtures;
};

export const generateMonthlyFixtures = async (players) => {
    try {
        const currentDate = new Date();
        const businessDays = getBusinessDaysInMonth(
            currentDate.getFullYear(),
            currentDate.getMonth()
        );
        
        // Generate all possible pairings
        const pairings = generatePairings(players);
        
        // Distribute fixtures across business days
        const fixtures = distributeFixtures(pairings, businessDays);
        
        // Save fixtures to Firebase
        const fixturesRef = collection(db, 'fixtures');
        const savedFixtures = [];
        
        for (const fixture of fixtures) {
            const docRef = await addDoc(fixturesRef, {
                ...fixture,
                leaguePeriod: getCurrentLeaguePeriod(),
                date: fixture.date
            });
            savedFixtures.push({ id: docRef.id, ...fixture });
        }
        
        return savedFixtures;
    } catch (error) {
        console.error('Error generating fixtures:', error);
        throw error;
    }
};