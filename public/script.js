class Deck {
    constructor(maxSize = 10) {
        this.cards = [];
        this.maxSize = maxSize;
        this.currentIndex = 0;
    }

    addCard(choice) {
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
        if (index < 0 || index >= this.cards.length) {
            throw new Error('유효하지 않은 인덱스입니다.');
        }

        this.cards.splice(index, 1);
        return this;
    }

    clear() {
        this.cards = [];
        this.currentIndex = 0;
        return this;
    }

    generateRandom() {
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
            currentIndex: this.currentIndex
        };
    }

    static fromJSON(data) {
        const deck = new Deck(data.maxSize);
        deck.cards = [...data.cards];
        deck.currentIndex = data.currentIndex;
        return deck;
    }

    clone() {
        const clonedDeck = new Deck(this.maxSize);
        clonedDeck.cards = [...this.cards];
        clonedDeck.currentIndex = this.currentIndex;
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

        this.playerDeck.reset();
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

            const response = await fetch('/api/pve-game/play', {
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
            // 새 API: result는 'win'/'lose'/'draw'만 가짐
            const pointsEarned = game.result === 'win' ? 1 : 0; // 승리당 1점

            const historyItem = {
                player: game.playerChoice,
                computer: game.computerChoice,
                result: game.result,
                pointsEarned: pointsEarned,
                streakScore: 0,
                comboScore: 0,
                gameNumber: this.roundHistory.length + 1,
                timestamp: new Date().toLocaleTimeString(),
                roundGame: index + 1 // 라운드 내 게임 순서 (1-10)
            };

            // 히스토리 앞에 추가 (최신 게임이 위에 표시됨)
            this.roundHistory.unshift(historyItem);
        });

        // 점수 업데이트 (게스트 모드만 - 로그인 사용자는 서버에서 자동 처리)
        if (!this.guestScore) {
            this.guestScore = { player: 0, computer: 0 };
        }
        this.guestScore = {
            player: roundData.playerScore,
            computer: roundData.computerScore
        };



        setTimeout(() => {
            this.updateDisplay();
            this.showDetailedRoundResult(roundData);
            this.bindResultButtons();

            // 승점 업데이트 후 사용자 정보 새로고침
            if (roundData.saved && window.authManager.isLoggedIn()) {
                window.authManager.refreshUserInfo();

                // 업적 시스템 업데이트 (사용자 정보 갱신 후)
                setTimeout(() => {
                    if (window.achievementManager) {
                        window.achievementManager.checkForNewAchievements();
                    }
                }, 500); // 사용자 정보 갱신 후 0.5초 뒤 업적 확인
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
        this.playerDeck.clear();
        
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

        games.forEach((game, index) => {
            // 새로운 라운드 시작 조건: roundGame이 1이거나 첫 번째 게임이면서 roundGame이 없는 경우
            if (!currentRound || game.roundGame === 1 || (index === 0 && !game.roundGame)) {
                // 이전 라운드가 있고 완성되었다면 저장
                if (currentRound && currentRound.games.length === 10) {
                    rounds.push(currentRound);
                    roundNumber++;
                }

                // 새 라운드 생성
                currentRound = {
                    roundNumber,
                    games: []
                };
            }

            if (currentRound) {
                currentRound.games.push(game);
            }
        });

        // 마지막 라운드 추가 (10개 게임이 채워진 경우에만)
        if (currentRound && currentRound.games.length === 10) {
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
        const rebuildBtn = document.getElementById('rebuild-deck-btn');
        const playAgainBtn = document.getElementById('play-again-btn');

        if (rebuildBtn) {
            rebuildBtn.replaceWith(rebuildBtn.cloneNode(true));
        }
        if (playAgainBtn) {
            playAgainBtn.replaceWith(playAgainBtn.cloneNode(true));
        }

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
            
            const response = await fetch('/api/game/current-round', {
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

/**
 * 업적 시스템 관리 클래스
 */
class AchievementManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.achievements = [];
        this.userAchievements = [];
        this.categories = ['all', 'GAMEPLAY', 'STREAK', 'COLLECTION', 'MILESTONE', 'SPECIAL'];
        this.currentCategory = 'all';
        this.bindEvents();
    }

    bindEvents() {
        const achievementsBtn = document.getElementById('achievements-btn');
        const achievementsModal = document.getElementById('achievements-modal');
        const achievementsClose = document.getElementById('achievements-close');

        // 업적 버튼 클릭
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                this.showAchievementsModal();
            });
        }

        // 모달 닫기
        if (achievementsClose) {
            achievementsClose.addEventListener('click', () => {
                this.hideAchievementsModal();
            });
        }

        // 모달 배경 클릭으로 닫기
        if (achievementsModal) {
            achievementsModal.addEventListener('click', (e) => {
                if (e.target === achievementsModal) {
                    this.hideAchievementsModal();
                }
            });
        }

        // 카테고리 탭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.switchCategory(e.target.dataset.category);
            }
        });
    }

    async showAchievementsModal() {
        if (!this.authManager.isLoggedIn()) {
            console.warn('업적은 로그인한 사용자만 볼 수 있습니다.');
            return;
        }

        const modal = document.getElementById('achievements-modal');
        if (modal) {
            modal.style.display = 'flex';
            await this.loadAchievements();
            this.renderAchievements();
        }
    }

    hideAchievementsModal() {
        const modal = document.getElementById('achievements-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async loadAchievements() {
        try {
            // 사용자 업적 목록 로드
            const response = await fetch('/api/achievements/user', {
                headers: this.authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.userAchievements = data.achievements || [];
                this.stats = data.stats || {};
                this.updateAchievementStats();
            }
        } catch (error) {
            console.error('업적 로드 오류:', error);
        }
    }

    updateAchievementStats() {
        const completedCount = document.getElementById('completed-count');
        const totalCount = document.getElementById('total-count');
        const completionRate = document.getElementById('completion-rate');

        if (this.stats) {
            if (completedCount) completedCount.textContent = this.stats.completed_count || 0;
            if (totalCount) totalCount.textContent = this.stats.total_count || 0;
            if (completionRate) {
                const rate = this.stats.total_count > 0
                    ? Math.round((this.stats.completed_count / this.stats.total_count) * 100)
                    : 0;
                completionRate.textContent = `${rate}%`;
            }
        }
    }

    switchCategory(category) {
        this.currentCategory = category;

        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        this.renderAchievements();
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        let filteredAchievements = this.userAchievements;

        // 카테고리 필터링
        if (this.currentCategory !== 'all') {
            filteredAchievements = this.userAchievements.filter(
                achievement => achievement.category === this.currentCategory
            );
        }

        if (filteredAchievements.length === 0) {
            container.innerHTML = '<div class="no-achievements">이 카테고리에는 업적이 없습니다.</div>';
            return;
        }

        container.innerHTML = filteredAchievements.map(achievement => {
            const progress = achievement.current_value || 0;
            const target = achievement.target_value || 1;
            const progressPercent = Math.min((progress / target) * 100, 100);
            const isCompleted = achievement.is_completed;

            return `
                <div class="achievement-item ${isCompleted ? 'completed' : ''}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-content">
                        <div class="achievement-header">
                            <h4 class="achievement-name">${achievement.name}</h4>
                            <div class="achievement-difficulty ${achievement.difficulty}">${this.getDifficultyText(achievement.difficulty)}</div>
                        </div>
                        <p class="achievement-description">${achievement.description}</p>
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progress}/${target}</span>
                        </div>
                        <div class="achievement-reward">
                            <span class="reward-points">+${achievement.reward_points}점</span>
                            ${isCompleted ? '<span class="completed-badge">완료</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '쉬움',
            'normal': '보통',
            'hard': '어려움',
            'expert': '전문가'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    // 업적 알림 표시
    showAchievementNotification(achievement) {
        // 알림이 이미 표시중이면 대기열에 추가
        if (!this.notificationQueue) {
            this.notificationQueue = [];
        }

        this.notificationQueue.push(achievement);

        // 현재 알림이 없으면 바로 표시
        if (!this.isShowingNotification) {
            this.processNotificationQueue();
        }
    }

    async processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }

        this.isShowingNotification = true;
        const achievement = this.notificationQueue.shift();

        // 알림 컨테이너 생성 (없으면)
        let container = document.getElementById('achievement-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'achievement-notifications';
            container.className = 'achievement-notifications';
            document.body.appendChild(container);
        }

        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = 'achievement-notification show';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-content">
                <h4>업적 달성!</h4>
                <p>${achievement.name}</p>
                <span class="notification-reward">+${achievement.reward_points}점</span>
            </div>
        `;

        container.appendChild(notification);

        // 3초 후 알림 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                // 다음 알림 처리
                this.processNotificationQueue();
            }, 300);
        }, 3000);
    }

    // 업적 진행도 업데이트 (게임 완료 후 호출)
    async checkForNewAchievements() {
        if (!this.authManager.isLoggedIn()) return;

        try {
            const response = await fetch('/api/achievements/user', {
                headers: this.authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                const newUserAchievements = data.achievements || [];

                // 새로 완료된 업적 찾기
                const newCompletedAchievements = newUserAchievements.filter(newAchievement => {
                    const oldAchievement = this.userAchievements.find(
                        old => old.achievement_key === newAchievement.achievement_key
                    );
                    return newAchievement.is_completed && (!oldAchievement || !oldAchievement.is_completed);
                });

                // 새 업적 알림 표시
                newCompletedAchievements.forEach(achievement => {
                    this.showAchievementNotification(achievement);
                });

                // 업적 배지 업데이트
                if (newCompletedAchievements.length > 0) {
                    this.updateAchievementBadge(newCompletedAchievements.length);
                }

                this.userAchievements = newUserAchievements;
                this.stats = data.stats || {};
            }
        } catch (error) {
            console.error('업적 확인 오류:', error);
        }
    }

    // 업적 배지 업데이트
    updateAchievementBadge(newCount) {
        const badge = document.getElementById('achievement-badge');
        if (badge && newCount > 0) {
            badge.style.display = 'block';
            badge.textContent = '+' + newCount;

            // 5초 후 배지 숨김
            setTimeout(() => {
                badge.style.display = 'none';
            }, 5000);
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

        // 모달 배경 클릭으로 닫기 (로그인 모달만 허용, 회원가입은 불가)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && modal.id !== 'register-modal') {
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

        // 모달 전환 버튼
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');

        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.hideModal('login-modal');
                this.showModal('register-modal');
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.hideModal('register-modal');
                this.showModal('login-modal');
            });
        }
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
        const achievementsBtn = document.getElementById('achievements-btn');

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

            // 로그인한 사용자에게만 업적 버튼 표시
            if (achievementsBtn) {
                achievementsBtn.style.display = 'block';
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';

            // 게스트 사용자에게는 업적 버튼 숨김
            if (achievementsBtn) {
                achievementsBtn.style.display = 'none';
            }
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

/**
 * 연승제 게임 관리 클래스
 */
class StreakGame {
    constructor(authManager) {
        this.authManager = authManager;
        this.gameId = null;
        this.computerChoice = null;
        this.computerChoices = []; // 100개의 미리 생성된 패
        this.currentGameNumber = 0; // 현재 게임 번호
        this.timer = null;
        this.totalTime = 20; // 전체 게임 시간 20초
        this.timeRemaining = 20;
        this.gameStartTime = null; // 게임 전체 시작 시간

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

        this.bindEvents();
    }

    bindEvents() {
        // 게임 시작 버튼
        const startBtn = document.getElementById('start-streak-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // 선택 버튼들
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.makeChoice(choice);
            });
        });

        // 포기 버튼
        const quitBtn = document.getElementById('quit-streak-game');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }

        // 새 게임 버튼
        const newGameBtn = document.getElementById('new-streak-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.showOptions());
        }
    }

    async startGame() {
        console.log('AuthManager:', this.authManager);
        console.log('Is Logged In:', this.authManager ? this.authManager.isLoggedIn() : 'authManager is null');

        if (!this.authManager || !this.authManager.isLoggedIn()) {
            alert('연승제 게임은 로그인이 필요합니다.');
            return;
        }

        const allowTie = document.getElementById('allow-tie').checked;
        const shufflePositions = document.getElementById('shuffle-positions').checked;

        try {
            const response = await fetch('/api/streak-game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({ allowTie, shufflePositions })
            });

            const data = await response.json();

            if (data.success) {
                this.gameId = data.gameId;
                this.computerChoices = data.computerChoices || []; // 100개의 패 저장
                this.computerChoice = data.computerChoice;
                this.currentGameNumber = data.currentGameNumber || 0;

                this.showPlayArea();
                this.displayComputerChoice(data.computerChoice);
                this.startTimer();

                // 재개된 게임인 경우 통계 업데이트
                if (data.resumed) {
                    this.updateStats({
                        currentStreak: data.currentStreak,
                        maxStreak: data.maxStreak,
                        totalPoints: data.totalPoints
                    });
                }

                if (data.shufflePositions || shufflePositions) {
                    this.shuffleChoiceButtons();
                }

                console.log(`게임 시작 - 총 ${this.computerChoices.length}개의 패 생성됨`);
            } else {
                alert(data.message || '게임 시작 실패');
            }
        } catch (error) {
            console.error('게임 시작 오류:', error);
            alert('서버 연결 오류');
        }
    }

    async makeChoice(playerChoice) {
        if (!this.gameId || !this.computerChoice) return;

        // 게임 시작부터 현재까지 경과 시간
        const totalElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // 버튼 비활성화
        this.disableChoiceButtons();

        try {
            const response = await fetch('/api/streak-game/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({
                    gameId: this.gameId,
                    playerChoice,
                    computerChoice: this.computerChoice,
                    timeTaken: totalElapsed // 전체 경과 시간 전달
                })
            });

            const data = await response.json();

            if (data.success) {
                // 성공 - 다음 라운드 (타이머는 계속 진행)
                this.updateStats(data);
                this.computerChoice = data.nextComputerChoice;
                this.currentGameNumber = data.gameNumber; // 현재 게임 번호 업데이트

                // 다음 패가 있는 경우에만 표시
                if (this.computerChoice) {
                    this.displayComputerChoice(this.computerChoice);
                    this.enableChoiceButtons();

                    // 섞기 옵션이 켜져 있으면
                    if (document.getElementById('shuffle-positions').checked) {
                        this.shuffleChoiceButtons();
                    }
                } else {
                    // 100개 패를 모두 사용한 경우
                    this.stopTimer();
                    this.showResult({
                        maxStreak: data.maxStreak,
                        totalPoints: data.totalPoints,
                        gamesPlayed: this.currentGameNumber,
                        message: '모든 패를 완료했습니다!'
                    });
                }
            } else {
                // 게임 종료
                this.stopTimer();
                this.showResult(data.finalStats);
            }
        } catch (error) {
            console.error('선택 처리 오류:', error);
            alert('서버 연결 오류');
            this.enableChoiceButtons();
        }
    }

    async quitGame() {
        this.stopTimer();

        try {
            const response = await fetch('/api/streak-game/quit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({ gameId: this.gameId })
            });

            const data = await response.json();

            if (data.success) {
                this.showResult(data.finalStats);
                this.authManager.refreshUserInfo();
            }
        } catch (error) {
            console.error('게임 포기 오류:', error);
        }
    }

    startTimer() {
        // 게임 시작 시 전체 시간 설정
        if (!this.gameStartTime) {
            this.gameStartTime = Date.now();
            this.timeRemaining = this.totalTime;
        }

        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            this.timeRemaining = this.totalTime - elapsed;

            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 100); // 100ms마다 업데이트하여 더 정확하게
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerFill = document.getElementById('timer-fill');

        if (timerText) {
            timerText.textContent = `${this.timeRemaining}초`;
        }

        if (timerFill) {
            const percentage = (this.timeRemaining / 20) * 100;
            timerFill.style.width = `${percentage}%`;

            // 색상 변경
            if (this.timeRemaining <= 5) {
                timerFill.style.backgroundColor = '#ef4444';
            } else if (this.timeRemaining <= 10) {
                timerFill.style.backgroundColor = '#f59e0b';
            } else {
                timerFill.style.backgroundColor = '#10b981';
            }
        }
    }

    async handleTimeout() {
        this.disableChoiceButtons();
        alert('시간 초과! 게임이 종료되었습니다.');

        // 서버에 타임아웃 처리 (포기로 간주)
        await this.quitGame();
    }

    displayComputerChoice(choice) {
        const computerChoiceCard = document.getElementById('computer-choice');
        if (computerChoiceCard) {
            computerChoiceCard.innerHTML = `
                <div class="choice-display">
                    <span class="choice-emoji">${this.choiceEmojis[choice]}</span>
                    <span class="choice-name">${this.choiceNames[choice]}</span>
                </div>
            `;
        }
    }

    updateStats(data) {
        document.getElementById('current-streak').textContent = data.currentStreak;
        document.getElementById('max-streak').textContent = data.maxStreak;
        document.getElementById('total-points').textContent = data.totalPoints;
    }

    shuffleChoiceButtons() {
        const container = document.getElementById('player-choices');
        const buttons = Array.from(container.children);

        // Fisher-Yates shuffle
        for (let i = buttons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(buttons[j]);
        }
    }

    disableChoiceButtons() {
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    enableChoiceButtons() {
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    showOptions() {
        document.querySelector('.streak-game-options').style.display = 'block';
        document.getElementById('streak-game-play').style.display = 'none';
        document.getElementById('streak-game-result').style.display = 'none';
        this.gameId = null;
        this.gameStartTime = null; // 게임 시작 시간 리셋
    }

    showPlayArea() {
        document.querySelector('.streak-game-options').style.display = 'none';
        document.getElementById('streak-game-play').style.display = 'block';
        document.getElementById('streak-game-result').style.display = 'none';

        // 초기 상태 설정
        this.updateStats({ currentStreak: 0, maxStreak: 0, totalPoints: 0 });

        // 버튼 활성화
        this.enableChoiceButtons();
    }

    showResult(stats) {
        this.stopTimer();
        document.querySelector('.streak-game-options').style.display = 'none';
        document.getElementById('streak-game-play').style.display = 'none';
        document.getElementById('streak-game-result').style.display = 'block';

        document.getElementById('final-max-streak').textContent = stats.maxStreak;
        document.getElementById('final-total-points').textContent = stats.totalPoints;
        document.getElementById('final-games-played').textContent = stats.gamesPlayed;
    }
}

/**
 * 게임 모드 전환 관리
 */
class GameModeManager {
    constructor() {
        this.currentMode = 'pve'; // 'pve' or 'streak'
        this.bindEvents();
        this.showMode('pve');
    }

    bindEvents() {
        const pveBtn = document.getElementById('pve-mode');
        const streakBtn = document.getElementById('streak-mode');

        if (pveBtn) {
            pveBtn.addEventListener('click', () => this.switchMode('pve'));
        }

        if (streakBtn) {
            streakBtn.addEventListener('click', () => this.switchMode('streak'));
        }
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;

        this.currentMode = mode;
        this.updateModeButtons();
        this.showMode(mode);
    }

    updateModeButtons() {
        document.getElementById('pve-mode').classList.toggle('active', this.currentMode === 'pve');
        document.getElementById('streak-mode').classList.toggle('active', this.currentMode === 'streak');
    }

    showMode(mode) {
        const deckBuilder = document.getElementById('deck-builder');
        const streakGameArea = document.getElementById('streak-game-area');
        const usedDeckSection = document.getElementById('used-deck-section');

        if (mode === 'pve') {
            deckBuilder.style.display = 'block';
            streakGameArea.style.display = 'none';
            // usedDeckSection은 게임 결과에 따라 표시됨
        } else if (mode === 'streak') {
            deckBuilder.style.display = 'none';
            usedDeckSection.style.display = 'none';
            streakGameArea.style.display = 'block';
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.achievementManager = new AchievementManager(window.authManager);
    window.rpsGame = new RPSGame();
    window.streakGame = new StreakGame(window.authManager);
    window.gameModeManager = new GameModeManager();
});