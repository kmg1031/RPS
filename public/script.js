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
            const headers = {
                'Content-Type': 'application/json',
                ...window.authManager.getAuthHeaders()
            };

            const response = await fetch('/api/play', {
                method: 'POST',
                headers,
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

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // 모달 열기/닫기
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login-modal');
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.showModal('register-modal');
        });

        document.getElementById('stats-btn').addEventListener('click', () => {
            this.loadStats();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // 모달 닫기
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // 모달 외부 클릭시 닫기
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // 폼 전환
        document.getElementById('switch-to-register').addEventListener('click', () => {
            this.hideModal('login-modal');
            this.showModal('register-modal');
        });

        document.getElementById('switch-to-login').addEventListener('click', () => {
            this.hideModal('register-modal');
            this.showModal('login-modal');
        });

        // 폼 제출
        document.getElementById('login-form').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        this.clearErrors();
        this.clearForms();
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
            error.textContent = '';
        });
    }

    clearForms() {
        document.querySelectorAll('form').forEach(form => {
            form.reset();
        });
    }

    showError(errorElementId, message) {
        const errorElement = document.getElementById(errorElementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                this.updateUI();
                this.hideModal('login-modal');
            } else {
                this.showError('login-error', data.message);
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            this.showError('login-error', '로그인 처리 중 오류가 발생했습니다.');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                this.updateUI();
                this.hideModal('register-modal');
            } else {
                if (data.errors) {
                    const errorMessage = data.errors.map(err => err.msg).join('\n');
                    this.showError('register-error', errorMessage);
                } else {
                    this.showError('register-error', data.message);
                }
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            this.showError('register-error', '회원가입 처리 중 오류가 발생했습니다.');
        }
    }

    async checkAuthStatus() {
        if (!this.token) {
            this.updateUI();
            return;
        }

        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
            } else {
                this.logout();
                return;
            }
        } catch (error) {
            console.error('인증 상태 확인 오류:', error);
            this.logout();
            return;
        }

        this.updateUI();
    }

    async loadStats() {
        if (!this.token) return;

        try {
            const response = await fetch('/api/stats', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayStats(data.stats, data.recentGames);
                this.showModal('stats-modal');
            } else {
                alert('통계 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('통계 로드 오류:', error);
            alert('통계 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    displayStats(stats, recentGames) {
        document.getElementById('total-games').textContent = stats.totalGames;
        document.getElementById('win-rate').textContent = stats.winRate + '%';
        document.getElementById('total-wins').textContent = stats.wins;
        document.getElementById('total-losses').textContent = stats.losses;

        const recentGamesList = document.getElementById('recent-games-list');
        recentGamesList.innerHTML = '';

        recentGames.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = `recent-game-item ${game.result}`;
            
            const resultText = {
                win: '승리',
                lose: '패배',
                draw: '무승부'
            };

            const choiceEmojis = {
                rock: '✊',
                paper: '✋',
                scissors: '✌️'
            };

            gameDiv.innerHTML = `
                <span>
                    ${choiceEmojis[game.player_choice]} vs ${choiceEmojis[game.computer_choice]}
                </span>
                <span>${resultText[game.result]}</span>
            `;
            
            recentGamesList.appendChild(gameDiv);
        });
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        this.updateUI();
    }

    updateUI() {
        const userInfo = document.getElementById('user-info');
        const authButtons = document.getElementById('auth-buttons');
        const usernameDisplay = document.getElementById('username-display');

        if (this.user) {
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            usernameDisplay.textContent = `👋 ${this.user.username}`;
        } else {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    new RPSGame();
});