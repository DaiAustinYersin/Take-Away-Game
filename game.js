export const STARTING_COINS = 100;
export const MAX_TAKE = 10;
export const MAX_STARTING_COINS = 10000;

export function optimalMove(remaining, maxTake = MAX_TAKE) {
  if (!Number.isInteger(remaining) || remaining < 1) throw new RangeError('The jar must contain coins.');
  validateMaxTake(maxTake);
  return remaining % (maxTake + 1) || 1;
}

export function takeCoins(state, amount) {
  if (state.winner || !Number.isInteger(amount) || amount < 1 || amount > Math.min(state.maxTake ?? MAX_TAKE, state.remaining)) {
    throw new RangeError(`Choose 1 to ${Math.min(state.maxTake ?? MAX_TAKE, state.remaining)} available coins.`);
  }
  const remaining = state.remaining - amount;
  return {
    remaining,
    maxTake: state.maxTake ?? MAX_TAKE,
    turn: remaining === 0 ? state.turn : state.turn === 'Amy' ? 'Beth' : 'Amy',
    winner: remaining === 0 ? state.turn : null,
    history: [...state.history, { player: state.turn, amount, remaining }],
  };
}

export function newGame(total = STARTING_COINS, maxTake = MAX_TAKE) {
  if (!Number.isInteger(total) || total < 1 || total > MAX_STARTING_COINS) {
    throw new RangeError(`Choose a whole number from 1 to ${MAX_STARTING_COINS}.`);
  }
  validateMaxTake(maxTake);
  return { remaining: total, maxTake, turn: 'Amy', winner: null, history: [] };
}

function validateMaxTake(maxTake) {
  if (!Number.isInteger(maxTake) || maxTake < 1 || maxTake > MAX_STARTING_COINS) {
    throw new RangeError('Maximum per turn must be a whole number from 1 to 10,000.');
  }
}
