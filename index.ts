import { data } from "./data.js";

type StorageRecord = {
  date: Date;
  name: string;
  WPM: number;
  accuracy: string;
  correctChars: number;
  incorrectChars: number;
};

const difficultyInput = document.querySelector(
  ".difficulty",
)! as HTMLFieldSetElement;
const difficultyInputMobile = document.querySelector(
  ".difficulty-mobile",
)! as HTMLSelectElement;
const modeInput = document.querySelector(".mode")! as HTMLFieldSetElement;
const modeInputMobile = document.querySelector(
  ".mode-mobile",
)! as HTMLSelectElement;
const textContainer = document.querySelector(
  ".text-container",
)! as HTMLDivElement;
const startButton = document.querySelector(
  ".start-button",
) as HTMLButtonElement;
const startButtonContainer = document.querySelector(
  ".start-button-container",
) as HTMLDivElement;
const timeRemainingContainer = document.querySelector(
  ".time-remaining",
) as HTMLSpanElement;
const accuracyContainer = document.querySelectorAll(
  ".accuracy-container",
) as NodeListOf<HTMLSpanElement>;
const testCompleteModal = document.querySelector(
  ".test-complete-container",
) as HTMLElement;
const wpmContainer = document.querySelectorAll(".wpm-container") as NodeList;
const correctCharContainer = document.querySelector(
  ".correct-char-container",
) as HTMLSpanElement;
const incorrectCharContainer = document.querySelector(
  ".incorrect-char-container",
) as HTMLSpanElement;
const restartButton = document.querySelector(
  ".restart-btn",
) as HTMLButtonElement;
const testCompleteButton = document.querySelector(
  ".test-complete-btn",
) as HTMLButtonElement;
const textCompleteTitle = document.querySelector(
  ".test-complete-title",
) as HTMLHeadingElement;
const historyTableBody = document.querySelector(
  ".history-table-body",
) as HTMLTableElement;
const personalBestContainer = document.querySelector(
  ".personal-best",
) as HTMLSpanElement;
const deleteHistoryBtn = document.querySelector(
  ".delete-history-btn",
) as HTMLButtonElement;
const confetti = document.querySelector(".confetti") as HTMLImageElement;
const testCompleteImage = document.querySelector(
  ".test-complete-img",
) as HTMLImageElement;
const toggleHistoryBtns = document.querySelectorAll(
  ".toggle-history-btn",
) as NodeListOf<HTMLButtonElement>;
const shareBtn = document.querySelector('.share-results-btn') as HTMLButtonElement;

type difficultyType = "easy" | "medium" | "hard";
let currentIndex = 0;
let testDuration = 60;
let difficulty: difficultyType = "medium";
let mode = "timed";
let elapsed: number;
let timerInterval: number;
let testStarted = false;
let isFocusedOnText = false;

difficultyInput.addEventListener("change", (e) => {
  setDifficulty(e);
});
difficultyInputMobile.addEventListener("change", (e) => {
  setDifficulty(e);
});
modeInput.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  mode = target.value;
});
modeInputMobile.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  mode = target.value;
});

document.addEventListener("DOMContentLoaded", () => {
  generateRandomTest();
  populateHistory();
  establishPersonalRecord();
});
document.addEventListener("click", (e) => {
  const clickedElement = e.target as HTMLElement;
  if (
    textContainer.contains(clickedElement) ||
    textContainer === clickedElement
  ) {
    isFocusedOnText = true;
  } else {
    isFocusedOnText = false;
  }
});
document.addEventListener("keydown", handleKeydown);

toggleHistoryBtns.forEach((button) => {
  button.addEventListener("click", openHistory);
});

startButton.addEventListener("click", startTest);

restartButton.addEventListener("click", restartTest);
shareBtn.addEventListener('click', shareScore)

testCompleteButton.addEventListener("click", restartTest);
deleteHistoryBtn.addEventListener("click", deleteHistory);


function startTest() {
  document.removeEventListener('keydown', moveCursor)
  currentIndex = 0;
  testStarted = true;
  // ce trebuie sa se intample cand utilizatorul apasa pe butonul de start:
  // dispare butonul si overlay-ul care cauza blur🏗️
  // pentru asta trebuie sa am o interfata suprapusa cu textul care are un buton de start si un fundal cu blur ✅
  // de creat in HTML/CSS✅

  startButtonContainer.style.display = "none";
  textContainer.classList.remove("inactive");
  // Incepe timerul✅
  // stergem orice clasa de correct/incorrect/cursor-at si le punem de la primul caracter
  handleInputs(true);
  const charSpans = document.querySelectorAll<HTMLSpanElement>(".input-char");
  charSpans.forEach((char) => char.classList.remove("correct", "incorrect"));
  restartButton.style.display = "flex";
  charSpans[0]?.classList.add("cursor-at");
  // adaugam logica de miscare a cursorului + verificarea daca e corect sau nu
  // cand timpul expira ( remainingTime <= 0 )
  // timerul se opreste (clearInterval)
  // cursor at dispare deoarece ajunge la capat sau s-a terminat
  // calculam caracterele corecte si incorecte
  // calculam viteza de scriere
  // calculam acuratetea bazata pe ce procentaj din caracterele scrise sunt corecte

  let startTime = Date.now();
  timerInterval = setInterval(() => {
    elapsed = (Date.now() - startTime) / 1000;
    if (mode === "timed") {
      const remaining = Math.max(0, testDuration - elapsed);
      if (remaining <= 0) {
        endTest(elapsed);
      }
      timeRemainingContainer.textContent = `${remaining.toFixed(1)}s`;
    } else {
      timeRemainingContainer.textContent = `${elapsed.toFixed(1)}s`;
    }
  }, 100);
  document.addEventListener("keydown", moveCursor);
}

function restartTest() {
  document.removeEventListener('keydown', handleKeydown)
  clearInterval(timerInterval);
  handleInputs(false);
  testStarted = false;
  startButtonContainer.style.display = "block";
  currentIndex = 0;
  textContainer.classList.add("inactive");
  const charSpans = document.querySelectorAll<HTMLSpanElement>(".input-char");
  charSpans.forEach((char) =>
    char.classList.remove("correct", "incorrect", "cursor-at"),
  );
  testCompleteModal.style.display = "none";
  restartButton.style.display = "none";
  document.removeEventListener("keydown", handleKeydown);
  confetti.style.display = "none";
  
  timeRemainingContainer.textContent = `${String(testDuration)}s`;

  generateRandomTest();
  document.addEventListener("keydown", handleKeydown)
}
function handleKeydown(e: KeyboardEvent) {
  if (isFocusedOnText && !testStarted) {
    startTest();
  }
}

function moveCursor(e: KeyboardEvent) {
  const charSpans = document.querySelectorAll<HTMLSpanElement>(".input-char");
  // Handle Backspace FIRST (before other checks)
  if (e.key === "Backspace") {
    e.preventDefault();

    if (currentIndex > 0) {
      // Remove cursor from current position
      charSpans[currentIndex]?.classList.remove("cursor-at");

      // Move back
      currentIndex--;

      // Clear previous character and add cursor
      charSpans[currentIndex]?.classList.remove("correct", "incorrect");
      charSpans[currentIndex]?.classList.add("cursor-at");
    }
    return;
  }

  // Ignore special keys (Shift, Ctrl, Arrow keys, etc.)
  if (e.key.length > 1) return;

  // Ignore modifier key combinations
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  // Safety check - make sure we're still within bounds
  const currentChar = charSpans[currentIndex];
  if (!currentChar) return;

  // Remove all existing classes BEFORE checking
  currentChar.classList.remove("cursor-at", "correct", "incorrect");

  // Check if typed key matches
  const isCorrect = e.key === currentChar.textContent;
  currentChar.classList.add(isCorrect ? "correct" : "incorrect");

  // Move to next character
  currentIndex++;

  // Add cursor to next character (if exists)
  if (currentIndex < charSpans.length) {
    charSpans[currentIndex]?.classList.add("cursor-at");
  } else {
    endTest(elapsed);
  }
}

function endTest(elapsed: number) {
  clearInterval(timerInterval);
  handleInputs(false);
  const { WPM, accuracy, correctChars, incorrectChars } = getTestStats();
  const raw = window.localStorage.getItem('history');
  const storage = raw ? JSON.parse(raw) : []
  const personalRecord = Math.max(
    ...storage.map((item: StorageRecord) => item.WPM),
  );
  restartButton.style.display = "none";
  wpmContainer.forEach((container) => {
    container.textContent = String(WPM);
  });
  
  accuracyContainer.forEach((container) => {
    container.classList.remove("good", "bad", "medium");
    container.textContent = accuracy;
    const accNumber = Math.round(
      (correctChars / (correctChars + incorrectChars)) * 100,
    );

    switch (true) {
      case accNumber > 90:
        container.classList.add("good");
        break;
      case accNumber < 90 && accNumber > 70:
        container.classList.add("medium");
        break;
      case accNumber < 70:
        container.classList.add("bad");
        break;
      default:
        return;
    }
  });
  if (storage !== null && storage.length > 0) {
    if (personalRecord < WPM) {
      testCompleteImage.src = "./assets/images/icon-new-pb.svg";
      textCompleteTitle.textContent = "High Score Smashed!";
      confetti.style.display = "flex";
    } else {
      testCompleteImage.src = "./assets/images/icon-completed.svg";
      textCompleteTitle.textContent = "Test Complete!";
      confetti.style.display = "none";
    }
  } else {
    textCompleteTitle.textContent = "Baseline established!";
  }
  correctCharContainer.textContent = String(correctChars);
  correctCharContainer.classList.add("good");
  incorrectCharContainer.textContent = String(incorrectChars);
  incorrectCharContainer.classList.add("bad");
  textContainer.classList.add("inactive");
  testCompleteModal.style.display = "flex";
  saveScoreToStorage();
  establishPersonalRecord();
  populateHistory();
}

function handleInputs(isDisabled: boolean) {
  difficultyInput.disabled = isDisabled;

  difficultyInputMobile.disabled = isDisabled;
  modeInput.disabled = isDisabled;
  modeInputMobile.disabled = isDisabled;
  toggleHistoryBtns.forEach((button) => {
    button.disabled = isDisabled;
  });
}

function getTestStats() {
  const totalChars = document.querySelectorAll<HTMLSpanElement>(".input-char");
  const correctChars =
    document.querySelectorAll<HTMLSpanElement>(".correct").length;
  const incorrectChars =
    document.querySelectorAll<HTMLSpanElement>(".incorrect").length;
  let accuracy = totalChars.length === 0 
  ? '0%' 
  : `${Math.round((correctChars / totalChars.length) * 100)}%`;
  let wordsTyped = correctChars / 5;
  let WPM = (elapsed > 0 && wordsTyped > 0) ? Math.floor(wordsTyped / (elapsed / 60)) : 0;
  return { WPM, accuracy, totalChars, correctChars, incorrectChars };
}

function generateRandomTest() {
  const currentDifficulty = document.querySelector(
    'input[name="diffInput"]:checked',
  ) as HTMLInputElement;
  const randomText =
    data[currentDifficulty.value as difficultyType][
      Math.floor(Math.random() * 10)
    ];

  textContainer.innerHTML = transformData(randomText!.text);
}

function saveScoreToStorage() {
  const { WPM, accuracy, correctChars, incorrectChars } = getTestStats();
  let raw = window.localStorage.getItem("history");
  const storage = raw ? JSON.parse(raw) : [];
  if (storage.length === 0) {
    storage.push({
      date: new Date(Date.now()).toLocaleDateString("ro-Ro", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: "baseline",
      WPM,
      accuracy,
      correctChars,
      incorrectChars,
    });
  } else {
    storage.push({
      date: new Date(Date.now()).toLocaleDateString("ro-Ro", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: "new-entry",
      WPM,
      accuracy,
      correctChars,
      incorrectChars,
    });
  }
  localStorage.setItem("history", JSON.stringify(storage));
}

function openHistory() {
  const historyTab = document.querySelector(".test-history") as HTMLDivElement;

  historyTab.classList.toggle("show");
}

function populateHistory() {
  const rawData = window.localStorage.getItem("history");
  const storage = rawData ? JSON.parse(rawData) : [];
  const personalBest = Math.max(
    ...storage.map((test: StorageRecord) => test.WPM),
  );
  historyTableBody.innerHTML = storage
    .map((item: StorageRecord) => {
      return `<tr>
            <td>${item.date}</td>
            <td>${item.WPM}</td>
            <td>${item.accuracy}</td>
            <td>${item.correctChars}/ ${item.incorrectChars}</td>
            <td>${personalBest === item.WPM ? '<img src="../assets/images/icon-personal-best.svg" />' : ""}</td>
          </tr>`;
    })
    .join("");
}

function deleteHistory() {
  window.localStorage.removeItem("history");
  populateHistory();

  establishPersonalRecord();
}

function establishPersonalRecord() {
  const rawData = window.localStorage.getItem("history");
  const storageData = rawData ? JSON.parse(rawData) : [];
  let personalBestWPM: string | number = "--";
  if (storageData.length > 0) {
    personalBestWPM = Math.max(
      ...storageData.map((test: StorageRecord) => test.WPM),
    );
  }
  personalBestContainer.textContent = String(personalBestWPM);
}
function setDifficulty(e: Event) {
  const target = e.target as HTMLInputElement;
  difficulty = target.value as difficultyType;
  const newText = generateRandomText(difficulty);
  textContainer.innerHTML = transformData(newText!.text);
}

function transformData(data: string) {
  return data
    .split("")
    .map((char) => `<span class="input-char">${char}</span>`)
    .join("");
}

function generateRandomText(difficulty: difficultyType) {
  return data[difficulty][Math.floor(Math.random() * 10)];
}

function shareScore() {
  const { WPM, accuracy } = getTestStats();
  const text = `
  ⌨️ I just took a typing test!

⚡ Speed: ${WPM} WPM
🎯 Accuracy: ${accuracy}%
⏱️ Time: ${testDuration}

Try it yourself:
https://typing-test0121.netlify.app/
`;
  navigator.clipboard.writeText(text);
}
