import { data } from "./data.js";

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
type difficultyType = "easy" | "medium" | "hard";
let currentIndex = 0;
let testDuration = 60;
let difficulty: difficultyType = "medium";
let mode = "timed";
let elapsed: number;
let timerInterval: number;
difficultyInput.addEventListener("change", (e) => {
  setDifficulty(e);
});
difficultyInputMobile.addEventListener("change", (e) => {
  setDifficulty(e);
});
modeInput.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  mode = target.value;
  setMode(mode);
});
modeInputMobile.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  mode = target.value;
  setMode(mode);
});

document.addEventListener("DOMContentLoaded", () => {
  generateRandomTest();
});

function setDifficulty(e: Event) {
  const target = e.target as HTMLInputElement;
  difficulty = target.value as difficultyType;
  const newText = generateRandomText(difficulty);
  textContainer.innerHTML = transformData(newText!.text);
}

function setMode(mode: string) {}

function transformData(data: string) {
  return data
    .split("")
    .map((char) => `<span class="input-char">${char}</span>`)
    .join("");
}

function generateRandomText(difficulty: difficultyType) {
  return data[difficulty][Math.floor(Math.random() * 10)];
}

startButton.addEventListener("click", startTest);
restartButton.addEventListener("click", restartTest);
testCompleteButton.addEventListener('click', restartTest);

function startTest() {
  currentIndex = 0;

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
  clearInterval(timerInterval);
  handleInputs(false);
  startButtonContainer.style.display = "block";
  currentIndex = 0;
  textContainer.classList.add("inactive");
  const charSpans = document.querySelectorAll<HTMLSpanElement>(".input-char");
  charSpans.forEach((char) =>
    char.classList.remove("correct", "incorrect", "cursor-at"),
  );
  testCompleteModal.style.display = "none";
  restartButton.style.display = "none";
  document.removeEventListener("keydown", moveCursor);
  generateRandomTest();
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
  const { correctChars, incorrectChars } = getTestStats();

  let accuracy = `${Math.round((correctChars.length / (correctChars.length + incorrectChars.length)) * 100)}%`;
  let wordsTyped = correctChars.length / 5;
  let WPM = Math.floor(wordsTyped / (elapsed / 60));
  restartButton.style.display = 'none';
  wpmContainer.forEach((container) => {
    container.textContent = String(WPM);
  });
  accuracyContainer.forEach((container) => {
    container.textContent = accuracy;
    const accNumber = Math.round(
      (correctChars.length / (correctChars.length + incorrectChars.length)) *
        100,
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

  correctCharContainer.textContent = String(correctChars.length);
  correctCharContainer.classList.add("good");
  incorrectCharContainer.textContent = String(incorrectChars.length);
  incorrectCharContainer.classList.add("bad");
  textContainer.classList.add("inactive");
  testCompleteModal.style.display = "flex";
}

function handleInputs(isDisabled: boolean) {
  difficultyInput.disabled = isDisabled;

  difficultyInputMobile.disabled = isDisabled;
  modeInput.disabled = isDisabled;
  modeInputMobile.disabled = isDisabled;
}

function getTestStats() {
  const totalChars = document.querySelectorAll<HTMLSpanElement>(".input-char");
  const correctChars = document.querySelectorAll<HTMLSpanElement>(".correct");
  const incorrectChars =
    document.querySelectorAll<HTMLSpanElement>(".incorrect");
  return { totalChars, correctChars, incorrectChars };
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
