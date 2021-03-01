const board = {
  col: 10,
  row: 8,
};
var table = document.querySelector("#board");
var divs;
var blocks;
var bombPositions;
var totalFlags;
var flagsRemained;
var totalRevealed;
var currentMode = 10; //10 - easy, 40 - medium, 99 - hard
function Block() {
  this.revealed = false;
  this.count = 0;
  this.bombed = false;
}
function newBoard(bombsNumber) {
  flagsRemained = bombsNumber;
  totalFlags = bombsNumber;
  totalRevealed = 0;
  table.innerHTML = "";
  var table_code = "";
  let boardSize = board.col * board.row;
  let layoutIndicator = false;
  for (var i = 0; i < board.row; i++) {
    for (var j = 0; j < board.col; j++) {
      table_code += `<div class="empty `;
      if (layoutIndicator) table_code += `darker"></div>`;
      else table_code += `brighter"></div>`;
      layoutIndicator = !layoutIndicator;
    }
    layoutIndicator = !layoutIndicator;
  }
  table.innerHTML = table_code;
  divs = document.querySelectorAll("#board div");
  blocks = new Array(boardSize);
  for (var i = 0; i < blocks.length; i++) {
    blocks[i] = new Block();
  }
  clickEvent();
}
function bombsDraw(pos) {
  var poss = [
    pos - board.col - 1,
    pos - board.col,
    pos - board.col + 1,
    pos - 1,
    pos,
    pos + 1,
    pos + board.col - 1,
    pos + board.col,
    pos + board.col + 1,
  ];
  bombPositions = [];
  boardSize = board.col * board.row;
  while (bombPositions.length < currentMode) {
    let x = Math.floor(Math.random() * boardSize);
    if (bombPositions.indexOf(x) == -1 && poss.indexOf(x) == -1)
      bombPositions.push(x);
  }
  bombPositions.forEach((val) => {
    blocks[val].bombed = true;
    for (let xoff = -1; xoff <= 1; xoff++) {
      for (let yoff = -1; yoff <= 1; yoff++) {
        var i = Math.floor(val / board.col) + yoff;
        var j = (val % board.col) + xoff;
        var idx = i * board.col + j;
        if (i > -1 && i < board.row && j > -1 && j < board.col) {
          blocks[idx].count++;
        }
      }
    }
  });
}
var firstClick = false;
var timeInterval;
var time = 0;
function clickEvent() {
  divs.forEach((item, index) => {
    divs[index].addEventListener("click", function qwer() {
      if (!divs[index].classList.contains("flagged")) {
        if (!firstClick) {
          bombsDraw(index);
          firstClick = true;
          timeInterval = setInterval(() => {
            document.querySelector("#time_counter").innerText = ++time;
          }, 1000);
        }
        if (blocks[index].bombed) {
          this.style.background = "red";
          endOfGame("loose");
        } else if (blocks[index].count == 0) revealAll(index);
        else showCount(index);
        this.removeEventListener("click", qwer);
        checkRevealed();
      }
    });
    divs[index].addEventListener("contextmenu", () => {
      if (!blocks[index].revealed) {
        if (divs[index].classList.contains("flagged")) flagsRemained++;
        else flagsRemained--;
        divs[index].classList.toggle("flagged");
        document.querySelector("#flag_counter").innerText = flagsRemained;
      }
    });
  });
}
/* FUNCTIONS TO REVEAL */

function revealAll(index) {
  blocks[index].reveal = true;
  divs[index].classList.remove("empty");
  divs[index].classList.add("revealed");
  let x = revealCheck(index);
  var alreadyChecked = [...x];
  for (var i = 0; i < x.length; i++) {
    revealAllLoop(alreadyChecked, x[i]);
  }
}
function revealAllLoop(alreadyChecked, index) {
  let x = revealCheck(index);
  for (var i = 0; i < x.length; i++) {
    if (alreadyChecked.indexOf(x[i]) != -1) continue;
    alreadyChecked.push(x[i]);
    revealAllLoop(alreadyChecked, x[i]);
  }
}
function revealCheck(index) {
  let emptyField = [];
  let border = [];
  for (let xoff = -1; xoff <= 1; xoff++) {
    for (let yoff = -1; yoff <= 1; yoff++) {
      var i = Math.floor(index / board.col) + yoff;
      var j = (index % board.col) + xoff;
      var idx = i * board.col + j;
      if (i > -1 && i < board.row && j > -1 && j < board.col) {
        if (blocks[idx].count == 0) emptyField.push(idx);
        else showCount(idx);
      }
    }
  }
  emptyField.forEach((val) => {
    if (divs[val].classList.contains("flagged")) {
      flagsRemained++;
      divs[val].classList.remove("flagged");
      document.querySelector("#flag_counter").innerText = flagsRemained;
    }
    divs[val].classList.remove("empty");
    divs[val].classList.add("revealed");
    blocks[val].revealed = true;
  });
  return emptyField;
}
function rightCLick(index) {
  let x = [];
  let flags = 0;
  for (let xoff = -1; xoff <= 1; xoff++) {
    for (let yoff = -1; yoff <= 1; yoff++) {
      var i = Math.floor(index / board.col) + yoff;
      var j = (index % board.col) + xoff;
      var idx = i * board.col + j;
      if (i > -1 && i < board.row && j > -1 && j < board.col) {
        if (divs[idx].classList.contains("flagged")) {
          flags++;
        } else x.push(idx);
      }
    }
  }
  if (flags == blocks[index].count) {
    x.forEach((val) => {
      if (blocks[val].bombed) {
        divs[val].style.background = "red";
        endOfGame("loose");
      } else if (blocks[val].count == 0) revealAll(val);
      else showCount(val);
    });
  }
  checkRevealed();
}

/* END OF REVEAL'S FUNCTIONS */
function checkRevealed() {
  let x = 0;
  blocks.forEach((val, idx) => {
    if (blocks[idx].revealed) x++;
  });
  totalRevealed = x;
  if (totalRevealed >= board.col * board.row - totalFlags) endOfGame("win");
}
function showCount(index) {
  if (!blocks[index].revealed)
    divs[index].addEventListener("click", () => {
      rightCLick(index);
    });
  if (divs[index].classList.contains("flagged")) {
    flagsRemained++;
    divs[index].classList.remove("flagged");
    document.querySelector("#flag_counter").innerText = flagsRemained;
  }
  blocks[index].revealed = true;
  divs[index].classList.remove("empty");
  divs[index].classList.add("revealed");
  divs[index].innerText = blocks[index].count;
  switch (blocks[index].count) {
    case 1:
      divs[index].classList.add("one");
      break;
    case 2:
      divs[index].classList.add("two");
      break;
    case 3:
      divs[index].classList.add("three");
      break;
    case 4:
      divs[index].classList.add("four");
      break;
    case 5:
      divs[index].classList.add("five");
      break;
    default:
      divs[index].classList.add("more");
  }
}
function endOfGame(score) {
  scoreSlide(score);
  document.querySelector("#board").style.pointerEvents = "none";
  clearInterval(timeInterval);
}
window.addEventListener("load", () => {
  newBoard(10);
});
table.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
document.querySelector("#reload").addEventListener("click", () => {
  changeBoard(currentMode);
});
/* CHANGING BOARD */
function changeBoard() {
  let x = document.querySelector("#game_mode").value;
  let main = document.querySelector("main");
  let header = document.querySelector("header");
  switch (x) {
    case "Easy":
      board.col = 10;
      board.row = 8;
      currentMode = 10;
      newBoard(10);
      main.style.width = "400px";
      header.style.width = "400px";
      divs.forEach((singleDiv) => {
        singleDiv.style.width = "40px";
        singleDiv.style.height = "40px";
      });
      break;
    case "Medium":
      board.col = 18;
      board.row = 14;
      currentMode = 40;
      newBoard(40);
      main.style.width = "540px";
      header.style.width = "540px";
      divs.forEach((singleDiv) => {
        singleDiv.style.width = "30px";
        singleDiv.style.height = "30px";
      });
      break;
    case "Hard":
      board.col = 24;
      board.row = 20;
      currentMode = 99;
      newBoard(99);
      main.style.width = "600px";
      header.style.width = "600px";
      divs.forEach((singleDiv) => {
        singleDiv.style.width = "25px";
        singleDiv.style.height = "25px";
        singleDiv.style.fontSize = "20px";
      });
      break;
  }
  document.querySelector("#board").style.pointerEvents = "auto";
  document.querySelector(".score").innerText = "";
  document.querySelector(".score").classList.remove("loose");
  document.querySelector("#flag_counter").innerText = flagsRemained;
  clearInterval(timeInterval);
  document.querySelector("#time_counter").innerText = 0;
  time = 0;
  firstClick = false;
}
/* LAST SCREEN ANIMATION */
function scoreSlide(state) {
  document.querySelector("#dimmer").style.display = "block";
  document.querySelector(".endPage").classList.add("active");
  document.querySelector(".zagraj.info").style.visibility = "visible";
  if (state == "win") {
    document.querySelector("#timeScore").innerText = time;
    document.querySelector(".wynikWin").style.display = "block";
  } else {
    document.querySelector(".wynikLoose").style.display = "block";
  }
  document.querySelector(".zagraj.info").addEventListener("click", newGame);
}
function newGame() {
  document.querySelector(".zagraj.info").removeEventListener("click", newGame);
  document.querySelector(".zagraj.info").style.visibility = "hidden";
  document.querySelector(".wynikWin").style.display = "none";
  document.querySelector(".wynikLoose").style.display = "none";
  document.querySelector("#dimmer").style.display = "none";
  document.querySelector(".endPage").classList.remove("active");
  changeBoard(currentMode);
}
