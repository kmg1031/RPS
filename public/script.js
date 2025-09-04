class RPSGame {
    constructor() {
        // 라운드 기반 게임 상태
        this.currentRound = null;
        this.roundHistory = [];
        this.gameHistory = [];
        
        // 덱 시스템
        this.playerDeck = [];
        this.currentGameIndex = 0;
        this.isDeckMode = true;
        
        // 게임 설정
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
        this.initializeDeckBuilder();
        this.loadCurrentRound();
        this.updateDisplay();
        this.showDeckBuilder();
    }

    bindEvents() {
        // 게임 플레이 버튼 제거됨

        // 덱 구성 버튼들
        document.querySelectorAll('.deck-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.addToDeck(choice);
            });
        });

        // 덱 컨트롤 버튼들
        document.getElementById('deck-clear').addEventListener('click', () => {
            this.clearDeck();
        });

        document.getElementById('deck-random').addEventListener('click', () => {
            this.generateRandomDeck();
        });

        document.getElementById('deck-confirm').addEventListener('click', () => {
            this.confirmDeck();
        });

        // deck-mode-toggle 버튼 제거됨

        // 리셋 버튼 제거됨
    }

    initializeDeckBuilder() {
        const deckSlots = document.getElementById('deck-slots');
        deckSlots.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const slot = document.createElement('div');
            slot.className = 'deck-slot';
            slot.dataset.index = i;
            slot.innerHTML = `<span class="slot-number">${i + 1}</span>`;
            
            slot.addEventListener('click', () => {
                this.removeFromDeck(i);
            });
            
            deckSlots.appendChild(slot);
        }
    }


    // playNextFromDeck 메서드 제거됨 - 배치 모드로만 게임 진행

    // prepareNextGame 메서드 제거됨 - 개별 게임 진행 비활성화

    addToDeck(choice) {
        if (this.playerDeck.length >= 10) {
            return;
        }

        this.playerDeck.push(choice);
        this.updateDeckDisplay();
    }

    removeFromDeck(index) {
        if (index < this.playerDeck.length) {
            this.playerDeck.splice(index, 1);
            this.updateDeckDisplay();
        }
    }

    clearDeck() {
        this.playerDeck = [];
        this.updateDeckDisplay();
    }

    generateRandomDeck() {
        this.playerDeck = [];
        for (let i = 0; i < 10; i++) {
            const randomChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
            this.playerDeck.push(randomChoice);
        }
        this.updateDeckDisplay();
    }

    updateDeckDisplay() {
        const deckSlots = document.querySelectorAll('.deck-slot');
        const deckCount = document.getElementById('deck-count');
        const confirmBtn = document.getElementById('deck-confirm');

        deckCount.textContent = this.playerDeck.length;
        confirmBtn.disabled = this.playerDeck.length !== 10;

        deckSlots.forEach((slot, index) => {
            const slotNumber = slot.querySelector('.slot-number');
            if (index < this.playerDeck.length) {
                slot.classList.add('filled');
                slot.innerHTML = `
                    <span class="slot-number">${index + 1}</span>
                    ${this.choiceEmojis[this.playerDeck[index]]}
                `;
            } else {
                slot.classList.remove('filled');
                slot.innerHTML = `<span class="slot-number">${index + 1}</span>`;
            }
        });
    }

    confirmDeck() {
        if (this.playerDeck.length !== 10) return;

        this.currentGameIndex = 0;
        this.isDeckMode = false;
        this.showGameArea();
        this.playBatchRound();
    }

    showBatchModeChoice() {
        const resultMessage = document.getElementById('result-message');
        resultMessage.innerHTML = `
            <div class="batch-mode-choice">
                <p>덱이 구성되었습니다!</p>
                <button id="batch-play-btn" class="batch-btn primary">10게임 한번에 실행</button>
                <button id="single-play-btn" class="batch-btn secondary" disabled>하나씩 게임하기 (비활성화)</button>
            </div>
        `;

        document.getElementById('batch-play-btn').addEventListener('click', () => {
            this.playBatchRound();
        });

        // 하나씩 게임하기는 비활성화
        document.getElementById('single-play-btn').addEventListener('click', () => {
            // 비활성화된 상태이므로 아무 작업하지 않음
        });
    }

    async playBatchRound() {
        if (this.playerDeck.length !== 10) {
            document.getElementById('result-message').textContent = '덱이 완성되지 않았습니다!';
            return;
        }

        document.getElementById('result-message').textContent = '10게임을 진행중입니다...';
        this.disableButtons();

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...window.authManager.getAuthHeaders()
            };

            const response = await fetch('/api/play-round', {
                method: 'POST',
                headers,
                body: JSON.stringify({ playerDeck: this.playerDeck })
            });
            
            const roundData = await response.json();
            
            if (!response.ok) {
                throw new Error(roundData.message || '서버 오류가 발생했습니다.');
            }

            // 배치 게임 결과 처리
            this.processBatchResult(roundData);

        } catch (error) {
            console.error('배치 게임 오류:', error);
            document.getElementById('result-message').textContent = '서버 연결 오류가 발생했습니다.';
            this.enableButtons();
        }
    }

    processBatchResult(roundData) {
        // 게임 히스토리 업데이트 (기존 기록에 추가)
        const newGames = [];
        roundData.gameResults.forEach(game => {
            newGames.unshift({
                player: game.playerChoice,
                computer: game.computerChoice,
                result: game.result,
                pointsEarned: game.pointsEarned,
                streakScore: game.streakScore,
                comboScore: game.comboScore,
                gameNumber: this.gameHistory.length + game.gameNumber,
                timestamp: new Date().toLocaleTimeString()
            });
        });
        
        // 새 게임들을 기존 히스토리 앞에 추가
        this.gameHistory = [...newGames, ...this.gameHistory];

        // 점수 업데이트
        if (roundData.saved && window.authManager.isLoggedIn()) {
            this.currentRound = {
                roundId: roundData.roundId,
                playerScore: roundData.playerScore,
                computerScore: roundData.computerScore,
                streakScore: roundData.maxStreakScore,
                comboScore: roundData.maxComboScore,
                loseScore: 0,
                gamesPlayed: 10,
                roundComplete: true,
                roundResult: roundData.roundResult
            };
        } else {
            // 게스트 모드
            this.guestScore = {
                player: roundData.playerScore,
                computer: roundData.computerScore
            };
        }



        setTimeout(() => {
            this.updateDisplay();
            this.displayBatchResult(roundData);
            this.showDetailedRoundResult(roundData);
            this.bindResultButtons();
            this.enableButtons();
            
            // 승점 업데이트 후 사용자 정보 새로고침
            if (roundData.saved && window.authManager.isLoggedIn()) {
                window.authManager.refreshUserInfo();
            }
        }, 1000);
    }


    animateNumber(element, start, end, duration) {
        if (start === end) return;
        
        const startTime = Date.now();
        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutCubic 함수
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(start + (end - start) * easeProgress);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = end;
            }
        };
        
        requestAnimationFrame(updateNumber);
    }

    displayBatchResult(roundData) {
        const resultText = {
            'win': '🎯 라운드 결과',
            'lose': '🎯 라운드 결과',
            'draw': '🎯 라운드 결과'
        };

        // 상세 통계 계산
        const wins = roundData.gameResults.filter(g => g.result === 'win').length;
        const losses = roundData.gameResults.filter(g => g.result === 'lose').length;
        const draws = roundData.gameResults.filter(g => g.result === 'draw').length;
        const totalPointsEarned = roundData.gameResults.reduce((sum, g) => sum + g.pointsEarned, 0);

        document.getElementById('result-message').innerHTML = `
            <div class="batch-result">
                <div class="result-header">
                    <h3>${resultText[roundData.roundResult]}</h3>
                    <div class="final-scores">
                        <span class="player-score">플레이어: ${roundData.playerScore}점</span>
                        <span class="vs">VS</span>
                        <span class="computer-score">컴퓨터: ${roundData.computerScore}점</span>
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="detail-row">
                        <span class="detail-label">게임 결과:</span>
                        <span class="detail-value">
                            <span class="win-count">승 ${wins}</span>
                            <span class="lose-count">패 ${losses}</span>
                            <span class="draw-count">무 ${draws}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">획득 점수:</span>
                        <span class="detail-value points-earned">+${totalPointsEarned}점</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">최대 연속:</span>
                        <span class="detail-value max-streak">${roundData.maxStreakScore}연속</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">최대 콤보:</span>
                        <span class="detail-value max-combo">${roundData.maxComboScore}콤보</span>
                    </div>
                    ${roundData.saved ? 
                        '<div class="save-status">✅ 기록이 저장되었습니다</div>' : 
                        '<div class="save-status">ℹ️ 로그인하면 기록이 저장됩니다</div>'
                    }
                </div>
                
                <div class="result-actions">
                    <button id="rebuild-deck-btn" class="result-action-btn primary">덱 재구성</button>
                    <button id="play-again-btn" class="result-action-btn secondary">다시하기</button>
                </div>
            </div>
        `;
    }

    bindResultButtons() {
        // 덱 재구성 버튼
        const rebuildBtn = document.getElementById('rebuild-deck-btn');
        if (rebuildBtn) {
            rebuildBtn.addEventListener('click', () => {
                this.rebuildDeck();
            });
        }
        
        // 다시하기 버튼
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.playAgain();
            });
        }
    }

    rebuildDeck() {
        // 덱 재구성: 완전히 새로운 덱 구성으로 돌아가기
        this.currentRound = null;
        this.gameHistory = [];
        this.guestScore = { player: 0, computer: 0 };
        this.playerDeck = [];
        this.currentGameIndex = 0;
        this.isDeckMode = true;
        
        this.showDeckBuilder();
        this.updateDisplay();
        this.updateDeckDisplay();
        
        const resultContainer = document.querySelector('.result');
        resultContainer.className = 'result';
        document.getElementById('result-message').textContent = '새 덱을 구성하여 게임을 시작하세요!';
    }

    playAgain() {
        // 다시하기: 같은 덱으로 다시 플레이 (게임 기록 유지)
        if (this.playerDeck.length === 10) {
            this.currentGameIndex = 0;
            // 게임 기록은 초기화하지 않음 - 계속 누적
            if (!window.authManager.isLoggedIn()) {
                this.guestScore = { player: 0, computer: 0 };
            }
            this.playBatchRound();
        } else {
            alert('덱 정보가 없습니다. 새 덱을 구성해주세요.');
            this.rebuildDeck();
        }
    }

    showDeckBuilder() {
        document.getElementById('deck-builder').style.display = 'block';
        // game-buttons는 더 이상 사용하지 않음
        // 리셋 버튼 제거됨
        // deck-mode-toggle 버튼 제거됨
        document.getElementById('result-message').textContent = '덱을 구성하여 게임을 시작하세요!';
    }

    showGameArea() {
        document.getElementById('deck-builder').style.display = 'none';
        // game-buttons는 더 이상 표시하지 않음 (버튼이 제거됨)
        // 리셋 버튼 제거됨
        // deck-mode-toggle 버튼 제거됨
    }

    // toggleDeckMode 메서드 제거됨 - 덱 구성과 게임 결과 화면 직접 제어


    updateGameState(gameData) {
        if (gameData.saved) {
            // 인증된 사용자의 라운드 데이터 업데이트
            this.currentRound = {
                roundId: gameData.roundId,
                playerScore: gameData.playerScore,
                computerScore: gameData.computerScore,
                streakScore: gameData.streakScore,
                comboScore: gameData.comboScore,
                loseScore: gameData.loseScore,
                gamesPlayed: gameData.gamesPlayed,
                roundComplete: gameData.roundComplete,
                roundResult: gameData.roundResult
            };
        } else {
            // 게스트 모드 - 기본 점수만 유지
            if (!this.guestScore) {
                this.guestScore = { player: 0, computer: 0 };
            }
            if (gameData.result === 'win') {
                this.guestScore.player++;
            } else if (gameData.result === 'lose') {
                this.guestScore.computer++;
            }
        }
    }

    displayResult(gameData) {
        const resultElement = document.getElementById('result-message');
        const resultContainer = resultElement.parentElement;
        
        let message;
        resultContainer.className = 'result';
        
        switch (gameData.result) {
            case 'win':
                message = `승리! ${this.choiceNames[gameData.playerChoice]}이(가) ${this.choiceNames[gameData.computerChoice]}을(를) 이깁니다!`;
                if (gameData.saved && gameData.pointsEarned > 0) {
                    message += ` (+${gameData.pointsEarned}점)`;
                }
                break;
            case 'lose':
                message = `패배! ${this.choiceNames[gameData.computerChoice]}이(가) ${this.choiceNames[gameData.playerChoice]}을(를) 이깁니다!`;
                break;
            case 'draw':
                message = `무승부! 둘 다 ${this.choiceNames[gameData.playerChoice]}을(를) 선택했습니다!`;
                break;
        }
        
        resultElement.textContent = message;
    }

    addToHistory(gameData) {
        const historyItem = {
            player: gameData.playerChoice,
            computer: gameData.computerChoice,
            result: gameData.result,
            pointsEarned: gameData.pointsEarned || 0,
            streakScore: gameData.streakScore || 0,
            comboScore: gameData.comboScore || 0,
            gameNumber: gameData.gameNumber || this.gameHistory.length + 1,
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
            historyDiv.className = `history-item`;
            
            const resultText = {
                win: '승리',
                lose: '패배',
                draw: '무승부'
            };
            
            const pointsText = item.pointsEarned > 0 ? ` (+${item.pointsEarned}점)` : '';
            const streakText = window.authManager.isLoggedIn() ? 
                ` [연속:${item.streakScore} 콤보:${item.comboScore}]` : '';
            
            historyDiv.innerHTML = `
                <span class="game-number">#${item.gameNumber}</span>
                <span>
                    ${this.choiceEmojis[item.player]} vs ${this.choiceEmojis[item.computer]}
                </span>
                <span class="result-text">${resultText[item.result]}${pointsText}${streakText}</span>
                <span class="time">${item.timestamp}</span>
            `;
            
            historyList.appendChild(historyDiv);
        });
    }

    disableButtons() {
        // 배치 모드에서는 버튼 비활성화 불필요
    }

    enableButtons() {
        // 배치 모드에서는 버튼 활성화 불필요
    }

    // resetGame 메서드 제거됨 - 덱 재구성 및 다시하기 버튼으로 대체

    updateDisplay() {
        if (this.currentRound && window.authManager.isLoggedIn()) {
            // 인증된 사용자 - 라운드 기반 표시
            // 연속 점수 정보 표시
            this.updateStreakDisplay();
            this.updateRoundProgress();
        } else {
            // 게스트 모드일 때 연속 점수 숨김
            this.hideStreakDisplay();
        }
        
        this.updateHistoryDisplay();
    }

    updateStreakDisplay() {
        if (!this.currentRound) return;
        
        // 연속 점수 표시 영역 업데이트
        const streakInfo = document.getElementById('streak-info');
        if (streakInfo) {
            streakInfo.style.display = 'block';
            streakInfo.innerHTML = `
                <div class="streak-item">
                    <span class="streak-label">연속 점수:</span>
                    <span class="streak-value">${this.currentRound.streakScore}</span>
                </div>
                <div class="streak-item">
                    <span class="streak-label">콤보 점수:</span>
                    <span class="streak-value combo">${this.currentRound.comboScore}</span>
                </div>
                <div class="streak-item">
                    <span class="streak-label">패배 점수:</span>
                    <span class="streak-value lose">${this.currentRound.loseScore}</span>
                </div>
            `;
        }
    }
    
    hideStreakDisplay() {
        const streakInfo = document.getElementById('streak-info');
        if (streakInfo) {
            streakInfo.style.display = 'none';
        }
        
        const progressInfo = document.getElementById('round-progress');
        if (progressInfo) {
            progressInfo.style.display = 'none';
        }
    }
    
    updateRoundProgress() {
        if (!this.currentRound) return;
        
        const progressInfo = document.getElementById('round-progress');
        if (progressInfo) {
            progressInfo.style.display = 'block';
            const remaining = 10 - this.currentRound.gamesPlayed;
            
            const progressContent = progressInfo.querySelector('.progress-content');
            progressContent.innerHTML = `
                <div class="progress-item">
                    <span>게임 진행:</span>
                    <span>${this.currentRound.gamesPlayed}/10</span>
                </div>
                <div class="progress-item">
                    <span>남은 게임:</span>
                    <span>${remaining}</span>
                </div>
            `;
            
            // 덱 사용 현황 업데이트
            this.updateDeckUsage();
        }
    }
    
    updateDeckUsage() {
        const deckUsage = document.getElementById('deck-usage');
        if (!deckUsage || !this.playerDeck.length) return;
        
        deckUsage.style.display = 'block';
        const deckCards = deckUsage.querySelector('.deck-cards');
        
        deckCards.innerHTML = '';
        this.playerDeck.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'deck-card';
            
            if (index < this.currentGameIndex) {
                card.classList.add('used');
            } else if (index === this.currentGameIndex) {
                card.classList.add('current');
            }
            
            card.innerHTML = `
                <span class="card-number">${index + 1}</span>
                ${this.choiceEmojis[choice]}
            `;
            
            deckCards.appendChild(card);
        });
    }
    
    showRoundResult(gameData) {
        setTimeout(() => {
            this.showDetailedRoundResult(gameData);
        }, 1500);
    }
    
    showDetailedRoundResult(gameData) {
        const deckSection = document.getElementById('used-deck-section');
        
        // 결과에 따른 스타일 적용
        deckSection.className = 'used-deck-section';
        
        // 사용한 덱 표시
        this.displayUsedDeckInline();
        
        // 덱 섹션 표시
        deckSection.style.display = 'block';
        
        // 부드러운 스크롤로 덱 영역으로 이동
        deckSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 이벤트 리스너 추가
        this.bindUsedDeckEvents();
    }
    
    calculateRoundStats() {
        let wins = 0, losses = 0, draws = 0;
        let maxStreak = 0, maxCombo = 0;
        let currentStreak = 0, currentCombo = 0;
        
        this.gameHistory.forEach(game => {
            if (game.result === 'win') {
                wins++;
                currentStreak++;
                currentCombo++;
                maxStreak = Math.max(maxStreak, currentStreak);
                maxCombo = Math.max(maxCombo, currentCombo);
            } else if (game.result === 'lose') {
                losses++;
                currentStreak = 0;
                currentCombo = 0;
            } else {
                draws++;
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
                // 무승부는 콤보에 영향 없음
            }
        });
        
        return { wins, losses, draws, maxStreak, maxCombo };
    }
    
    displayUsedDeck() {
        const usedDeckDiv = document.getElementById('used-deck');
        usedDeckDiv.innerHTML = '';
        
        this.playerDeck.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'used-deck-card';
            
            // 게임 결과 구분 없이 통일된 표시
            card.innerHTML = `
                <span class="card-number">${index + 1}</span>
                ${this.choiceEmojis[choice]}
            `;
            
            usedDeckDiv.appendChild(card);
        });
    }

    displayUsedDeckInline() {
        const usedDeckDiv = document.getElementById('used-deck-inline');
        usedDeckDiv.innerHTML = '';
        
        this.playerDeck.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'used-deck-card-inline';
            
            // 게임 결과 구분 없이 통일된 표시
            card.innerHTML = `
                <span class="card-number">${index + 1}</span>
                ${this.choiceEmojis[choice]}
            `;
            
            usedDeckDiv.appendChild(card);
        });
    }
    
    bindRoundResultEvents() {
        // 기존 모달용 이벤트 바인딩 (호환성 유지)
        const newRoundBtn = document.getElementById('new-round-btn');
        const viewStatsBtn = document.getElementById('view-stats-btn');
        const closeBtn = document.getElementById('round-result-close');
        
        if (newRoundBtn) {
            newRoundBtn.replaceWith(newRoundBtn.cloneNode(true));
            document.getElementById('new-round-btn').addEventListener('click', () => {
                this.startNewRound();
            });
        }
        
        if (viewStatsBtn) {
            viewStatsBtn.replaceWith(viewStatsBtn.cloneNode(true));
            document.getElementById('view-stats-btn').addEventListener('click', () => {
                document.getElementById('round-result-modal').style.display = 'none';
                if (window.authManager.isLoggedIn()) {
                    window.authManager.loadStats();
                } else {
                    alert('통계를 보려면 로그인이 필요합니다.');
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            document.getElementById('round-result-close').addEventListener('click', () => {
                document.getElementById('round-result-modal').style.display = 'none';
            });
        }
    }

    bindUsedDeckEvents() {
        // 기존 이벤트 리스너 제거
        const closeBtn = document.getElementById('used-deck-close');
        
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
        }
        
        // 덱 닫기 이벤트 리스너 추가
        document.getElementById('used-deck-close').addEventListener('click', () => {
            document.getElementById('used-deck-section').style.display = 'none';
        });
    }
    
    startNewRound() {
        document.getElementById('round-result-modal').style.display = 'none';
        
        this.currentRound = null;
        this.gameHistory = [];
        this.playerDeck = [];
        this.currentGameIndex = 0;
        this.isDeckMode = true;
        
        this.showDeckBuilder();
        this.updateDisplay();
        this.updateDeckDisplay();
        document.getElementById('result-message').textContent = '새 덱을 구성하여 다음 라운드를 시작하세요!';
    }

    startNewRoundInline() {
        document.getElementById('used-deck-section').style.display = 'none';
        
        this.currentRound = null;
        this.gameHistory = [];
        this.playerDeck = [];
        this.currentGameIndex = 0;
        this.isDeckMode = true;
        
        this.showDeckBuilder();
        this.updateDisplay();
        this.updateDeckDisplay();
        document.getElementById('result-message').textContent = '새 덱을 구성하여 다음 라운드를 시작하세요!';
        
        // 덱 빌더로 부드럽게 스크롤
        document.getElementById('deck-builder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    async loadCurrentRound() {
        if (!window.authManager.isLoggedIn()) return;
        
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...window.authManager.getAuthHeaders()
            };
            
            const response = await fetch('/api/current-round', {
                method: 'GET',
                headers
            });
            
            const data = await response.json();
            
            if (data.success && data.currentRound) {
                this.currentRound = {
                    roundId: data.currentRound.id,
                    playerScore: data.currentRound.player_score,
                    computerScore: data.currentRound.computer_score,
                    streakScore: data.currentRound.current_win_stack,
                    comboScore: data.currentRound.current_win_stack, // 임시로 같은 값 사용
                    loseScore: data.currentRound.current_lose_stack,
                    gamesPlayed: data.currentRound.games_played,
                    roundComplete: data.currentRound.games_played >= 10
                };
                
                // 게임 히스토리 로드
                if (data.games && data.games.length > 0) {
                    this.gameHistory = data.games.reverse().map(game => ({
                        player: game.player_choice,
                        computer: game.computer_choice,
                        result: game.result,
                        pointsEarned: game.points_earned,
                        streakScore: game.win_stack_count,
                        comboScore: game.win_stack_count,
                        gameNumber: game.game_number,
                        timestamp: new Date(game.played_at).toLocaleTimeString()
                    }));
                }
                
                this.updateDisplay();
            }
        } catch (error) {
            console.error('현재 라운드 로드 오류:', error);
        }
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
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // 모달 배경 클릭으로 닫기
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // 로그인 폼 제출
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // 회원가입 폼 제출
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    isLoggedIn() {
        return !!this.token;
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: this.getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    this.user = data.user;
                    this.updateUI(true);
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('인증 상태 확인 오류:', error);
                this.logout();
            }
        } else {
            this.updateUI(false);
        }
    }

    async login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                
                this.hideModal('login-modal');
                this.updateUI(true);
                
                // 게임 다시 로드
                if (window.rpsGame) {
                    window.rpsGame.loadCurrentRound();
                }
                
                errorElement.textContent = '';
                document.getElementById('login-form').reset();
            } else {
                errorElement.textContent = data.message || '로그인에 실패했습니다.';
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            errorElement.textContent = '서버 연결 오류가 발생했습니다.';
        }
    }

    async register() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorElement = document.getElementById('register-error');

        if (password !== confirmPassword) {
            errorElement.textContent = '비밀번호가 일치하지 않습니다.';
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                
                this.hideModal('register-modal');
                this.updateUI(true);
                
                errorElement.textContent = '';
                document.getElementById('register-form').reset();
            } else {
                if (data.errors && data.errors.length > 0) {
                    errorElement.textContent = data.errors.map(err => err.msg).join(', ');
                } else {
                    errorElement.textContent = data.message || '회원가입에 실패했습니다.';
                }
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            errorElement.textContent = '서버 연결 오류가 발생했습니다.';
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        this.updateUI(false);
        
        // 게임 상태 초기화
        if (window.rpsGame) {
            window.rpsGame.currentRound = null;
            window.rpsGame.gameHistory = [];
            window.rpsGame.updateDisplay();
        }
    }

    updateUI(isLoggedIn) {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const usernameElement = document.getElementById('username-display');
        const userPointsElement = document.getElementById('user-points');

        if (isLoggedIn && this.user) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            
            if (usernameElement) {
                usernameElement.textContent = this.user.username;
            }
            
            if (userPointsElement) {
                const points = this.user.total_points || 0;
                userPointsElement.textContent = `${points}점`;
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    async loadStats() {
        if (!this.isLoggedIn()) return;

        try {
            const response = await fetch('/api/stats', {
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                this.showStatsModal(data.stats, data.roundHistory);
            }
        } catch (error) {
            console.error('통계 로드 오류:', error);
        }
    }

    showStatsModal(stats, roundHistory) {
        const modal = document.getElementById('stats-modal');
        const content = modal.querySelector('.stats-content');
        
        content.innerHTML = `
            <h3>📊 게임 통계</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">총 라운드:</span>
                    <span class="stat-value">${stats.totalRounds || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">라운드 승률:</span>
                    <span class="stat-value">${stats.roundWinRate || 0}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">총 게임 수:</span>
                    <span class="stat-value">${stats.totalGamesPlayed || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">평균 점수:</span>
                    <span class="stat-value">${stats.averagePlayerScore || 0}</span>
                </div>
            </div>
            
            <h4>🏆 최근 라운드 기록</h4>
            <div class="round-history">
                ${roundHistory.map(round => `
                    <div class="round-item ${round.round_result}">
                        <span class="round-result">${this.getRoundResultText(round.round_result)}</span>
                        <span class="round-score">${round.player_score} vs ${round.computer_score}</span>
                        <span class="round-date">${new Date(round.played_at).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.showModal('stats-modal');
    }

    getRoundResultText(result) {
        const texts = {
            'win': '승리 🎉',
            'lose': '패배 😔',
            'draw': '무승부 🤝',
            'in_progress': '진행중 ⏳'
        };
        return texts[result] || result;
    }

    async refreshUserInfo() {
        if (!this.isLoggedIn()) return;

        try {
            const response = await fetch('/api/auth/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.updateUI(true);
                
                // 승점 증가 애니메이션 효과
                this.animatePointsUpdate();
            }
        } catch (error) {
            console.error('사용자 정보 새로고침 오류:', error);
        }
    }

    animatePointsUpdate() {
        const pointsElement = document.getElementById('user-points');
        if (pointsElement) {
            pointsElement.classList.add('points-update');
            setTimeout(() => {
                pointsElement.classList.remove('points-update');
            }, 2000);
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.rpsGame = new RPSGame();
});