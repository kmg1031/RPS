/**
 * StreakGameService - 연승제 게임 비즈니스 로직
 * 한 패를 보여주고 사용자가 이기는 패를 선택하는 게임
 * 20초 시간 제한, 패배 시 게임 종료
 * 게임 데이터를 문자열로 압축 저장 (R=rock, P=paper, S=scissors)
 */
class StreakGameService {
    constructor(streakGameRepository, userRepository) {
        this.streakGameRepository = streakGameRepository;
        this.userRepository = userRepository;
        this.choices = ['rock', 'paper', 'scissors'];
        this.winningChoices = {
            'rock': 'paper',      // 바위를 이기려면 보
            'paper': 'scissors',  // 보를 이기려면 가위
            'scissors': 'rock'    // 가위를 이기려면 바위
        };
        // 문자열 매핑
        this.choiceToChar = { 'rock': 'R', 'paper': 'P', 'scissors': 'S' };
        this.charToChoice = { 'R': 'rock', 'P': 'paper', 'S': 'scissors' };
    }

    /**
     * 새 연승제 게임 시작
     */
    async startNewGame(userId, options = {}) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        // 진행 중인 게임이 있는지 확인
        const inProgressGame = await this.streakGameRepository.findInProgressGame(userId);
        if (inProgressGame) {
            // 다음 컴퓨터 선택
            const currentRound = inProgressGame.current_round;
            const computerChoiceChar = inProgressGame.computer_choices[currentRound];
            const computerChoice = this.charToChoice[computerChoiceChar];

            // 문자열을 배열로 변환
            const computerChoices = this.stringToChoiceArray(inProgressGame.computer_choices);

            return {
                success: true,
                gameId: inProgressGame.id,
                computerChoices,
                computerChoice,
                currentGameNumber: currentRound,
                allowTie: inProgressGame.allow_tie,
                shufflePositions: inProgressGame.shuffle_positions,
                currentStreak: inProgressGame.current_streak,
                maxStreak: inProgressGame.max_streak,
                totalPoints: inProgressGame.total_points,
                message: '진행 중인 게임을 계속합니다.',
                resumed: true
            };
        }

        const allowTie = options.allowTie || false;
        const shufflePositions = options.shufflePositions || false;

        // 100개의 컴퓨터 선택 미리 생성
        const computerChoicesString = this.generateComputerChoicesString(100);
        const computerChoices = this.stringToChoiceArray(computerChoicesString);

        // 새 게임 생성
        const newGame = await this.streakGameRepository.create(userId, computerChoicesString, allowTie, shufflePositions);

        // 첫 번째 라운드를 위한 컴퓨터 선택
        const computerChoice = computerChoices[0];

        return {
            success: true,
            gameId: newGame.id,
            computerChoices,
            computerChoice,
            currentGameNumber: 0,
            allowTie,
            shufflePositions,
            currentStreak: 0,
            message: '새 게임이 시작되었습니다!'
        };
    }

    /**
     * 플레이어 선택 처리
     */
    async playRound(userId, gameId, playerChoice, computerChoice, timeTaken) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        // 게임 유효성 확인
        const game = await this.streakGameRepository.findById(gameId);
        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.user_id !== userId) {
            throw new Error('권한이 없습니다.');
        }

        if (game.game_status !== 'in_progress') {
            throw new Error('이미 종료된 게임입니다.');
        }

        // 타임아웃 체크 (20초)
        if (timeTaken > 20) {
            await this.streakGameRepository.failGame(gameId);
            return {
                success: false,
                result: 'timeout',
                message: '시간 초과! 게임이 종료되었습니다.',
                finalStats: await this.getGameStats(gameId)
            };
        }

        // 승부 판정
        let result = this.determineResult(computerChoice, playerChoice, game.allow_tie);

        let currentStreak = game.current_streak;
        let maxStreak = game.max_streak;
        let pointsEarned = 0;
        let gameOver = false;

        if (result === 'win') {
            // 승리 - 연승 증가
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
            pointsEarned = this.calculatePoints(currentStreak, timeTaken);
        } else if (result === 'lose') {
            // 패배 - 게임 종료
            gameOver = true;
        } else if (result === 'tie') {
            // 무승부 - 옵션에 따라 처리
            if (!game.allow_tie) {
                // 무승부 불허 - 패배로 간주
                gameOver = true;
                result = 'lose';
            }
            // 무승부 허용 시 연승은 유지
        }

        const totalPoints = game.total_points + pointsEarned;

        // 플레이어 선택을 문자로 변환하여 저장
        const playerChoiceChar = this.choiceToChar[playerChoice];
        await this.streakGameRepository.addPlayerChoice(
            gameId,
            playerChoiceChar,
            currentStreak,
            maxStreak,
            totalPoints
        );

        if (gameOver) {
            // 게임 종료 처리
            await this.streakGameRepository.failGame(gameId);

            // 사용자 포인트 업데이트
            if (totalPoints > 0) {
                await this.userRepository.incrementPoints(userId, totalPoints);
            }

            return {
                success: false,
                result,
                gameOver: true,
                currentStreak,
                maxStreak,
                pointsEarned,
                totalPoints,
                message: '게임 종료! 패배했습니다.',
                finalStats: await this.getGameStats(gameId)
            };
        }

        // 다음 라운드를 위한 컴퓨터 선택
        const nextRound = game.current_round + 1;
        const nextComputerChoiceChar = game.computer_choices[nextRound];
        const nextComputerChoice = nextComputerChoiceChar ? this.charToChoice[nextComputerChoiceChar] : null;

        return {
            success: true,
            result,
            currentStreak,
            maxStreak,
            pointsEarned,
            totalPoints,
            gameNumber: nextRound,
            nextComputerChoice,
            message: result === 'win' ? '정답! 연승 계속!' : '무승부!'
        };
    }

    /**
     * 플레이어가 게임을 중도 포기
     */
    async quitGame(userId, gameId) {
        const game = await this.streakGameRepository.findById(gameId);

        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.user_id !== userId) {
            throw new Error('권한이 없습니다.');
        }

        // 게임 종료 처리
        await this.streakGameRepository.completeGame(gameId, 'completed');

        // 획득한 포인트가 있다면 사용자에게 적용
        if (game.total_points > 0) {
            await this.userRepository.incrementPoints(userId, game.total_points);
        }

        return {
            success: true,
            message: '게임을 종료했습니다.',
            finalStats: await this.getGameStats(gameId)
        };
    }

    /**
     * 현재 게임 상태 조회
     */
    async getGameState(gameId, userId) {
        const game = await this.streakGameRepository.findById(gameId);

        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.user_id !== userId) {
            throw new Error('권한이 없습니다.');
        }

        return {
            gameId: game.id,
            currentStreak: game.current_streak,
            maxStreak: game.max_streak,
            totalPoints: game.total_points,
            gameStatus: game.game_status,
            allowTie: game.allow_tie,
            shufflePositions: game.shuffle_positions,
            gamesPlayed: game.current_round
        };
    }

    /**
     * 게임 통계 조회
     */
    async getGameStats(gameId) {
        const game = await this.streakGameRepository.findById(gameId);

        return {
            maxStreak: game.max_streak,
            totalPoints: game.total_points,
            gamesPlayed: game.current_round
        };
    }

    /**
     * 사용자 연승제 게임 히스토리
     */
    async getUserHistory(userId, limit = 10) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        return await this.streakGameRepository.findUserHistory(userId, limit);
    }

    /**
     * 사용자 연승제 게임 통계
     */
    async getUserStats(userId) {
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        return await this.streakGameRepository.getUserStats(userId);
    }

    // ==================== 헬퍼 메서드 ====================

    /**
     * 랜덤 선택
     */
    getRandomChoice() {
        return this.choices[Math.floor(Math.random() * this.choices.length)];
    }

    /**
     * 100개의 컴퓨터 선택을 문자열로 생성
     */
    generateComputerChoicesString(count = 100) {
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
     * 승부 판정
     * @param {string} computerChoice - 컴퓨터가 낸 패 (사용자가 이겨야 할 대상)
     * @param {string} playerChoice - 플레이어가 선택한 패
     * @param {boolean} allowTie - 무승부 허용 여부
     */
    determineResult(computerChoice, playerChoice, allowTie = false) {
        const correctChoice = this.winningChoices[computerChoice];

        if (playerChoice === correctChoice) {
            return 'win';
        } else if (playerChoice === computerChoice) {
            return 'tie';
        } else {
            return 'lose';
        }
    }

    /**
     * 점수 계산
     * 이길 때마다 1점
     */
    calculatePoints(streak, timeTaken) {
        return 1;
    }

    /**
     * 정답 선택 가져오기 (컴퓨터 선택을 이기는 패)
     */
    getCorrectChoice(computerChoice) {
        return this.winningChoices[computerChoice];
    }
}

module.exports = StreakGameService;
