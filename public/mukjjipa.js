/**
 * 묵찌빠 게임 관리 클래스
 */
class MukjjipaGame {
    constructor(authManager) {
        this.authManager = authManager;
        this.playerChoices = []; // 플레이어의 2가지 선택
        this.computerChoices = []; // 컴퓨터의 2가지 선택
        this.computerFinalChoice = null; // 컴퓨터의 최종 선택
        this.playerFinalChoice = null; // 플레이어의 최종 선택

        this.currentStreak = 0;
        this.maxStreak = 0;
        this.totalScore = 0;
        this.roundCount = 0;

        this.phase = 'main'; // main, setup, waiting, player-turn, result
        this.phaseTimer = null;
        this.timeRemaining = 0;

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

        this.keyboardEnabled = false; // 키보드 네비게이션 활성화 여부

        // 게임 옵션
        this.options = {
            randomOrder: false, // 무작위 선택 순서
            quickGame: false    // 빠른 게임 (승리/무승부 시 즉시 다음 라운드)
        };

        this.bindEvents();

        // 초기 키보드 활성화 (메인 화면에서 시작)
        this.enableKeyboard();

        // 옵션 로드
        this.loadOptions();
    }

    bindEvents() {
        // 메인 화면 시작 버튼
        const mainStartBtn = document.getElementById('start-mukjjipa-main');
        if (mainStartBtn) {
            mainStartBtn.addEventListener('click', () => this.showChoiceSetup());
        }

        // 포기 버튼
        const quitBtn = document.getElementById('quit-mukjjipa-game');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }

        // 다음 라운드 버튼
        const nextRoundBtn = document.getElementById('mukjjipa-next-round');
        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', () => this.nextRound());
        }

        // 새 게임 버튼
        const newGameBtn = document.getElementById('new-mukjjipa-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.showMain());
        }

        // 옵션 체크박스 이벤트
        const randomOrderCheckbox = document.getElementById('mukjjipa-random-order');
        if (randomOrderCheckbox) {
            randomOrderCheckbox.addEventListener('change', (e) => {
                this.options.randomOrder = e.target.checked;
                this.saveOptions();
            });
        }

        const quickGameCheckbox = document.getElementById('mukjjipa-quick-game');
        if (quickGameCheckbox) {
            quickGameCheckbox.addEventListener('change', (e) => {
                this.options.quickGame = e.target.checked;
                this.saveOptions();
            });
        }

        // 키보드 이벤트 리스너
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    loadOptions() {
        try {
            const saved = localStorage.getItem('mukjjipa-options');
            if (saved) {
                this.options = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load options:', e);
        }

        // 체크박스 상태 복원
        const randomOrderCheckbox = document.getElementById('mukjjipa-random-order');
        if (randomOrderCheckbox) randomOrderCheckbox.checked = this.options.randomOrder;

        const quickGameCheckbox = document.getElementById('mukjjipa-quick-game');
        if (quickGameCheckbox) quickGameCheckbox.checked = this.options.quickGame;
    }

    saveOptions() {
        try {
            localStorage.setItem('mukjjipa-options', JSON.stringify(this.options));
        } catch (e) {
            console.error('Failed to save options:', e);
        }
    }

    handleKeyboard(e) {
        if (!this.keyboardEnabled) return;

        // 아래 방향키 처리 (메인 화면, 라운드 결과, 최종 결과 화면)
        if (e.key === 'ArrowDown') {
            e.preventDefault();

            // 메인 화면에서 게임 시작
            if (this.phase === 'main') {
                const startBtn = document.getElementById('start-mukjjipa-main');
                if (startBtn) startBtn.click();
                return;
            }

            // 라운드 결과 화면에서 다음 라운드
            if (this.phase === 'round-result') {
                const nextRoundBtn = document.getElementById('mukjjipa-next-round');
                if (nextRoundBtn && nextRoundBtn.style.display !== 'none') {
                    nextRoundBtn.click();
                }
                return;
            }

            // 최종 결과 화면에서 새 게임
            if (this.phase === 'result') {
                const newGameBtn = document.getElementById('new-mukjjipa-game');
                if (newGameBtn) newGameBtn.click();
                return;
            }
        }

        const buttons = this.getCurrentButtons();
        if (!buttons || buttons.length === 0) return;

        let selectedIndex = -1;

        // 설정 단계 (3개 버튼)
        if (buttons.length === 3) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    selectedIndex = 0; // 1번째 (왼쪽 - 바위)
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = 1; // 2번째 (위쪽 - 보)
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    selectedIndex = 2; // 3번째 (오른쪽 - 가위)
                    break;
            }
        }
        // 플레이어 턴 (2개 버튼)
        else if (buttons.length === 2) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    selectedIndex = 0; // 왼쪽 - 1번 선택
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    selectedIndex = 1; // 오른쪽 - 2번 선택
                    break;
            }
        }

        if (selectedIndex !== -1 && buttons[selectedIndex]) {
            buttons[selectedIndex].click();
        }
    }

    getCurrentButtons() {
        if (this.phase === 'setup') {
            const step1Visible = document.getElementById('mukjjipa-choice-step-1').style.display !== 'none';
            const step2Visible = document.getElementById('mukjjipa-choice-step-2').style.display !== 'none';

            if (step1Visible) {
                return Array.from(document.querySelectorAll('.mukjjipa-setup-btn[data-step="1"]:not([disabled])'));
            } else if (step2Visible) {
                return Array.from(document.querySelectorAll('.mukjjipa-setup-btn[data-step="2"]:not([disabled])'));
            }
        } else if (this.phase === 'player-turn') {
            return Array.from(document.querySelectorAll('.player-choice-btn:not([disabled])'));
        }
        return [];
    }

    enableKeyboard() {
        this.keyboardEnabled = true;
    }

    disableKeyboard() {
        this.keyboardEnabled = false;
    }

    bindChoiceButtons(step) {
        const selector = step === 1
            ? '.mukjjipa-setup-btn[data-step="1"]'
            : '.mukjjipa-setup-btn[data-step="2"]';

        document.querySelectorAll(selector).forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                if (!newBtn.disabled) {
                    const choice = newBtn.dataset.choice;
                    if (step === 1) {
                        this.selectFirstChoice(choice);
                    } else {
                        this.selectSecondChoice(choice);
                    }
                }
            });
        });
    }

    showChoiceSetup() {
        if (!this.authManager || !this.authManager.isLoggedIn()) {
            alert('묵찌빠 게임은 로그인이 필요합니다.');
            return;
        }

        this.phase = 'setup';
        this.playerChoices = [];

        // 화면 전환
        document.getElementById('mukjjipa-main').style.display = 'none';
        document.getElementById('mukjjipa-game-options').style.display = 'block';
        document.getElementById('mukjjipa-game-play').style.display = 'none';
        document.getElementById('mukjjipa-game-result').style.display = 'none';

        // 1번 선택 단계 표시
        document.getElementById('mukjjipa-choice-step-1').style.display = 'block';
        document.getElementById('mukjjipa-choice-step-2').style.display = 'none';

        // 선택지 배열 준비 (쉬운 선택 옵션: 체크하지 않으면 무작위)
        let choicesToDisplay = [...this.choices];
        if (!this.options.randomOrder) {
            choicesToDisplay = this.shuffleArray(choicesToDisplay);
        }

        // 1번 선택 버튼 동적 생성
        const step1Container = document.querySelector('#mukjjipa-choice-step-1 .mukjjipa-choice-selection');
        if (step1Container) {
            step1Container.innerHTML = choicesToDisplay.map(choice => `
                <button class="mukjjipa-setup-btn" data-choice="${choice}" data-step="1">
                    <span class="icon">${this.choiceEmojis[choice]}</span>
                    <span>${this.choiceNames[choice]}</span>
                </button>
            `).join('');
        }

        // 1번 선택 이벤트 바인딩
        this.bindChoiceButtons(1);

        // 디스플레이 초기화
        const choice1Display = document.getElementById('mukjjipa-choice-1-display');
        if (choice1Display) choice1Display.textContent = '-';

        // 키보드 활성화
        this.enableKeyboard();

        // 2초 타이머 시작 (1번 선택 제한 시간)
        this.setupTimer = setTimeout(() => {
            if (this.playerChoices.length === 0) {
                // 시간 초과 시 랜덤 선택
                const randomChoice = choicesToDisplay[Math.floor(Math.random() * choicesToDisplay.length)];
                this.selectFirstChoice(randomChoice);
            }
        }, 2000);
    }

    selectFirstChoice(choice) {
        this.playerChoices[0] = choice;

        // 1번 선택 타이머 정리
        if (this.setupTimer) {
            clearTimeout(this.setupTimer);
            this.setupTimer = null;
        }

        // 키보드 비활성화 (전환 중)
        this.disableKeyboard();

        // 1번 선택 표시
        const choice1Display = document.getElementById('mukjjipa-choice-1-display');
        if (choice1Display) {
            choice1Display.innerHTML = `${this.choiceEmojis[choice]} ${this.choiceNames[choice]}`;
        }

        // 선택된 버튼 하이라이트
        document.querySelectorAll('.mukjjipa-setup-btn[data-step="1"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.choice === choice);
        });

        // 즉시 2번 선택 단계로 전환
        this.showSecondChoiceStep();
    }

    showSecondChoiceStep() {
        // 2번 선택 단계 표시
        document.getElementById('mukjjipa-choice-step-1').style.display = 'none';
        document.getElementById('mukjjipa-choice-step-2').style.display = 'block';

        // 선택지 배열 준비 (쉬운 선택 옵션: 체크하지 않으면 무작위)
        let choicesToDisplay = [...this.choices];
        if (!this.options.randomOrder) {
            choicesToDisplay = this.shuffleArray(choicesToDisplay);
        }

        // 3가지 선택지 모두 생성
        const step2Container = document.querySelector('#mukjjipa-choice-step-2 .mukjjipa-choice-selection');
        if (step2Container) {
            step2Container.innerHTML = choicesToDisplay.map(choice => `
                <button class="mukjjipa-setup-btn" data-choice="${choice}" data-step="2">
                    <span class="icon">${this.choiceEmojis[choice]}</span>
                    <span>${this.choiceNames[choice]}</span>
                </button>
            `).join('');
        }

        // 선택 요약 업데이트
        this.updateChoiceSummary();

        // 2번 선택 이벤트 바인딩
        this.bindChoiceButtons(2);

        // 키보드 재활성화
        this.enableKeyboard();

        // 2초 타이머 시작 (2번 선택 제한 시간)
        this.setupTimer = setTimeout(() => {
            if (this.playerChoices.length === 1) {
                // 시간 초과 시 랜덤 선택
                const randomChoice = choicesToDisplay[Math.floor(Math.random() * choicesToDisplay.length)];
                this.selectSecondChoice(randomChoice);
            }
        }, 2000);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    selectSecondChoice(choice) {
        this.playerChoices[1] = choice;

        // 2번 선택 타이머 정리
        if (this.setupTimer) {
            clearTimeout(this.setupTimer);
            this.setupTimer = null;
        }

        // 키보드 비활성화
        this.disableKeyboard();

        // 선택된 버튼 하이라이트
        document.querySelectorAll('.mukjjipa-setup-btn[data-step="2"]').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.choice === choice);
        });

        // 선택 요약 업데이트
        this.updateChoiceSummary();

        // 즉시 게임 시작
        this.confirmChoices();
    }

    updateChoiceSummary() {
        const choice1 = document.getElementById('mukjjipa-choice-1');
        const choice2 = document.getElementById('mukjjipa-choice-2');

        if (choice1) {
            choice1.innerHTML = this.playerChoices[0]
                ? `<span class="choice-label">1번 선택</span>
                   <span class="choice-value">${this.choiceEmojis[this.playerChoices[0]]} ${this.choiceNames[this.playerChoices[0]]}</span>`
                : '<span class="choice-label">1번 선택</span><span class="choice-value">-</span>';
        }

        if (choice2) {
            choice2.innerHTML = this.playerChoices[1]
                ? `<span class="choice-label">2번 선택</span>
                   <span class="choice-value">${this.choiceEmojis[this.playerChoices[1]]} ${this.choiceNames[this.playerChoices[1]]}</span>`
                : '<span class="choice-label">2번 선택</span><span class="choice-value">-</span>';
        }
    }

    confirmChoices() {
        if (this.playerChoices.length !== 2) {
            alert('2가지 선택을 모두 선택해주세요.');
            return;
        }

        // 컴퓨터 선택 생성
        this.generateComputerChoices();

        // 게임 플레이 화면으로 전환
        this.showPlayArea();

        // 1초 대기 후 컴퓨터 최종 선택
        this.startComputerPhase();
    }

    generateComputerChoices() {
        // 컴퓨터도 2가지 선택 (랜덤하게 2개 선택)
        const availableChoices = [...this.choices];
        this.computerChoices = [];

        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * availableChoices.length);
            this.computerChoices.push(availableChoices[randomIndex]);
            availableChoices.splice(randomIndex, 1);
        }
    }

    startComputerPhase() {
        this.phase = 'waiting';
        this.updatePhaseText('컴퓨터가 선택 중...');

        // 컴퓨터 선택 2개 표시 (숨김 상태)
        this.displayComputerChoices();

        // 플레이어 선택 2개 표시 (클릭 불가)
        this.displayPlayerChoices();

        // 1초 타이머 시작
        this.timeRemaining = 1000;
        this.startPhaseTimer(1000, () => {
            // 1초 후 컴퓨터 최종 선택
            this.computerFinalChoice = this.computerChoices[Math.floor(Math.random() * 2)];
            this.revealComputerChoice();
            this.startPlayerPhase();
        });
    }

    startPlayerPhase() {
        this.phase = 'player-turn';
        this.updatePhaseText('2초 안에 선택하세요!');

        // 플레이어 선택 활성화
        this.enablePlayerChoiceButtons();

        // 키보드 활성화
        this.enableKeyboard();

        // 2초 타이머 시작
        this.timeRemaining = 2000;
        this.startPhaseTimer(2000, () => {
            // 2초 초과 시 자동 패배
            this.handleTimeout();
        });
    }

    makePlayerChoice(choice) {
        if (this.phase !== 'player-turn') return;

        this.stopPhaseTimer();
        this.playerFinalChoice = choice;

        // 키보드 비활성화
        this.disableKeyboard();

        this.disablePlayerChoiceButtons();
        this.revealPlayerChoice(choice);

        // 즉시 승부 판정
        this.judgeRound();
    }

    judgeRound() {
        const result = this.determineWinner(this.playerFinalChoice, this.computerFinalChoice);

        this.roundCount++;

        if (result === 'win') {
            this.currentStreak++;
            this.maxStreak = Math.max(this.maxStreak, this.currentStreak);
            this.totalScore += this.currentStreak;
            this.showRoundResult('승리!', 'win');
        } else if (result === 'lose') {
            this.currentStreak = 0;
            this.showRoundResult('패배!', 'lose');
            // 패배 시 게임 종료
            setTimeout(() => this.showFinalResult(), 2000);
            return;
        } else {
            this.showRoundResult('무승부!', 'draw');
        }

        this.updateStats();

        // 천천히 옵션: 체크하지 않으면 빠른 게임 (즉시 다음 라운드)
        if (!this.options.quickGame) {
            this.nextRound();
        } else {
            // 라운드 결과 phase로 전환
            this.phase = 'round-result';

            // 다음 라운드 버튼 표시
            document.getElementById('mukjjipa-next-round').style.display = 'block';

            // 키보드 활성화 (아래 방향키로 다음 라운드)
            this.enableKeyboard();
        }
    }

    determineWinner(player, computer) {
        if (player === computer) return 'draw';

        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        return winConditions[player] === computer ? 'win' : 'lose';
    }

    nextRound() {
        // 선택 단계로 돌아가기
        this.playerChoices = [];
        this.computerChoices = [];
        this.computerFinalChoice = null;
        this.playerFinalChoice = null;

        this.showChoiceSetup();
    }

    handleTimeout() {
        this.currentStreak = 0;
        this.showRoundResult('시간 초과! 패배!', 'lose');

        setTimeout(() => this.showFinalResult(), 2000);
    }

    quitGame() {
        this.showFinalResult();
    }

    displayComputerChoices() {
        const container = document.getElementById('mukjjipa-computer-choices');
        if (!container) return;

        container.innerHTML = this.computerChoices.map((choice, index) => `
            <div class="choice-card hidden" id="comp-choice-${index}">
                <span class="choice-icon">?</span>
            </div>
        `).join('');
    }

    revealComputerChoice() {
        const finalIndex = this.computerChoices.indexOf(this.computerFinalChoice);
        const finalCard = document.getElementById('mukjjipa-computer-final');

        if (finalCard) {
            finalCard.innerHTML = `
                <span class="choice-icon">${this.choiceEmojis[this.computerFinalChoice]}</span>
                <span class="choice-name">${this.choiceNames[this.computerFinalChoice]}</span>
            `;
            finalCard.style.display = 'flex';
        }

        // 선택되지 않은 카드 흐리게
        this.computerChoices.forEach((choice, index) => {
            const card = document.getElementById(`comp-choice-${index}`);
            if (card && index !== finalIndex) {
                card.classList.add('not-selected');
            }
        });
    }

    displayPlayerChoices() {
        const container = document.getElementById('mukjjipa-player-choices');
        if (!container) return;

        container.innerHTML = this.playerChoices.map((choice, index) => `
            <button class="choice-card player-choice-btn" data-choice="${choice}" disabled>
                <span class="choice-icon">${this.choiceEmojis[choice]}</span>
                <span class="choice-name">${this.choiceNames[choice]}</span>
            </button>
        `).join('');

        // 이벤트 리스너 추가
        container.querySelectorAll('.player-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.makePlayerChoice(choice);
            });
        });
    }

    enablePlayerChoiceButtons() {
        document.querySelectorAll('.player-choice-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    disablePlayerChoiceButtons() {
        document.querySelectorAll('.player-choice-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    revealPlayerChoice(choice) {
        const finalCard = document.getElementById('mukjjipa-player-final');

        if (finalCard) {
            finalCard.innerHTML = `
                <span class="choice-icon">${this.choiceEmojis[choice]}</span>
                <span class="choice-name">${this.choiceNames[choice]}</span>
            `;
            finalCard.style.display = 'flex';
        }

        // 선택되지 않은 카드 흐리게
        document.querySelectorAll('.player-choice-btn').forEach(btn => {
            if (btn.dataset.choice !== choice) {
                btn.classList.add('not-selected');
            }
        });
    }

    showRoundResult(message, resultType) {
        const resultDiv = document.getElementById('mukjjipa-round-result');
        const resultText = resultDiv.querySelector('.result-text');

        if (resultText) {
            resultText.textContent = message;
            resultText.className = `result-text ${resultType}`;
        }

        resultDiv.style.display = 'block';
    }

    updatePhaseText(text) {
        const phaseText = document.getElementById('mukjjipa-phase-text');
        if (phaseText) {
            phaseText.textContent = text;
        }
    }

    startPhaseTimer(duration, callback) {
        const timerFill = document.getElementById('mukjjipa-timer-fill');
        const startTime = Date.now();

        this.phaseTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const percentage = (remaining / duration) * 100;

            if (timerFill) {
                timerFill.style.width = `${percentage}%`;
            }

            if (remaining <= 0) {
                this.stopPhaseTimer();
                callback();
            }
        }, 50);
    }

    stopPhaseTimer() {
        if (this.phaseTimer) {
            clearInterval(this.phaseTimer);
            this.phaseTimer = null;
        }
    }

    updateStats() {
        document.getElementById('mukjjipa-streak').textContent = this.currentStreak;
        document.getElementById('mukjjipa-score').textContent = this.totalScore;
    }

    updateStatsPreview() {
        const maxStreakPreview = document.getElementById('mukjjipa-max-streak-preview');
        const totalScorePreview = document.getElementById('mukjjipa-total-score-preview');

        if (maxStreakPreview) maxStreakPreview.textContent = this.maxStreak;
        if (totalScorePreview) totalScorePreview.textContent = this.totalScore;
    }

    showMain() {
        this.phase = 'main';

        document.getElementById('mukjjipa-main').style.display = 'block';
        document.getElementById('mukjjipa-game-options').style.display = 'none';
        document.getElementById('mukjjipa-game-play').style.display = 'none';
        document.getElementById('mukjjipa-game-result').style.display = 'none';

        this.updateStatsPreview();

        // 키보드 활성화 (아래 방향키로 게임 시작)
        this.enableKeyboard();
    }

    showPlayArea() {
        document.getElementById('mukjjipa-main').style.display = 'none';
        document.getElementById('mukjjipa-game-options').style.display = 'none';
        document.getElementById('mukjjipa-game-play').style.display = 'block';
        document.getElementById('mukjjipa-game-result').style.display = 'none';

        // 초기화
        document.getElementById('mukjjipa-round-result').style.display = 'none';
        document.getElementById('mukjjipa-next-round').style.display = 'none';
        document.getElementById('mukjjipa-computer-final').style.display = 'none';
        document.getElementById('mukjjipa-player-final').style.display = 'none';

        this.updateStats();
    }

    showFinalResult() {
        this.stopPhaseTimer();

        this.phase = 'result';

        document.getElementById('mukjjipa-main').style.display = 'none';
        document.getElementById('mukjjipa-game-options').style.display = 'none';
        document.getElementById('mukjjipa-game-play').style.display = 'none';
        document.getElementById('mukjjipa-game-result').style.display = 'block';

        document.getElementById('mukjjipa-final-streak').textContent = this.maxStreak;
        document.getElementById('mukjjipa-final-score').textContent = this.totalScore;
        document.getElementById('mukjjipa-final-rounds').textContent = this.roundCount;

        // 메인 화면 통계 업데이트
        this.updateStatsPreview();

        // 사용자 정보 갱신
        if (this.authManager) {
            this.authManager.refreshUserInfo();
        }

        // 키보드 활성화 (아래 방향키로 새 게임)
        this.enableKeyboard();
    }
}

// window에 클래스 노출
window.MukjjipaGame = MukjjipaGame;
