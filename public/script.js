class Deck {
    constructor(maxSize = 10) {
        this.cards = [];
        this.maxSize = maxSize;
        this.currentIndex = 0;
        this.isLocked = false;
    }

    addCard(choice) {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 카드를 추가할 수 없습니다.');
        }
        
        if (this.cards.length >= this.maxSize) {
            throw new Error('덱이 가득 찼습니다.');
        }

        if (!this.isValidChoice(choice)) {
            throw new Error('유효하지 않은 선택입니다.');
        }

        this.cards.push(choice);
        return this;
    }

    removeCard(index) {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 카드를 제거할 수 없습니다.');
        }

        if (index < 0 || index >= this.cards.length) {
            throw new Error('유효하지 않은 인덱스입니다.');
        }

        this.cards.splice(index, 1);
        return this;
    }

    clear() {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 초기화할 수 없습니다.');
        }

        this.cards = [];
        this.currentIndex = 0;
        return this;
    }

    generateRandom() {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 랜덤 생성할 수 없습니다.');
        }

        const choices = ['rock', 'paper', 'scissors'];
        this.clear();
        
        for (let i = 0; i < this.maxSize; i++) {
            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            this.cards.push(randomChoice);
        }
        
        return this;
    }

    getNextCard() {
        if (this.currentIndex >= this.cards.length) {
            throw new Error('덱에 사용할 수 있는 카드가 더 이상 없습니다.');
        }

        const card = this.cards[this.currentIndex];
        this.currentIndex++;
        return card;
    }

    getCard(index) {
        if (index < 0 || index >= this.cards.length) {
            throw new Error('유효하지 않은 인덱스입니다.');
        }
        
        return this.cards[index];
    }

    getCurrentCard() {
        if (this.currentIndex >= this.cards.length) {
            throw new Error('덱에 사용할 수 있는 카드가 더 이상 없습니다.');
        }

        return this.cards[this.currentIndex];
    }

    reset() {
        this.currentIndex = 0;
        return this;
    }

    lock() {
        this.isLocked = true;
        return this;
    }

    unlock() {
        this.isLocked = false;
        return this;
    }

    isFull() {
        return this.cards.length >= this.maxSize;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    isComplete() {
        return this.cards.length === this.maxSize;
    }

    hasMoreCards() {
        return this.currentIndex < this.cards.length;
    }

    isValidChoice(choice) {
        const validChoices = ['rock', 'paper', 'scissors'];
        return validChoices.includes(choice);
    }

    getSize() {
        return this.cards.length;
    }

    getMaxSize() {
        return this.maxSize;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getRemainingCards() {
        return this.cards.length - this.currentIndex;
    }

    getCards() {
        return [...this.cards];
    }

    toArray() {
        return [...this.cards];
    }

    toJSON() {
        return {
            cards: this.cards,
            maxSize: this.maxSize,
            currentIndex: this.currentIndex,
            isLocked: this.isLocked
        };
    }

    static fromJSON(data) {
        const deck = new Deck(data.maxSize);
        deck.cards = [...data.cards];
        deck.currentIndex = data.currentIndex;
        deck.isLocked = data.isLocked;
        return deck;
    }

    clone() {
        const clonedDeck = new Deck(this.maxSize);
        clonedDeck.cards = [...this.cards];
        clonedDeck.currentIndex = this.currentIndex;
        clonedDeck.isLocked = this.isLocked;
        return clonedDeck;
    }

    validate() {
        if (this.cards.length > this.maxSize) {
            throw new Error('덱 크기가 최대 크기를 초과했습니다.');
        }

        if (this.currentIndex < 0 || this.currentIndex > this.cards.length) {
            throw new Error('현재 인덱스가 유효하지 않습니다.');
        }

        for (let i = 0; i < this.cards.length; i++) {
            if (!this.isValidChoice(this.cards[i])) {
                throw new Error(`인덱스 ${i}의 카드가 유효하지 않습니다: ${this.cards[i]}`);
            }
        }

        return true;
    }

    getStats() {
        const stats = {
            rock: 0,
            paper: 0,
            scissors: 0
        };

        this.cards.forEach(card => {
            stats[card]++;
        });

        return {
            ...stats,
            total: this.cards.length,
            percentages: {
                rock: this.cards.length > 0 ? (stats.rock / this.cards.length * 100).toFixed(1) : 0,
                paper: this.cards.length > 0 ? (stats.paper / this.cards.length * 100).toFixed(1) : 0,
                scissors: this.cards.length > 0 ? (stats.scissors / this.cards.length * 100).toFixed(1) : 0
            }
        };
    }

    toString() {
        const cardSymbols = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };

        return this.cards.map((card, index) => {
            const symbol = cardSymbols[card];
            const marker = index === this.currentIndex ? '→' : ' ';
            return `${marker}${symbol}`;
        }).join(' ');
    }
}

class RPSGame {
    constructor() {
        // 라운드 기반 게임 상태
        this.currentRound = null;
        this.roundHistory = [];
        this.roundHistory = [];
        
        // 덱 시스템
        this.playerDeck = new Deck(10);
        
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
        try {
            this.playerDeck.addCard(choice);
            this.updateDeckDisplay();
        } catch (error) {
            console.warn(error.message);
        }
    }

    removeFromDeck(index) {
        try {
            this.playerDeck.removeCard(index);
            this.updateDeckDisplay();
        } catch (error) {
            console.warn(error.message);
        }
    }

    clearDeck() {
        this.playerDeck.clear();
        this.updateDeckDisplay();
    }

    generateRandomDeck() {
        this.playerDeck.generateRandom();
        this.updateDeckDisplay();
    }

    updateDeckDisplay() {
        const deckSlots = document.querySelectorAll('.deck-slot');
        const deckCount = document.getElementById('deck-count');
        const confirmBtn = document.getElementById('deck-confirm');

        deckCount.textContent = this.playerDeck.getSize();
        confirmBtn.disabled = !this.playerDeck.isComplete();

        deckSlots.forEach((slot, index) => {
            const slotNumber = slot.querySelector('.slot-number');
            if (index < this.playerDeck.getSize()) {
                slot.classList.add('filled');
                slot.innerHTML = `
                    <span class="slot-number">${index + 1}</span>
                    ${this.choiceEmojis[this.playerDeck.getCard(index)]}
                `;
            } else {
                slot.classList.remove('filled');
                slot.innerHTML = `<span class="slot-number">${index + 1}</span>`;
            }
        });
    }

    confirmDeck() {
        if (!this.playerDeck.isComplete()) return;

        this.playerDeck.reset().lock();
        this.showGameArea();
        this.playBatchRound();
    }

    showBatchModeChoice() {
        document.getElementById('batch-play-btn').addEventListener('click', () => {
            this.playBatchRound();
        });

        // 하나씩 게임하기는 비활성화
        document.getElementById('single-play-btn').addEventListener('click', () => {
            // 비활성화된 상태이므로 아무 작업하지 않음
        });
    }

    async playBatchRound() {
        if (!this.playerDeck.isComplete()) {
            alert('덱이 완성되지 않았습니다!');
            return;
        }


        try {
            const headers = {
                'Content-Type': 'application/json',
                ...window.authManager.getAuthHeaders()
            };

            const response = await fetch('/api/play-round', {
                method: 'POST',
                headers,
                body: JSON.stringify({ playerDeck: this.playerDeck.toArray() })
            });
            
            const roundData = await response.json();
            
            if (!response.ok) {
                throw new Error(roundData.message || '서버 오류가 발생했습니다.');
            }

            // 배치 게임 결과 처리
            this.processBatchResult(roundData);

        } catch (error) {
            console.error('배치 게임 오류:', error);
            alert('서버 연결 오류가 발생했습니다.');
        }
    }

    processBatchResult(roundData) {
        // 게임 히스토리 업데이트 - 각 게임을 개별적으로 순차 추가
        roundData.gameResults.forEach((game, index) => {
            // 각 게임마다 개별 히스토리 아이템 생성
            const historyItem = {
                player: game.playerChoice,
                computer: game.computerChoice,
                result: game.result,
                pointsEarned: game.pointsEarned,
                streakScore: game.streakScore,
                comboScore: game.comboScore,
                gameNumber: this.roundHistory.length + 1,
                timestamp: new Date().toLocaleTimeString(),
                roundGame: index + 1 // 라운드 내 게임 순서 (1-10)
            };
            
            // 히스토리 앞에 추가 (최신 게임이 위에 표시됨)
            this.roundHistory.unshift(historyItem);
        });

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
                roundComplete: true
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
            this.showDetailedRoundResult(roundData);
            this.bindResultButtons();
            
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

    bindResultButtons() {
        // 버튼들이 덱 영역으로 이동했으므로 이 함수는 더 이상 필요하지 않음
        // bindUsedDeckEvents()에서 처리됨
    }

    rebuildDeck() {
        // 덱 재구성: 완전히 새로운 덱 구성으로 돌아가기
        this.currentRound = null;
        this.roundHistory = [];
        this.guestScore = { player: 0, computer: 0 };
        this.playerDeck.clear().unlock();
        
        this.showDeckBuilder();
        this.updateDisplay();
        this.updateDeckDisplay();
    }

    playAgain() {
        // 다시하기: 같은 덱으로 다시 플레이 (라운드 기록 유지)
        if (this.playerDeck.isComplete()) {
            this.playerDeck.reset();
            // 라운드 기록은 초기화하지 않음 - 계속 누적
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
    }

    showGameArea() {
        document.getElementById('deck-builder').style.display = 'none';
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
                roundComplete: gameData.roundComplete
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

    addToHistory(gameData) {
        const historyItem = {
            player: gameData.playerChoice,
            computer: gameData.computerChoice,
            result: gameData.result,
            pointsEarned: gameData.pointsEarned || 0,
            streakScore: gameData.streakScore || 0,
            comboScore: gameData.comboScore || 0,
            gameNumber: gameData.gameNumber || this.roundHistory.length + 1,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.roundHistory.unshift(historyItem);
        
        if (this.roundHistory.length > 50) {
            this.roundHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        // 라운드 단위로 그룹핑
        const rounds = this.groupGamesByRound(this.roundHistory);
        
        // 최근 5라운드만 표시
        const recentRounds = rounds.slice(0, 5);
        
        recentRounds.forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round-history-item';
            
            const totalWins = round.games.filter(g => g.result === 'win').length;
            const totalLoses = round.games.filter(g => g.result === 'lose').length;
            const totalDraws = round.games.filter(g => g.result === 'draw').length;
            const totalPoints = round.games.reduce((sum, g) => sum + (g.pointsEarned || 0), 0);
            
            // 라운드 한 줄 표시
            const roundHeader = document.createElement('div');
            roundHeader.className = 'round-header-inline';
            
            // 덱 카드들을 인라인으로 생성
            const deckCards = round.games.map(game => game.player);
            const gameResults = round.games;
            
            let deckCardsHtml = '';
            deckCards.forEach((choice, index) => {
                const gameResult = gameResults[index];
                const result = gameResult ? gameResult.result : '';
                const pointsEarned = gameResult ? gameResult.pointsEarned || 0 : 0;
                const pointsDisplay = pointsEarned > 0 ? `+${pointsEarned}` : '';
                
                deckCardsHtml += `<span class="inline-card ${result}" title="${choice} - ${result} ${pointsDisplay}">${this.choiceEmojis[choice]}${pointsDisplay ? `<sup>${pointsDisplay}</sup>` : ''}</span>`;
            });
            
            roundHeader.innerHTML = `
                <div class="round-line">
                    <span class="round-title">라운드 ${round.roundNumber || '?'}</span>
                    <span class="round-score">+${totalPoints}점</span>
                    <div class="round-deck-inline">${deckCardsHtml}</div>
                    <span class="round-time">${round.games[0]?.timestamp || ''}</span>
                </div>
            `;
            
            // 한 줄 표시만
            roundDiv.appendChild(roundHeader);    // 라운드 한 줄 표시
            historyList.appendChild(roundDiv);
        });
    }

    groupGamesByRound(games) {
        const rounds = [];
        let currentRound = null;
        let roundNumber = 1;
        
        games.forEach(game => {
            // 새로운 라운드 시작 조건: roundGame이 1이거나 없는 경우
            if (!currentRound || game.roundGame === 1) {
                if (currentRound) {
                    rounds.push(currentRound);
                    roundNumber++;
                }
                currentRound = {
                    roundNumber,
                    games: []
                };
            }
            
            if (currentRound) {
                currentRound.games.push(game);
            }
        });
        
        // 마지막 라운드 추가
        if (currentRound) {
            rounds.push(currentRound);
        }
        
        return rounds;
    }


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
        if (!deckUsage || !this.playerDeck.cards.length) return;
        
        deckUsage.style.display = 'block';
        const deckCards = deckUsage.querySelector('.deck-cards');
        
        deckCards.innerHTML = '';
        this.playerDeck.cards.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'deck-card';
            
            card.innerHTML = `
                <span class="card-number">${index + 1}</span>
                ${this.choiceEmojis[choice]}
            `;
            
            deckCards.appendChild(card);
        });
    }
    
    
    showDetailedRoundResult(gameData) {
        const deckSection = document.getElementById('used-deck-section');
        
        // 결과에 따른 스타일 적용
        deckSection.className = 'used-deck-section';
        
        // 사용한 덱 표시 (게임 결과와 함께)
        this.displayRoundResults(
            '#used-deck-inline',
            this.playerDeck.cards,
            gameData.gameResults,
            {
                cardClass: 'used-deck-card-inline',
                totalScoreSelector: '#deck-total-score'
            }
        );
        
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
        
        this.roundHistory.forEach(game => {
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
    

    /**
     * 게임 표기 컴포넌트 클래스
     */
    static GameDisplayComponent = class {
        constructor(choiceEmojis) {
            this.choiceEmojis = choiceEmojis || {
                rock: '🪨',
                paper: '📄', 
                scissors: '✂️'
            };
        }

        /**
         * 라운드 결과를 특정 컨테이너에 표시
         * @param {HTMLElement|string} container - 결과를 표시할 컨테이너
         * @param {Array} deckCards - 덱 카드 배열
         * @param {Array} gameResults - 게임 결과 배열
         * @param {Object} options - 표시 옵션
         */
        render(container, deckCards, gameResults, options = {}) {
            // 컨테이너 요소 가져오기
            let containerElement;
            if (typeof container === 'string') {
                containerElement = document.querySelector(container);
            } else {
                containerElement = container;
            }
            
            if (!containerElement) {
                console.error('컨테이너 요소를 찾을 수 없습니다:', container);
                return { totalPoints: 0, success: false };
            }
            
            containerElement.innerHTML = '';
            
            let totalPoints = 0;
            const cardClass = options.cardClass || 'game-card';
            const showNumbers = options.showNumbers !== false;
            const showPoints = options.showPoints !== false;
            
            deckCards.forEach((choice, index) => {
                const card = document.createElement('div');
                card.className = cardClass;
                
                // 게임 결과가 있다면 색상 적용
                if (gameResults && gameResults[index]) {
                    const result = gameResults[index].result;
                    const pointsEarned = gameResults[index].pointsEarned || 0;
                    card.classList.add(result);
                    
                    totalPoints += pointsEarned;
                    
                    const numberDisplay = showNumbers ? `<span class="card-number">${index + 1}</span>` : '';
                    const pointsDisplay = showPoints && pointsEarned > 0 ? `<span class="card-result">+${pointsEarned}</span>` : '';
                    
                    card.innerHTML = `
                        ${numberDisplay}
                        <span class="card-choice">${this.choiceEmojis[choice]}</span>
                        ${pointsDisplay}
                    `;
                    
                    // 툴팁 추가 (옵션)
                    if (options.showTooltip) {
                        card.title = `${choice} - ${result} ${pointsEarned > 0 ? `(+${pointsEarned}점)` : ''}`;
                    }
                } else {
                    // 게임 결과가 없을 때는 기본 표시
                    const numberDisplay = showNumbers ? `<span class="card-number">${index + 1}</span>` : '';
                    card.innerHTML = `
                        ${numberDisplay}
                        <span class="card-choice">${this.choiceEmojis[choice]}</span>
                    `;
                }
                
                containerElement.appendChild(card);
            });
            
            // 총점 표시 업데이트
            if (options.totalScoreSelector) {
                const totalScoreElement = document.querySelector(options.totalScoreSelector);
                if (totalScoreElement) {
                    totalScoreElement.textContent = `${totalPoints}점`;
                }
            }
            
            return { totalPoints, success: true };
        }

        /**
         * 단일 게임 카드 생성
         * @param {string} choice - 선택
         * @param {Object} gameResult - 게임 결과
         * @param {Object} options - 표시 옵션
         */
        createGameCard(choice, gameResult, options = {}) {
            const card = document.createElement('div');
            card.className = options.cardClass || 'game-card';
            
            if (gameResult) {
                card.classList.add(gameResult.result);
                const pointsDisplay = options.showPoints && gameResult.pointsEarned > 0 
                    ? `<span class="card-result">+${gameResult.pointsEarned}</span>` 
                    : '';
                
                card.innerHTML = `
                    <span class="card-choice">${this.choiceEmojis[choice]}</span>
                    ${pointsDisplay}
                `;
            } else {
                card.innerHTML = `<span class="card-choice">${this.choiceEmojis[choice]}</span>`;
            }
            
            return card;
        }
    };

    /**
     * 라운드 결과를 특정 컨테이너에 표시하는 범용 함수 (하위 호환성)
     * 
     * 사용 예제:
     * // 기본 사용
     * this.displayRoundResults('#my-container', deckCards, gameResults);
     * 
     * // 커스텀 스타일과 옵션
     * this.displayRoundResults('.game-display', deckCards, gameResults, {
     *     cardClass: 'game-card small',
     *     showNumbers: false,
     *     showPoints: true,
     *     showTooltip: true,
     *     totalScoreSelector: '#total-score'
     * });
     * 
     * // GameDisplayComponent 직접 사용
     * const gameDisplay = new window.RPSGame.GameDisplayComponent(choiceEmojis);
     * gameDisplay.render(container, deckCards, gameResults, options);
     */
    displayRoundResults(container, deckCards, gameResults, options = {}) {
        // 컨테이너 요소 가져오기
        let containerElement;
        if (typeof container === 'string') {
            containerElement = document.querySelector(container);
        } else {
            containerElement = container;
        }
        
        if (!containerElement) {
            console.error('컨테이너 요소를 찾을 수 없습니다:', container);
            return { totalPoints: 0, success: false };
        }
        
        containerElement.innerHTML = '';
        
        let totalPoints = 0;
        const cardClass = options.cardClass || 'used-deck-card-inline';
        const showNumbers = options.showNumbers !== false;
        const showPoints = options.showPoints !== false;
        
        deckCards.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = cardClass;
            
            // 게임 결과가 있다면 색상 적용
            if (gameResults && gameResults[index]) {
                const result = gameResults[index].result;
                const pointsEarned = gameResults[index].pointsEarned || 0;
                card.classList.add(result);
                
                totalPoints += pointsEarned;
                
                const numberDisplay = showNumbers ? `<span class="card-number">${index + 1}</span>` : '';
                const pointsDisplay = showPoints && pointsEarned > 0 ? `<span class="card-result">+${pointsEarned}</span>` : '';
                
                card.innerHTML = `
                    ${numberDisplay}
                    <span class="card-choice">${this.choiceEmojis[choice]}</span>
                    ${pointsDisplay}
                `;
                
                // 툴팁 추가 (옵션)
                if (options.showTooltip) {
                    card.title = `${choice} - ${result} ${pointsEarned > 0 ? `(+${pointsEarned}점)` : ''}`;
                }
            } else {
                // 게임 결과가 없을 때는 기본 표시
                const numberDisplay = showNumbers ? `<span class="card-number">${index + 1}</span>` : '';
                card.innerHTML = `
                    ${numberDisplay}
                    <span class="card-choice">${this.choiceEmojis[choice]}</span>
                `;
            }
            
            containerElement.appendChild(card);
        });
        
        // 총점 표시 업데이트
        if (options.totalScoreSelector) {
            const totalScoreElement = document.querySelector(options.totalScoreSelector);
            if (totalScoreElement) {
                totalScoreElement.textContent = `${totalPoints}점`;
            }
        }
        
        return { totalPoints, success: true };
    }

    

    bindUsedDeckEvents() {
        // 기존 이벤트 리스너 제거
        const closeBtn = document.getElementById('used-deck-close');
        const rebuildBtn = document.getElementById('rebuild-deck-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
        }
        if (rebuildBtn) {
            rebuildBtn.replaceWith(rebuildBtn.cloneNode(true));
        }
        if (playAgainBtn) {
            playAgainBtn.replaceWith(playAgainBtn.cloneNode(true));
        }
        
        // 덱 닫기 이벤트 리스너 추가
        document.getElementById('used-deck-close').addEventListener('click', () => {
            document.getElementById('used-deck-section').style.display = 'none';
        });
        
        // 덱 재구성 버튼
        document.getElementById('rebuild-deck-btn').addEventListener('click', () => {
            this.rebuildDeck();
        });
        
        // 다시하기 버튼
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playAgain();
        });
    }
    

    startNewRoundInline() {
        document.getElementById('used-deck-section').style.display = 'none';
        
        this.currentRound = null;
        this.roundHistory = [];
        this.playerDeck = [];
        
        this.showDeckBuilder();
        this.updateDisplay();
        this.updateDeckDisplay();
        
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
                
                // 게임 히스토리를 gameResults 형식으로 로드
                if (data.games && data.games.length > 0) {
                    const gameResults = data.games.map(game => ({
                        gameNumber: game.game_number,
                        playerChoice: game.player_choice,
                        computerChoice: game.computer_choice,
                        result: game.result,
                        pointsEarned: game.points_earned,
                        streakScore: game.win_stack_count,
                        comboScore: game.win_stack_count,
                        loseScore: game.lose_stack_count || 0,
                        stackBroken: game.stack_broken || false
                    }));
                    
                    // gameResults를 개별 히스토리 아이템으로 변환
                    this.roundHistory = gameResults.reverse().map(game => ({
                        player: game.playerChoice,
                        computer: game.computerChoice,
                        result: game.result,
                        pointsEarned: game.pointsEarned,
                        streakScore: game.streakScore,
                        comboScore: game.comboScore,
                        gameNumber: game.gameNumber,
                        timestamp: new Date().toLocaleTimeString(),
                        roundGame: game.gameNumber
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
            window.rpsGame.roundHistory = [];
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