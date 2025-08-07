let target = null;
let attempts = [];
const maxTries = 6;

function fetchWordsAndStartGame() {
  fetch("techterms.json")
    .then(res => res.json())
    .then(words => {
      const todayIndex = new Date().getDate() % words.length;
      target = words[todayIndex];
      console.log("Today's term:", target.term);

      renderEmptyBoard();     // ⬅️ You need this
      renderKeyboard();    
    });
}

function renderEmptyBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = "";
  
    for (let row = 0; row < maxTries; row++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("row");
  
      for (let col = 0; col < 5; col++) {
        const tile = document.createElement("div");
        tile.className = "tile empty";
        tile.id = `tile-${row}-${col}`;
        rowDiv.appendChild(tile);
      }
  
      board.appendChild(rowDiv);
    }
  }

  const keyRows = [
    "0123456789"
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];
  

  function renderKeyboard() {
    const kb = document.getElementById("keyboard");
    kb.innerHTML = "";
  
    keyRows.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "keyboard-row";
  
      row.split("").forEach(letter => {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.className = "key";
        btn.onclick = () => handleKey(letter);
        rowDiv.appendChild(btn);
      });
  
      kb.appendChild(rowDiv);
    });
  
    // Add Enter and Backspace buttons below as a final row
    const ctrlRow = document.createElement("div");
    ctrlRow.className = "keyboard-row";
  
    const enter = document.createElement("button");
    enter.textContent = "Enter";
    enter.className = "key wide";
    enter.onclick = submitGuess;
    ctrlRow.appendChild(enter);
  
    const del = document.createElement("button");
    del.textContent = "⌫";
    del.className = "key wide";
    del.onclick = () => handleKey("BACKSPACE");
    ctrlRow.appendChild(del);
  
    kb.appendChild(ctrlRow);
  }
  

  let currentRow = 0;
  let currentCol = 0;
  let currentGuess = "";
  
  function handleKey(key) {
    if (key === "BACKSPACE") {
      if (currentCol > 0) {
        currentCol--;
        currentGuess = currentGuess.slice(0, -1);
        document.getElementById(`tile-${currentRow}-${currentCol}`).textContent = "";
      }
      return;
    }
  
    if (key.length === 1 && currentCol < 5) {
        const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
        tile.textContent = key;
        tile.classList.add("pop");
      
        setTimeout(() => {
          tile.classList.remove("pop");
        }, 200);
      
        currentGuess += key.toLowerCase();
        currentCol++;
      }
      
  }

  function updateKeyboard(guess) {
    guess.split("").forEach((letter, i) => {
      const upperLetter = letter.toUpperCase();
      const key = Array.from(document.getElementsByClassName("key")).find(
        k => k.textContent.trim() === upperLetter
      );
  
      if (!key) return;
  
      const isCorrect = target.term[i] === letter;
      const isPresent = !isCorrect && target.term.includes(letter);
  
      // Don't downgrade correct keys
      if (isCorrect) {
        key.classList.remove("present", "absent");
        key.classList.add("correct");
      } else if (isPresent) {
        if (!key.classList.contains("correct")) {
          key.classList.remove("absent");
          key.classList.add("present");
        }
      } else {
        if (
          !key.classList.contains("correct") &&
          !key.classList.contains("present")
        ) {
          key.classList.add("absent");
        }
      }
    });
  }
  
  function submitGuess() {
    if (currentGuess.length !== 5) {
        const row = document.getElementsByClassName("row")[currentRow];
        row.classList.add("shake");
        setTimeout(() => row.classList.remove("shake"), 400);
        alert("Enter a full 5-letter word.");
        return;
      }      
  
    attempts.push(currentGuess);
    updateBoard(currentRow, currentGuess);
    updateKeyboard(currentGuess);
  
    const normalizedGuess = currentGuess.toLowerCase().trim();
    const normalizedTarget = target.term.toLowerCase().trim();
  
    if (normalizedGuess === normalizedTarget) {
      console.log("🎉 Correct guess detected:", normalizedGuess);
      endGame(true);
      return;
    } else if (currentRow >= maxTries - 1) {
      endGame(false);
      return;
    }
  
    currentRow++;
    currentCol = 0;
    currentGuess = "";
  }
  

  function updateBoard(row, guess) {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const tile = document.getElementById(`tile-${row}-${i}`);
  
      // Delay flip for staggered reveal
      setTimeout(() => {
        tile.textContent = letter.toUpperCase();
        tile.classList.add("flip");
  
        if (letter === target.term[i]) {
          tile.classList.add("correct");
        } else if (target.term.includes(letter)) {
          tile.classList.add("present");
        } else {
          tile.classList.add("absent");
        }
      }, i * 300);
    }
  }
  

  function endGame(won) {
    const result = document.getElementById("result");
    result.innerHTML = won
      ? `<h2>🎉 Correct!</h2>`
      : `<h2>❌ Out of tries. The word was <strong>${target.term.toUpperCase()}</strong></h2>`;
  
    result.innerHTML += `
      <p><a href="${target.definition_url}" target="_blank">View full definition on TechTarget</a></p>
      <p>${target.intro}</p>
    `;
  
    if (target.related_links && target.related_links.length > 0) {
      let related = `<h4>Continue reading:</h4><ul>`;
      target.related_links.forEach(link => {
        related += `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
      });
      related += `</ul>`;
      result.innerHTML += related;
    }
  
    // ✅ Flash background
    result.classList.add("flash");
    setTimeout(() => result.classList.remove("flash"), 1000);
  
    // ✅ Scroll into view
    result.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
  

// Scroll to result
document.getElementById("result").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
  
  // Flash background
  const result = document.getElementById("result");
  result.classList.add("flash");
  setTimeout(() => result.classList.remove("flash"), 1000);
  

document.addEventListener("DOMContentLoaded", () => {
    fetchWordsAndStartGame();
  });
  
  document.addEventListener("keydown", (e) => {
    const key = e.key;
  
    if (key === "Enter") {
      submitGuess();
    } else if (key === "Backspace") {
      handleKey("BACKSPACE");
    } else if (/^[a-zA-Z]$/.test(key)) {
      handleKey(key.toUpperCase());
    }
  });
  
