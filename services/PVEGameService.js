/**
 * PVEGameService - PVE 덱 모드 게임 비즈니스 로직
 * 프로세스:
 * 1. 플레이어가 10개 덱 생성 후 서버로 전달
 * 2. 서버에서 임의의 컴퓨터 덱 10개 생성
 * 3. 순서대로 대결 및 결과 계산
 * 4. 승리당 1점
 * 5. 덱과 점수 저장 후 결과 리턴
 */
class PVEGameService {
    constructor(pveGameRepository, userRepository) {
        this.pveGameRepository = pveGameRepository;
        this.userRepository = userRepository;
        this.choices = ['rock', 'paper', 'scissors'];
        // 문자열 매핑
        this.choiceToChar = { 'rock': 'R', 'paper': 'P', 'scissors': 'S' };
        this.charToChoice = { 'R': 'rock', 'P': 'paper', 'S': 'scissors' };
    }

    /**
     * 게임 플레이 (덱 제출 및 결과 계산)
     */
    async playGame(userId, playerDeck) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        // 플레이어 덱 검증
        if (!Array.isArray(playerDeck) || playerDeck.length !== 10) {
            throw new Error('덱은 정확히 10개의 선택이어야 합니다.');
        }

        // 유효한 선택인지 검증
        const invalidChoices = playerDeck.filter(choice => !this.choices.includes(choice));
        if (invalidChoices.length > 0) {
            throw new Error('유효하지 않은 선택이 포함되어 있습니다.');
        }

        // 플레이어 덱을 문자열로 변환
        const playerDeckString = playerDeck.map(choice => this.choiceToChar[choice]).join('');

        // 컴퓨터 덱 생성 (10개)
        const computerDeckString = this.generateComputerDeck(10);
        const computerDeck = this.stringToChoiceArray(computerDeckString);

        // 각 게임 결과 계산
        const gameResults = [];
        let playerScore = 0;
        let computerScore = 0;

        for (let i = 0; i < 10; i++) {
            const playerChoice = playerDeck[i];
            const computerChoice = computerDeck[i];
            const result = this.determineWinner(playerChoice, computerChoice);

            if (result === 'win') {
                playerScore++;
            } else if (result === 'lose') {
                computerScore++;
            }

            gameResults.push({
                gameNumber: i + 1,
                playerChoice,
                computerChoice,
                result
            });
        }

        // 최종 게임 결과 판정
        let gameResult;
        if (playerScore > computerScore) {
            gameResult = 'win';
        } else if (computerScore > playerScore) {
            gameResult = 'lose';
        } else {
            gameResult = 'draw';
        }

        // 데이터베이스에 저장
        const savedGame = await this.pveGameRepository.create(
            userId,
            playerDeckString,
            computerDeckString,
            playerScore,
            computerScore,
            gameResult
        );

        // 사용자 포인트 업데이트 (승리 시만)
        if (gameResult === 'win') {
            await this.userRepository.incrementPoints(userId, playerScore);
        }

        return {
            success: true,
            gameId: savedGame.id,
            playerDeck,
            computerDeck,
            gameResults,
            playerScore,
            computerScore,
            gameResult,
            message: this.getResultMessage(gameResult)
        };
    }

    /**
     * 게임 결과 조회
     */
    async getGame(gameId, userId) {
        const game = await this.pveGameRepository.findById(gameId);

        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.user_id !== userId) {
            throw new Error('권한이 없습니다.');
        }

        // 문자열을 배열로 변환
        const playerDeck = this.stringToChoiceArray(game.player_deck);
        const computerDeck = this.stringToChoiceArray(game.computer_deck);

        // 각 게임 결과 재구성
        const gameResults = [];
        for (let i = 0; i < 10; i++) {
            const playerChoice = playerDeck[i];
            const computerChoice = computerDeck[i];
            const result = this.determineWinner(playerChoice, computerChoice);

            gameResults.push({
                gameNumber: i + 1,
                playerChoice,
                computerChoice,
                result
            });
        }

        return {
            gameId: game.id,
            playerDeck,
            computerDeck,
            gameResults,
            playerScore: game.player_score,
            computerScore: game.computer_score,
            gameResult: game.game_result,
            playedAt: game.played_at
        };
    }

    /**
     * 사용자 게임 히스토리
     */
    async getUserHistory(userId, limit = 10) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const games = await this.pveGameRepository.findUserHistory(userId, limit);

        return games.map(game => ({
            gameId: game.id,
            playerDeck: this.stringToChoiceArray(game.player_deck),
            computerDeck: this.stringToChoiceArray(game.computer_deck),
            playerScore: game.player_score,
            computerScore: game.computer_score,
            gameResult: game.game_result,
            playedAt: game.played_at
        }));
    }

    /**
     * 사용자 통계
     */
    async getUserStats(userId) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        return await this.pveGameRepository.getUserStats(userId);
    }

    // ==================== 헬퍼 메서드 ====================

    /**
     * 랜덤 선택
     */
    getRandomChoice() {
        return this.choices[Math.floor(Math.random() * this.choices.length)];
    }

    /**
     * 컴퓨터 덱 생성 (문자열)
     */
    generateComputerDeck(count = 10) {
        let result = '';
        for (let i = 0; i < count; i++) {
            const choice = this.getRandomChoice();
            result += this.choiceToChar[choice];
        }
        return result;
    }

    /**
     * 문자열을 선택 배열로 변환
     */
    stringToChoiceArray(str) {
        return str.split('').map(char => this.charToChoice[char]);
    }

    /**
     * 승자 판정
     */
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        }

        const winConditions = {
            'rock': 'scissors',
            'scissors': 'paper',
            'paper': 'rock'
        };

        if (winConditions[playerChoice] === computerChoice) {
            return 'win';
        } else {
            return 'lose';
        }
    }

    /**
     * 결과 메시지
     */
    getResultMessage(result) {
        const messages = {
            'win': '승리했습니다!',
            'lose': '패배했습니다.',
            'draw': '무승부입니다.'
        };
        return messages[result] || '게임이 종료되었습니다.';
    }
}

module.exports = PVEGameService;
