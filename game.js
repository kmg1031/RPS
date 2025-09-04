/**
 * 가위바위보 게임 로직을 담당하는 클래스
 */
class GameLogic {
    constructor() {
        this.choices = ['rock', 'paper', 'scissors'];
    }

    /**
     * 랜덤한 컴퓨터 선택 생성
     * @returns {string} 컴퓨터의 선택 (rock, paper, scissors)
     */
    getComputerChoice() {
        const randomIndex = Math.floor(Math.random() * this.choices.length);
        return this.choices[randomIndex];
    }

    /**
     * 승패 판정
     * @param {string} playerChoice 플레이어 선택
     * @param {string} computerChoice 컴퓨터 선택
     * @returns {string} 결과 (win, lose, draw)
     */
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        }
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
    }

    /**
     * 단일 게임 처리
     * @param {string} playerChoice 플레이어 선택
     * @returns {Object} 게임 결과
     */
    playSingleGame(playerChoice) {
        const computerChoice = this.getComputerChoice();
        const result = this.determineWinner(playerChoice, computerChoice);
        
        return {
            playerChoice,
            computerChoice,
            result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 라운드 게임 처리 (10게임 일괄 처리)
     * @param {Array} playerDeck 플레이어 덱 (10개 선택)
     * @returns {Object} 라운드 결과
     */
    playRoundBatch(playerDeck) {
        if (!playerDeck || !Array.isArray(playerDeck) || playerDeck.length !== 10) {
            throw new Error('유효하지 않은 덱입니다. 10개의 선택이 필요합니다.');
        }

        // 모든 선택이 유효한지 확인
        const invalidChoices = playerDeck.filter(choice => !this.choices.includes(choice));
        if (invalidChoices.length > 0) {
            throw new Error('덱에 유효하지 않은 선택이 포함되어 있습니다.');
        }

        // 컴퓨터 덱 생성 (랜덤)
        const computerDeck = Array.from({ length: 10 }, () => this.getComputerChoice());

        // 10게임 시뮬레이션
        const gameResults = [];
        let playerScore = 0;
        let computerScore = 0;
        let currentStreakScore = 0; // 연속 점수 (무승부+승리)
        let currentComboScore = 0;  // 콤보 점수 (승리만)
        let currentLoseScore = 0;   // 패배 점수
        let previousChoice = null;
        let maxStreakScore = 0;
        let maxComboScore = 0;

        for (let i = 0; i < 10; i++) {
            const playerChoice = playerDeck[i];
            const computerChoice = computerDeck[i];
            const result = this.determineWinner(playerChoice, computerChoice);

            // 선택이 바뀌었는지 확인
            const choiceChanged = previousChoice && previousChoice !== playerChoice;
            let stackBroken = false;
            let pointsEarned = 0;

            if (choiceChanged) {
                // 선택이 바뀌면 모든 연속 초기화
                currentStreakScore = 0;
                currentComboScore = 0;
                currentLoseScore = 0;
                stackBroken = true;
            }

            // 게임 결과에 따른 처리
            if (result === 'win') {
                currentStreakScore++;
                currentComboScore++;
                pointsEarned = currentComboScore;
                playerScore += pointsEarned;
                currentLoseScore = 0;
            } else if (result === 'draw') {
                currentStreakScore++;
                // 콤보는 승리만 증가하므로 유지
                pointsEarned = 0;
                currentLoseScore = 0;
            } else { // lose
                currentStreakScore = 0;
                currentComboScore = 0;
                currentLoseScore++;
                computerScore += 1; // 컴퓨터는 단순히 승리 횟수
                pointsEarned = 0;
                stackBroken = true;
            }

            // 최대값 추적
            maxStreakScore = Math.max(maxStreakScore, currentStreakScore);
            maxComboScore = Math.max(maxComboScore, currentComboScore);

            // 게임 결과 저장
            gameResults.push({
                gameNumber: i + 1,
                playerChoice,
                computerChoice,
                result,
                pointsEarned,
                streakScore: currentStreakScore,
                comboScore: currentComboScore,
                loseScore: currentLoseScore,
                stackBroken
            });

            previousChoice = playerChoice;
        }

        // 라운드 결과 결정
        let roundResult = 'draw';
        if (playerScore > computerScore) {
            roundResult = 'win';
        } else if (computerScore > playerScore) {
            roundResult = 'lose';
        }

        return {
            roundResult,
            playerScore,
            computerScore,
            maxStreakScore,
            maxComboScore,
            gameResults,
            playerDeck,
            computerDeck,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 개별 게임에서의 점수 계산 (기존 라운드 시스템용)
     * @param {Object} currentRound 현재 라운드 정보
     * @param {string} playerChoice 플레이어 선택
     * @param {string} result 게임 결과
     * @returns {Object} 업데이트된 점수 정보
     */
    calculateGamePoints(currentRound, playerChoice, result) {
        let streakScore = currentRound.current_win_stack; // 연속 점수 (무승부+승리)
        let comboScore = 0; // 콤보 점수 (승리만)
        let loseScore = currentRound.current_lose_stack;
        let pointsEarned = 0;
        let stackBroken = false;

        // 이전 선택과 다른 선택을 했는지 확인
        const choiceChanged = currentRound.current_choice && currentRound.current_choice !== playerChoice;
        
        if (choiceChanged) {
            // 선택이 바뀌면 모든 연속 초기화
            streakScore = 0;
            comboScore = 0;
            loseScore = 0;
            stackBroken = true;
        } else {
            // 같은 선택일 경우
            if (result === 'win') {
                // 승리: 연속 점수 증가, 콤보 점수 증가
                streakScore += 1;
                comboScore = streakScore; // 콤보는 연속 승리만
                pointsEarned = comboScore;
                loseScore = 0; // 패배 점수 초기화
            } else if (result === 'draw') {
                // 무승부: 연속 점수 증가, 콤보 점수 유지
                streakScore += 1;
                comboScore = Math.min(streakScore, currentRound.current_win_stack); // 이전 콤보 유지
                pointsEarned = 0;
                loseScore = 0;
            } else {
                // 패배: 모든 연속 초기화
                streakScore = 0;
                comboScore = 0;
                loseScore += 1;
                pointsEarned = 0;
                stackBroken = true;
            }
        }

        return {
            streakScore,
            comboScore,
            loseScore,
            pointsEarned,
            stackBroken
        };
    }

    /**
     * 선택 유효성 검사
     * @param {string} choice 선택
     * @returns {boolean} 유효성
     */
    isValidChoice(choice) {
        return this.choices.includes(choice);
    }

    /**
     * 덱 유효성 검사
     * @param {Array} deck 덱 배열
     * @returns {boolean} 유효성
     */
    isValidDeck(deck) {
        return Array.isArray(deck) && 
               deck.length === 10 && 
               deck.every(choice => this.isValidChoice(choice));
    }
}

module.exports = GameLogic;