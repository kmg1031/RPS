class RPSGame {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gameHistory = [];
        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceEmojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        this.choiceNames = {
            rock: '바위',
            paper: '보',
            scissors: '가위'
        };
        
        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerChoice = e.currentTarget.dataset.choice;
                this.playRound(playerChoice);
            });
        });

        document.getElementById('reset').addEventListener('click', () => {
            this.resetGame();
        });
    }

    async playRound(playerChoice) {
        this.disableButtons();
        
        try {
            const response = await fetch('/api/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ playerChoice })
            });
            
            const gameData = await response.json();
            
            if (!response.ok) {
                throw new Error(gameData.error || '서버 오류가 발생했습니다.');
            }
            
            this.animateChoices(gameData.playerChoice, gameData.computerChoice);
            
            setTimeout(() => {
                this.updateScore(gameData.result);
                this.displayResult(gameData.result, gameData.playerChoice, gameData.computerChoice);
                this.addToHistory(gameData.playerChoice, gameData.computerChoice, gameData.result);
                this.enableButtons();
            }, 1000);
            
        } catch (error) {
            console.error('게임 요청 중 오류:', error);
            document.getElementById('result-message').textContent = '서버 연결 오류가 발생했습니다.';
            this.enableButtons();
        }
    }


    animateChoices(playerChoice, computerChoice) {
        const playerDisplay = document.getElementById('player-choice');
        const computerDisplay = document.getElementById('computer-choice');
        
        playerDisplay.classList.add('animate');
        computerDisplay.classList.add('animate');
        
        let animationCount = 0;
        const animationInterval = setInterval(() => {
            playerDisplay.textContent = this.choiceEmojis[this.choices[animationCount % 3]];
            computerDisplay.textContent = this.choiceEmojis[this.choices[animationCount % 3]];
            animationCount++;
            
            if (animationCount >= 12) {
                clearInterval(animationInterval);
                playerDisplay.textContent = this.choiceEmojis[playerChoice];
                computerDisplay.textContent = this.choiceEmojis[computerChoice];
                
                setTimeout(() => {
                    playerDisplay.classList.remove('animate');
                    computerDisplay.classList.remove('animate');
                }, 500);
            }
        }, 80);
    }

    updateScore(result) {
        if (result === 'win') {
            this.playerScore++;
        } else if (result === 'lose') {
            this.computerScore++;
        }
        
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
    }

    displayResult(result, playerChoice, computerChoice) {
        const resultElement = document.getElementById('result-message');
        const resultContainer = resultElement.parentElement;
        
        let message;
        resultContainer.className = 'result ' + result;
        
        switch (result) {
            case 'win':
                message = `승리! ${this.choiceNames[playerChoice]}이(가) ${this.choiceNames[computerChoice]}을(를) 이깁니다!`;
                break;
            case 'lose':
                message = `패배! ${this.choiceNames[computerChoice]}이(가) ${this.choiceNames[playerChoice]}을(를) 이깁니다!`;
                break;
            case 'draw':
                message = `무승부! 둘 다 ${this.choiceNames[playerChoice]}을(를) 선택했습니다!`;
                break;
        }
        
        resultElement.textContent = message;
    }

    addToHistory(playerChoice, computerChoice, result) {
        const historyItem = {
            player: playerChoice,
            computer: computerChoice,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.gameHistory.unshift(historyItem);
        
        if (this.gameHistory.length > 10) {
            this.gameHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.gameHistory.forEach(item => {
            const historyDiv = document.createElement('div');
            historyDiv.className = `history-item ${item.result}`;
            
            const resultText = {
                win: '승리',
                lose: '패배',
                draw: '무승부'
            };
            
            historyDiv.innerHTML = `
                <span>
                    ${this.choiceEmojis[item.player]} vs ${this.choiceEmojis[item.computer]}
                </span>
                <span class="result-text">${resultText[item.result]}</span>
                <span class="time">${item.timestamp}</span>
            `;
            
            historyList.appendChild(historyDiv);
        });
    }

    disableButtons() {
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    enableButtons() {
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    resetGame() {
        if (confirm('게임을 리셋하시겠습니까? 모든 점수와 기록이 초기화됩니다.')) {
            this.playerScore = 0;
            this.computerScore = 0;
            this.gameHistory = [];
            
            this.updateDisplay();
            
            document.getElementById('result-message').textContent = '선택해주세요!';
            document.querySelector('.result').className = 'result';
        }
    }

    updateDisplay() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
        document.getElementById('player-choice').textContent = '❓';
        document.getElementById('computer-choice').textContent = '❓';
        document.getElementById('history-list').innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RPSGame();
});