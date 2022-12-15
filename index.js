// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
let words
let winner

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
var endGameText = document.querySelector('.game-result-message');
var gameCount = document.querySelector('#stats-total-games');
var percentOfGamesWon = document.querySelector("#stats-percent-correct");
var statsAverageGuesses = document.querySelector('#stats-average-guesses')

// Event Listeners
window.addEventListener('load', (event) => {
  fetchPromise()
})

function fetchAPI() {
		return fetch(`http://localhost:3001/api/v1/words`)
			.then((response) => response.json())
			.then((data) => {return data})
			.catch((error) => console.log(`API Error!`));
	};
  
  const fetchPromise = () => {
    fetchAPI().then((response) => {
      words = response
      setGame()
    })
  }

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;
  winningWord = getRandomWord();
  updateInputPermissions();
}

function getRandomWord() {
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;
  if ( key !== 8 && key !== 46 ) {
      var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
      inputs[indexOfNext].focus();
    }
  }


function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } 
    else if (!checkForWin() && currentRow >= 6) {
      setTimeout(declareWinner, 1000);
    }
    else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('')
  
  guessLetters.forEach((letter) => {
    let currentLetter = guessLetters.indexOf(letter)
    let correctWord = winningWord

    if (winningWord.includes(letter)) {
      storeLetters()
   

      // if (guess.indexOf(letter) === correctWord.indexOf(letter)) {
      //   updateKeyColor(letter, "correct-location-key");
      //   updateBoxColor(letter, "correct-location");
      // }
      // else {
			// 	updateKeyColor(letter, "wrong-location-key");
			// 	updateBoxColor(letter, "wrong-location");
			// }
    }
    else if (!winningWord.includes(letter)) {
      updateKeyColor(letter, "wrong-key");
      updateBoxColor(letter, "wrong");
    }
	})
}

function storeLetters() {
  let counter1 = 0
  let counter2 = 0

   let guesses = guess.split("").reduce((accum, l) => {
			accum[counter1] = l 
			counter1++;
			return accum;
		}, []);

    let answers = winningWord.split('').reduce((accum, l) => {
      accum[counter2] = l 
      counter2++
      return accum 
  }, [])

  guesses.forEach((letter) => {
    answers.forEach((answer) => {
      if (letter === answer) {
        updateKeyColor(letter, "correct-location-key");
        updateBoxColor(letter, "correct-location");
      }
      else {
				updateKeyColor(letter, "wrong-location-key");
				updateBoxColor(letter, "wrong-location");
			}
    })
  })

}



function updateBoxColor(letter, className) {
  var row = [];
  let counter = 0

  inputs.forEach((input) => {
    let rowNumber = input.id.split('-')
    if (parseInt(rowNumber[1]) === currentRow) {
      row.push(input)  
    }
  })
  
  let letterMatches = guess.split('').reduce((accum, l) => {
      accum[counter] = l + "-" + counter
      counter++
      return accum 
  }, {})

  Object.values(letterMatches).forEach((l) => {
    l = l.split('-')
    let letterLocation = l[1];
    if (l[0] === letter) {
      row[letterLocation].classList.add(className);
    }
  })
}

function updateKeyColor(letter, className) {
  keyLetters.forEach((key) => {
    if (key.innerText === letter) {
      key.classList.add(className);
    }
  })
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  if (checkForWin()) {
    endGameText.innerText = `You Win! The correct word was ${winningWord}`
  } 
  else {
    endGameText.innerText = `You Lose! The correct word was ${winningWord}`;
  }
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}


function recordGameStats() {
  if (checkForWin()) {
    return gamesPlayed.push({ solved: true, guesses: currentRow });
	} 
  return gamesPlayed.push({ solved: false, guesses: currentRow });
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
  gameCount.innerText = gamesPlayed.length
  let numberOfWins = gamesPlayed.filter(game => game.solved)
  percentOfGamesWon.innerText = ((numberOfWins.length / gamesPlayed.length) * 100).toFixed(2)
   let averageGuessCount = numberOfWins.reduce((accum, game) => {
    accum += game.guesses
    return accum
  }, 0) / numberOfWins.length
  statsAverageGuesses.innerText = averageGuessCount.toFixed(0)
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
