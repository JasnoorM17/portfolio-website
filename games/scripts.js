const gameContainer = document.querySelector('.container')
const crabItems = document.querySelectorAll('.item')
let startGame, startTime, countDown = 20, score = 0;
const timeCount = document.getElementById('time-count');
const scoreCount = document.getElementById('score-count')

gameContainer.addEventListener('click', function(e){
    if(e.target.classList.contains('crab-clicked')){
        score++;
        scoreCount.innerHTML = score;

        const castleElm = e.target.parentElement.previousElementSibling;
        
        let textElm = document.createElement('span');
        textElm.setAttribute('class', 'hit-text');
        textElm.innerHTML = "Hit!";
        castleElm.appendChild(textElm);

        setTimeout(() => {
            textElm.remove();
        }, 300);
    }
})

document.addEventListener('DOMContentLoaded', () => {
    startTime = setInterval(() => {
    timeCount.innerHTML = countDown;
    countDown--;
    }, 1000);
    
    startGame = setInterval(() => {
        showCrab();
    }, 600)
});
// show
function showCrab(){
    if (countDown < 0){
        clearInterval(startGame);
        clearInterval(startTime);
        timeCount.innerHTML = "0";
    }
    let crabToAppear = crabItems[getRandomValue()].querySelector('.crab');
    crabToAppear.classList.add('crab-appear');
    hideCrab(crabToAppear);
}

function getRandomValue(){
    let rand = Math.random() * crabItems.length;
    return Math.floor(rand);
}

// hide
function hideCrab(crabItem){
    setTimeout(() => {
        crabItem.classList.remove('crab-appear');
    }, 1000);
}