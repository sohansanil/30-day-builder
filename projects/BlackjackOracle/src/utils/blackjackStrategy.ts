export type Action = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT';

export interface AnalysisResult {
  recommendation: Action;
  playerBustProb: number;
  dealerBustProb: number;
  evHit: number;
  evStand: number;
  explanations: string[];
}

// Approximate Dealer Bust Probabilities based on Upcard (Infinite Deck Math)
export const dealerBustProbs: Record<number, number> = {
  2: 0.35, 3: 0.37, 4: 0.40, 5: 0.42, 6: 0.42,
  7: 0.26, 8: 0.24, 9: 0.23, 10: 0.21, 11: 0.11 // 11 is Ace
};

// Approximate Player Bust Probabilities when hitting a hard total
export const playerBustProbs: Record<number, number> = {
  4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
  12: 0.31, 13: 0.39, 14: 0.46, 15: 0.54, 16: 0.62,
  17: 0.69, 18: 0.77, 19: 0.85, 20: 0.92, 21: 1.00
};

export function analyzeHand(playerTotal: number, dealerUpcard: number, isSoft: boolean = false): AnalysisResult {
  const dCard = dealerUpcard === 1 ? 11 : dealerUpcard; // Treat 1 as Ace (11)
  const pTotal = playerTotal;
  
  let rec: Action = 'STAND';
  let evHit = 0;
  let evStand = 0;
  let explanations: string[] = [];
  
  const dProb = dealerBustProbs[dCard] || 0.21;
  const pProb = isSoft ? 0 : (playerBustProbs[pTotal] || 0);

  // --- HARD TOTALS ---
  if (!isSoft) {
    if (pTotal <= 8) {
      rec = 'HIT';
      evHit = 0.10; evStand = -0.40;
      explanations.push("You cannot bust on a hit.");
      explanations.push("Your total is too low to stand competitively.");
    } else if (pTotal === 9) {
      if (dCard >= 3 && dCard <= 6) {
        rec = 'DOUBLE';
        evHit = 0.25; evStand = -0.20;
        explanations.push(`Dealer ${dCard} has a high bust rate (${Math.round(dProb*100)}%).`);
        explanations.push("Doubling maximizes EV when the dealer is weak.");
      } else {
        rec = 'HIT';
        evHit = 0.15; evStand = -0.30;
        explanations.push(`Dealer ${dCard} is strong, doubling is risky.`);
        explanations.push("Hitting is necessary to improve your 9.");
      }
    } else if (pTotal === 10) {
      if (dCard >= 2 && dCard <= 9) {
        rec = 'DOUBLE';
        evHit = 0.40; evStand = -0.10;
        explanations.push("You have a strong starting hand (10).");
        explanations.push(`Doubling against a ${dCard} gives you a significant mathematical edge.`);
      } else {
        rec = 'HIT';
        evHit = 0.20; evStand = -0.25;
        explanations.push(`Dealer has a ${dCard}, which is too strong to safely double.`);
        explanations.push("Hitting still offers positive EV.");
      }
    } else if (pTotal === 11) {
      if (dCard >= 2 && dCard <= 10) {
        rec = 'DOUBLE';
        evHit = 0.50; evStand = -0.05;
        explanations.push("11 is the best starting hand in Blackjack.");
        explanations.push(`Doubling maximizes your return against a dealer ${dCard}.`);
      } else {
        rec = 'HIT';
        evHit = 0.30; evStand = -0.10;
        explanations.push("Dealer has an Ace, doubling is slightly negative EV.");
        explanations.push("Hitting is the safest mathematical play.");
      }
    } else if (pTotal >= 12 && pTotal <= 16) {
      if (dCard >= 2 && dCard <= 6) {
        // Special case: 12 vs 2 or 3
        if (pTotal === 12 && (dCard === 2 || dCard === 3)) {
          rec = 'HIT';
          evHit = -0.20; evStand = -0.25;
          explanations.push(`Dealer ${dCard} doesn't bust often enough (${Math.round(dProb*100)}%) to save your 12.`);
          explanations.push("Hitting has slightly less negative EV than standing.");
        } else {
          rec = 'STAND';
          evStand = -0.15; evHit = -0.30;
          explanations.push(`Dealer ${dCard} is a 'bust card' with a ${Math.round(dProb*100)}% chance of busting.`);
          explanations.push(`Hitting risks a ${Math.round(pProb*100)}% chance of busting yourself.`);
          explanations.push("Let the dealer take the risk.");
        }
      } else {
        rec = 'HIT';
        evHit = -0.40; evStand = -0.50;
        explanations.push(`Dealer ${dCard} is a strong upcard. They are likely to make a hand.`);
        explanations.push(`Standing loses too often against a dealer ${dCard}.`);
        explanations.push(`Even though hitting has a ${Math.round(pProb*100)}% bust chance, it has a better EV.`);
        explanations.push("Historical data heavily favors hitting in this state.");
      }
    } else if (pTotal >= 17) {
      rec = 'STAND';
      evStand = -0.05; evHit = -0.60; // rough EV
      explanations.push(`You have a made hand (${pTotal}).`);
      explanations.push(`Hitting carries a massive ${Math.round(pProb*100)}% risk of busting.`);
      explanations.push("Standing maximizes your expected value.");
    }
  } else {
    // --- SOFT TOTALS (Aces) ---
    if (pTotal <= 17) {
      if (dCard >= 3 && dCard <= 6) {
        rec = 'DOUBLE';
        evHit = 0.15; evStand = -0.10;
        explanations.push(`Dealer ${dCard} is weak.`);
        explanations.push(`Doubling a soft ${pTotal} is a profitable aggressive play.`);
      } else {
        rec = 'HIT';
        evHit = 0.10; evStand = -0.20;
        explanations.push(`Soft ${pTotal} cannot bust on a hit.`);
        explanations.push(`Hitting improves your win probability against a dealer ${dCard}.`);
      }
    } else if (pTotal === 18) {
      if (dCard >= 2 && dCard <= 6) {
        rec = 'DOUBLE';
        evHit = 0.25; evStand = 0.15;
        explanations.push(`Dealer is weak (${dCard}).`);
        explanations.push("Doubling soft 18 maximizes profit.");
      } else if (dCard <= 8) {
        rec = 'STAND';
        evStand = 0.20; evHit = 0.05;
        explanations.push("Soft 18 is a strong hand against a 7 or 8.");
        explanations.push("Standing preserves your edge.");
      } else {
        rec = 'HIT';
        evHit = -0.10; evStand = -0.20;
        explanations.push(`Dealer ${dCard} is very strong.`);
        explanations.push("18 often loses to 9, 10, or Ace. Hitting is a free chance to improve since it's soft.");
      }
    } else if (pTotal >= 19) {
      rec = 'STAND';
      evStand = 0.40; evHit = -0.10;
      explanations.push(`Soft ${pTotal} is an exceptionally strong hand.`);
      explanations.push("Standing locks in your high probability of winning.");
    }
  }

  // Adjust EVs slightly for realism (just estimates for UI demonstration)
  // In a real system these would be exact to 4 decimal places from a database.
  
  return {
    recommendation: rec,
    playerBustProb: pProb,
    dealerBustProb: dProb,
    evHit,
    evStand,
    explanations
  };
}
