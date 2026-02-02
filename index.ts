
import {data} from './data.js'


const difficultyInput = document.querySelector('.difficulty')! as HTMLFieldSetElement;
const difficultyInputMobile = document.querySelector('.difficulty-mobile')! as HTMLSelectElement;
const modeInput = document.querySelector('.mode')! as HTMLFieldSetElement;
const modeInputMobile = document.querySelector('.mode-mobile')! as HTMLSelectElement;
const textContainer = document.querySelector('.text-container')! as HTMLDivElement;
const startButton = document.querySelector('.start-button') as HTMLButtonElement;
const startButtonContainer = document.querySelector('.start-button-container') as HTMLDivElement;
const timeRemainingContainer = document.querySelector('.time-remaining') as HTMLSpanElement;
const accuracyContainer = document.querySelector('.accuracy-container') as HTMLSpanElement;
let currentIndex = 0;
let testDuration = 60;
difficultyInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})
difficultyInputMobile.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})
modeInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})
modeInputMobile.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})

document.addEventListener('DOMContentLoaded', () => {
    
    const text = data["medium"][8]!.text;
    textContainer.innerHTML = transformData(text)
    
    
    
})




function transformData(data:string) {
    return data.split('').map(char => `<span class="input-char">${char}</span>`).join('');
}





startButton.addEventListener('click', startTest)


function startTest(){
    currentIndex = 0;
    let timerInterval:number;
    // ce trebuie sa se intample cand utilizatorul apasa pe butonul de start:
    // dispare butonul si overlay-ul care cauza blur🏗️
        // pentru asta trebuie sa am o interfata suprapusa cu textul care are un buton de start si un fundal cu blur ✅
        // de creat in HTML/CSS✅
    startButtonContainer.style.display = 'none';
    textContainer.classList.remove('inactive')
    // Incepe timerul✅
    // stergem orice clasa de correct/incorrect/cursor-at si le punem de la primul caracter
    const charSpans = document.querySelectorAll<HTMLSpanElement>('.input-char');
    charSpans.forEach(char => char.classList.remove('correct', 'incorrect'))
    
    charSpans[0]?.classList.add('cursor-at')
    // adaugam logica de miscare a cursorului + verificarea daca e corect sau nu
    // cand timpul expira ( remainingTime <= 0 )
    // timerul se opreste (clearInterval)
    // cursor at dispare deoarece ajunge la capat sau s-a terminat
    // calculam caracterele corecte si incorecte
    // calculam viteza de scriere 
    // calculam acuratetea bazata pe ce procentaj din caracterele scrise sunt corecte

    let startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, testDuration - elapsed)
        if(remaining <= 0){
            endTest(timerInterval, elapsed);
            
        }
        timeRemainingContainer.textContent = `${remaining.toFixed(1)}s`
    },100)
    document.addEventListener("keydown", moveCursor); 
}

function moveCursor(e:KeyboardEvent ){
    const charSpans = document.querySelectorAll<HTMLSpanElement>('.input-char');
// Handle Backspace FIRST (before other checks)
  if (e.key === 'Backspace') {
    e.preventDefault();
    
    if (currentIndex > 0) {
      // Remove cursor from current position
      charSpans[currentIndex]?.classList.remove('cursor-at');
      
      // Move back
      currentIndex--;
      
      // Clear previous character and add cursor
      charSpans[currentIndex]?.classList.remove('correct', 'incorrect');
      charSpans[currentIndex]?.classList.add('cursor-at');
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
  currentChar.classList.remove('cursor-at', 'correct', 'incorrect');
  
  // Check if typed key matches
  const isCorrect = e.key === currentChar.textContent;
  currentChar.classList.add(isCorrect ? 'correct' : 'incorrect');
  
  // Move to next character
  currentIndex++;
  
  // Add cursor to next character (if exists)
  if (currentIndex < charSpans.length) {
    charSpans[currentIndex]?.classList.add('cursor-at');
  } else {
    console.log('Test complete!');
  }
}

function endTest(timerInterval:number, elapsed:number){
    clearInterval(timerInterval);
    const totalChars = document.querySelectorAll<HTMLSpanElement>('.input-char');
    const correctChars = document.querySelectorAll<HTMLSpanElement>('.correct');
    const incorrectChars = document.querySelectorAll<HTMLSpanElement>('.incorrect');
    
    let accuracy = `${Math.round(correctChars.length / (correctChars.length + incorrectChars.length) * 100)}%`;
    let wordsTyped = correctChars.length / 5;
    console.log(correctChars.length)
    console.log(elapsed)
    let WPM = Math.floor(wordsTyped / (elapsed / 60) );
    
    accuracyContainer.textContent = accuracy;
}