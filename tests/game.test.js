import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, takeCoins, optimalMove } from '../game.js';

test('rules: 100 coins, Amy first, alternate turns, empty jar wins', () => {
  let state = newGame();
  assert.equal(state.remaining, 100);
  assert.equal(state.turn, 'Amy');
  state = takeCoins(state, 10);
  assert.equal(state.turn, 'Beth');
  for (let i = 0; i < 9; i++) state = takeCoins(state, 10);
  assert.equal(state.winner, 'Beth');
  assert.equal(state.remaining, 0);
  assert.equal(state.history.length, 10);
  assert.throws(() => takeCoins(state, 1), RangeError);
});

test('reject illegal moves without changing the state', () => {
  const state = newGame();
  for (const amount of [0, -1, 11, 1.5, NaN, '1']) assert.throws(() => takeCoins(state, amount), RangeError);
  assert.equal(state.remaining, 100);
  assert.throws(() => takeCoins({ ...state, remaining: 3 }, 4), RangeError);
});

test('strategy matches independent winning-position calculation at every jar size', () => {
  const winning = [false];
  for (let n = 1; n <= 100; n++) {
    winning[n] = Array.from({ length: Math.min(10, n) }, (_, i) => !winning[n - i - 1]).some(Boolean);
    assert.equal(winning[n], n % 11 !== 0);
    const move = optimalMove(n);
    assert.ok(move >= 1 && move <= Math.min(10, n));
    if (winning[n]) assert.equal(winning[n - move], false);
  }
});

test('Amy’s strategy wins against every possible Beth response', () => {
  function explore(state) {
    if (state.winner) { assert.equal(state.winner, 'Amy'); return; }
    if (state.turn === 'Amy') explore(takeCoins(state, optimalMove(state.remaining)));
    else for (let amount = 1; amount <= Math.min(10, state.remaining); amount++) {
      const next = takeCoins(state, amount);
      // All responses lead back to the same next multiple of 11 after Amy replies.
      const reply = takeCoins(next, optimalMove(next.remaining));
      assert.equal(reply.remaining % 11, 0);
      if (amount === 1) explore(reply);
      if (reply.winner) assert.equal(reply.winner, 'Amy');
    }
  }
  explore(newGame());
});


test('custom totals are validated and supported through a full game', () => {
  for (const total of [1, 10, 11, 25, 101, 10000]) {
    let state = newGame(total);
    assert.equal(state.remaining, total);
    while (!state.winner) state = takeCoins(state, optimalMove(state.remaining));
    assert.equal(state.winner, total % 11 ? 'Amy' : 'Beth');
    assert.equal(state.remaining, 0);
  }
  for (const total of [0, -1, 1.5, NaN, Infinity, '25', 10001]) {
    assert.throws(() => newGame(total), RangeError);
  }
});

test('custom move limits match independently computed winning positions', () => {
  for (const limit of [1, 3, 7, 20, 100]) {
    const winning = [false];
    for (let n = 1; n <= 110; n++) {
      winning[n] = Array.from({ length: Math.min(limit, n) }, (_, i) => !winning[n - i - 1]).some(Boolean);
      const move = optimalMove(n, limit);
      assert.ok(move >= 1 && move <= Math.min(limit, n));
      if (winning[n]) assert.equal(winning[n - move], false);
      const state = takeCoins(newGame(n, limit), move);
      assert.equal(state.maxTake, limit);
    }
    assert.throws(() => takeCoins(newGame(200, limit), limit + 1), RangeError);
  }
  for (const limit of [0, -1, 1.5, NaN, Infinity, '3', 10001]) {
    assert.throws(() => newGame(17, limit), RangeError);
    assert.throws(() => optimalMove(17, limit), RangeError);
  }
});
