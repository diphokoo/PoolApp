import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Get the current league period (Spring/Autumn + Year)
export function getCurrentLeaguePeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based (0 = January)
    
    // Spring is months 0-5 (January-June)
    // Autumn is months 6-11 (July-December)
    const season = month <= 5 ? 'Spring' : 'Autumn';
    
    return `${season} ${year}`;
}

// Get all matches for the current league period
export async function getMatches() {
    const leaguePeriod = getCurrentLeaguePeriod();
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, where('leaguePeriod', '==', leaguePeriod));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Add a new match result
export async function addMatch(player1, player2, winner, date) {
    const leaguePeriod = getCurrentLeaguePeriod();
    const matchesRef = collection(db, 'matches');
    const match = {
        player1,
        player2,
        winner,
        date: Timestamp.fromDate(date),
        leaguePeriod
    };
    await addDoc(matchesRef, match);
}

// Update player stats and points
export const updatePlayerStats = async (player1, player2, winner) => {
    const leaguePeriod = getCurrentLeaguePeriod();
    
    // Get or create stats documents for both players
    await updatePlayerStatsDoc(player1, winner === player1, leaguePeriod);
    await updatePlayerStatsDoc(player2, winner === player2, leaguePeriod);
};

// Update individual player stats
const updatePlayerStatsDoc = async (playerName, isWinner, leaguePeriod) => {
    const statsQuery = query(
        collection(db, 'playerStats'),
        where('playerName', '==', playerName),
        where('leaguePeriod', '==', leaguePeriod)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    if (querySnapshot.empty) {
        // Create new stats document for player
        await addDoc(collection(db, 'playerStats'), {
            playerName,
            leaguePeriod,
            matches: 1,
            wins: isWinner ? 1 : 0,
            points: isWinner ? 3 : 0,
            lastUpdated: Timestamp.now()
        });
    } else {
        // Update existing stats
        const statsDoc = querySnapshot.docs[0];
        const currentStats = statsDoc.data();
        
        await statsDoc.ref.update({
            matches: currentStats.matches + 1,
            wins: currentStats.wins + (isWinner ? 1 : 0),
            points: currentStats.points + (isWinner ? 3 : 0),
            lastUpdated: Timestamp.now()
        });
    }
};