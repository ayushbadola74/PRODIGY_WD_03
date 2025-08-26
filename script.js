// --------- Elements ----------
const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const modeEl = document.getElementById('mode');
const swapEl = document.getElementById('swap');
const newEl = document.getElementById('new');
const resetEl = document.getElementById('reset');
const sx = document.getElementById('sx'),
      so = document.getElementById('so'),
      sd = document.getElementById('sd');

// --------- State ----------
let board, turn, lock, scores = { X:0, O:0, D:0 }, firstPlayer = 'X';

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function fresh(){
  board = Array(9).fill('');
  turn = firstPlayer;
  lock = false;
  render();
  setStatus(`${turn} to move.`);
  gridEl.classList.add('pulse'); setTimeout(()=>gridEl.classList.remove('pulse'), 400);
  if (modeEl.value==='ai' && turn==='O') aiMove();
}

// --------- UI ----------
function cellTemplate(i){
  const v = board[i];
  return `<button class="cell ${v?'disabled':''}" data-i="${i}" aria-label="cell ${i+1}">
            ${v}
          </button>`;
}
function render(){
  gridEl.innerHTML = Array.from({length:9}, (_,i)=>cellTemplate(i)).join('');
  document.querySelectorAll('.cell').forEach(btn=>{
    btn.addEventListener('click', onCellClick);
  });
}
function setStatus(msg){ 
  statusEl.textContent = msg; 
}
function highlight(cells){
  cells.forEach(i=>{
    const el = gridEl.querySelector(`.cell[data-i="${i}"]`);
    if(el) el.classList.add('win');
  });
}

// --------- Game Logic ----------
function onCellClick(e){
  const i = +e.currentTarget.dataset.i;
  if (lock || board[i]) return;
  move(i, turn);
  const res = evaluate(board);
  if(res.over){
    end(res);
  }else{
    turn = turn === 'X' ? 'O':'X';
    setStatus(`${turn} to move.`);
    if(modeEl.value==='ai' && turn==='O') aiMove();
  }
}
function move(i, player){
  board[i] = player;
  render();
}
function evaluate(b){
  for(const line of wins){
    const [a,b1,c] = line;
    if(b[a] && b[a]===b[b1] && b[a]===b[c]) return { over:true, win:b[a], line };
  }
  if(b.every(x=>x)) return { over:true, win:null }; // draw
  return { over:false };
}
function end(res){
  lock = true;
  if(res.win){
    setStatus(`${res.win} wins!`);
    highlight(res.line);
    scores[res.win]++; 
  }else{
    setStatus(`It's a draw.`);
    scores.D++;
  }
  sx.textContent = scores.X; so.textContent = scores.O; sd.textContent = scores.D;
}

// --------- AI (Minimax with memo) ----------
// --------- Unbeatable AI (Full Minimax) ----------
function minimax(b, depth, isMax) {
  const res = evaluate(b);
  if (res.over) {
    if (res.win === 'O') return 10 - depth;   // AI wins
    if (res.win === 'X') return depth - 10;   // Player wins
    return 0; // Draw
  }

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'O'; // AI move
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'X'; // Human move
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = '';
      }
    }
    return best;
  }
}

function findBestMove() {
  let bestVal = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let moveVal = minimax(board, 0, false);
      board[i] = '';
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }
  return bestMove;
}

function aiMove() {
  if (lock) return;
  const index = findBestMove();
  if (index !== -1) {
    setTimeout(() => {
      move(index, 'O');
      const res = evaluate(board);
      if (res.over) { end(res); }
      else { turn = 'X'; setStatus(`${turn} to move.`); }
    }, 300);
  }
}

// --------- Controls ----------
newEl.addEventListener('click', fresh);
resetEl.addEventListener('click', ()=>{
  scores = {X:0,O:0,D:0}; sx.textContent=0; so.textContent=0; sd.textContent=0;
  fresh();
});
swapEl.addEventListener('click', ()=>{
  firstPlayer = firstPlayer==='X'?'O':'X';
  swapEl.textContent = `Swap First Turn (Now: ${firstPlayer})`;
  fresh();
});
modeEl.addEventListener('change', fresh);

// Init
fresh();
