const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const currentPlayerSpan = document.getElementById("currentPlayer");
const resultDiv = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");

let currentPlayer = "X";
let gameActive = true;

// مصفوفة تمثل حالة المربعات
let gameState = ["", "", "", "", "", "", "", "", ""];

// كل الإحتمالات للفوز
const winningConditions = [
  [0, 1, 2], // صف أول
  [3, 4, 5], // صف ثاني
  [6, 7, 8], // صف ثالث
  [0, 3, 6], // عمود أول
  [1, 4, 7], // عمود ثاني
  [2, 5, 8], // عمود ثالث
  [0, 4, 8], // قطري
  [2, 4, 6]  // قطري
];

function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = cell.getAttribute("data-index");

  // لو المربع مستخدم أو اللعبة انتهت => تجاهل
  if (gameState[cellIndex] !== "" || !gameActive) {
    return;
  }

  // حط X أو O في المصفوفة وفي المربع
  gameState[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer);

  checkResult();
}

function checkResult() {
  let roundWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    const valA = gameState[a];
    const valB = gameState[b];
    const valC = gameState[c];

    if (valA === "" || valB === "" || valC === "") continue;

    if (valA === valB && valB === valC) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    resultDiv.textContent = `🎉 اللاعب ${currentPlayer} فاز!`;
    gameActive = false;
    return;
  }

  // تعادل؟
  const isDraw = !gameState.includes("");
  if (isDraw) {
    resultDiv.textContent = "😅 تعادل!";
    gameActive = false;
    return;
  }

  // تغيير الدور
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  currentPlayerSpan.textContent = currentPlayer;
}

function resetGame() {
  currentPlayer = "X";
  gameActive = true;
  gameState = ["", "", "", "", "", "", "", "", ""];
  currentPlayerSpan.textContent = currentPlayer;
  resultDiv.textContent = "";

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
  });
}

// events
cells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

resetBtn.addEventListener("click", resetGame);
