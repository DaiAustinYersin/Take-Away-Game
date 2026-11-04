import { newGame, takeCoins, optimalMove } from './game.js';

const $ = (id) => document.getElementById(id);
let startingCoins = 100;
let maxTake = 10;
let state = newGame(startingCoins, maxTake);
let selected = 1;
let mode = 'computer';
let timer;

function render() {
  const thinking = mode === 'computer' && state.turn === 'Beth' && !state.winner;
  $('count').textContent = state.remaining;
  $('custom-amount-row').hidden = maxTake <= 20;
  $('custom-amount').max = Math.min(maxTake, state.remaining);
  $('custom-amount').value = selected;
  $('custom-amount').disabled = thinking || !!state.winner;
  $('amount-feedback').textContent = '';
  $('custom-amount').removeAttribute('aria-invalid');
  $('jar-note').hidden = state.remaining <= 100;
  $('turn-label').textContent = state.winner ? `★  ${state.winner} wins!` : `●  ${state.turn}’s turn`;
  $('move-number').textContent = state.history.length ? `MOVE ${state.history.length}` : 'LET’S BEGIN';
  $('message').textContent = state.winner ? `${state.winner} takes the last coin. Well played!` : thinking ? 'Beth is thinking…' : state.history.length ? `Your move, ${state.turn}. Make it count.` : 'The first move is yours, Amy.';
  $('coins').replaceChildren(...Array.from({ length: Math.min(100, state.remaining) }, (_, i) => {
    const coin = document.createElement('span');
    coin.className = 'coin';
    coin.style.setProperty('--tilt', `${((i * 17) % 25) - 12}deg`);
    return coin;
  }));
  $('choices').replaceChildren(...Array.from({ length: Math.min(maxTake, 20) }, (_, i) => {
    const button = document.createElement('button');
    const amount = i + 1;
    button.textContent = amount;
    button.className = amount === selected ? 'selected' : '';
    button.setAttribute('aria-pressed', String(amount === selected));
    button.setAttribute('aria-label', `Take ${amount} ${amount === 1 ? 'coin' : 'coins'}`);
    button.disabled = thinking || !!state.winner || amount > state.remaining;
    button.onclick = () => { selected = amount; render(); };
    return button;
  }));
  $('selected-count').textContent = `${selected} ${selected === 1 ? 'coin' : 'coins'}`;
  $('take').disabled = thinking || !!state.winner;
  $('hint').disabled = thinking || !!state.winner;
  $('range-label').textContent = state.winner ? 'Game complete' : `Choose 1–${Math.min(maxTake, state.remaining)} coins`;
  $('history-count').textContent = `${state.history.length} MOVES`;
  $('empty-history').hidden = state.history.length > 0;
  $('history').replaceChildren(...[...state.history].reverse().map((move, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="move-avatar">${move.player[0]}</span><div><strong>${move.player}</strong><span>took ${move.amount} ${move.amount === 1 ? 'coin' : 'coins'}</span></div><span class="remaining">${move.remaining} left<small>#${state.history.length - i}</small></span>`;
    return li;
  }));
}

function move(amount) {
  state = takeCoins(state, amount);
  selected = Math.min(selected, state.remaining || 1);
  $('hint-text').hidden = true;
  render();
  if (mode === 'computer' && state.turn === 'Beth' && !state.winner) {
    timer = setTimeout(() => move(optimalMove(state.remaining, maxTake)), 700);
  }
}
function reset() {
  clearTimeout(timer);
  state = newGame(startingCoins, maxTake);
  selected = 1;
  $('hint-text').hidden = true;
  render();
}
$('take').onclick = () => {
  if (!state.winner && !(mode === 'computer' && state.turn === 'Beth')) move(selected);
};
$('restart').onclick = reset;
$('hint').onclick = () => {
  const remainder = state.remaining % (maxTake + 1);
  $('hint-text').textContent = remainder ? `Try taking ${remainder} ${remainder === 1 ? 'coin' : 'coins'} to leave a multiple of ${maxTake + 1}. That gives you a winning position if you keep playing optimally.` : `This is a tricky position: no move guarantees a win against perfect play. Take any legal amount and watch for a chance to leave a multiple of ${maxTake + 1}.`;
  $('hint-text').hidden = false;
};
document.querySelectorAll('.mode').forEach(button => {
  button.onclick = () => {
    if (mode === button.dataset.mode) return;
    mode = button.dataset.mode;
    document.querySelectorAll('.mode').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    reset();
  };
});
function renderSettings() {
  const label = `${startingCoins.toLocaleString()} ${startingCoins === 1 ? 'coin' : 'coins'}`;
  $('intro-total').textContent = label;
  $('footer-total').textContent = label;
  $('rule-max').textContent = maxTake;
  const base = maxTake + 1;
  const firstMove = startingCoins % base;
  $('strategy-content').innerHTML = firstMove
    ? `<h3>Amy can force a win.</h3><p>With ${label}, take <strong>${firstMove} ${firstMove === 1 ? 'coin' : 'coins'}</strong> first, leaving ${startingCoins - firstMove}.${startingCoins <= maxTake ? ' This empties the jar immediately.' : ` After Beth takes <em>x</em> coins, Amy takes <strong>${base} − x</strong>, leaving another multiple of ${base} until she empties the jar.`}</p>`
    : `<h3>Beth can force a win.</h3><p>${startingCoins.toLocaleString()} is a multiple of ${base}. After Amy takes <em>x</em> coins, Beth takes <strong>${base} − x</strong>. Each pair removes ${base} coins, so Beth takes the last coin with optimal play.</p>`;
  const explanation = document.createElement('p');
  explanation.textContent = `With 1–${maxTake} coins allowed per turn, multiples of ${base} are losing positions for the player whose turn it is: every legal move lets the opponent return to a multiple of ${base}.`;
  $('strategy-content').append(explanation);
}
function applyStartingCoins() {
  const input = $('starting-coins');
  const feedback = $('coin-setting-feedback');
  const limitInput = $('max-take');
  input.removeAttribute('aria-invalid');
  limitInput.removeAttribute('aria-invalid');
  const invalid = [input, limitInput].find(field => !field.validity.valid);
  if (invalid) {
    feedback.textContent = 'Enter a whole number from 1 to 10,000 for each setting.';
    feedback.classList.add('error');
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  feedback.classList.remove('error');
  startingCoins = input.valueAsNumber;
  maxTake = limitInput.valueAsNumber;
  reset();
  renderSettings();
  feedback.textContent = `New game started with ${startingCoins.toLocaleString()} ${startingCoins === 1 ? 'coin' : 'coins'}. Take 1–${maxTake} per turn. Amy goes first.`;
}
// Sandboxed previews may allow scripts while blocking form submission.
$('apply-coins').onclick = applyStartingCoins;
[$('starting-coins'), $('max-take')].forEach(input => { input.onkeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    applyStartingCoins();
  }
}; });
$('custom-amount').oninput = () => {
  const input = $('custom-amount');
  const valid = input.validity.valid;
  $('take').disabled = !valid;
  input.setAttribute('aria-invalid', String(!valid));
  $('amount-feedback').textContent = valid ? '' : `Choose a whole number from 1 to ${Math.min(maxTake, state.remaining)}.`;
  if (valid) {
    selected = input.valueAsNumber;
    $('selected-count').textContent = `${selected} ${selected === 1 ? 'coin' : 'coins'}`;
    document.querySelectorAll('#choices button').forEach(button => {
      const active = Number(button.textContent) === selected;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
};
render();
renderSettings();
