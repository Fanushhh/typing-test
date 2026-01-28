console.log('hello there');


const difficultyInput = document.querySelector('#difficulty-fieldset')! as HTMLFieldSetElement;
const modeInput = document.querySelector('#mode-fieldset')! as HTMLFieldSetElement;

difficultyInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})
modeInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
})
