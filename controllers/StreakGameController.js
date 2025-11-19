/**
 * StreakGameController - 연승제 게임 컨트롤러
 * HTTP 요청/응답 처리
 */
class StreakGameController {
    constructor(streakGameService) {
        this.streakGameService = streakGameService;
    }

    /**
     * POST /api/streak-game/start
     * 새 연승제 게임 시작
     */
    async startGame(req, res) {
        try {
            const userId = req.user?.id;
            const { allowTie, shufflePositions } = req.body;

            const result = await this.streakGameService.startNewGame(userId, {
                allowTie: allowTie === true,
                shufflePositions: shufflePositions === true
            });

            res.json(result);
        } catch (error) {
            console.error('게임 시작 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * POST /api/streak-game/play
     * 라운드 플레이
     */
    async playRound(req, res) {
        try {
            const userId = req.user?.id;
            const { gameId, playerChoice, computerChoice, timeTaken } = req.body;

            // 입력 검증
            if (!gameId || !playerChoice || timeTaken === undefined) {
                return res.status(400).json({
                    success: false,
                    message: '필수 파라미터가 누락되었습니다.'
                });
            }

            // 선택 유효성 검사
            const validChoices = ['rock', 'paper', 'scissors'];
            if (!validChoices.includes(playerChoice)) {
                return res.status(400).json({
                    success: false,
                    message: '유효하지 않은 선택입니다.'
                });
            }

            // 게임 상태를 먼저 가져와서 computerChoice 확인
            const gameState = await this.streakGameService.getGameState(gameId, userId);

            // 실제로는 클라이언트에서 받은 computerChoice를 사용
            // (서버에서 생성한 것과 일치하는지 검증 필요)
            const result = await this.streakGameService.playRound(
                userId,
                gameId,
                playerChoice,
                computerChoice,
                timeTaken
            );

            res.json(result);
        } catch (error) {
            console.error('라운드 플레이 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * POST /api/streak-game/quit
     * 게임 중도 포기
     */
    async quitGame(req, res) {
        try {
            const userId = req.user?.id;
            const { gameId } = req.body;

            if (!gameId) {
                return res.status(400).json({
                    success: false,
                    message: 'gameId가 필요합니다.'
                });
            }

            const result = await this.streakGameService.quitGame(userId, gameId);
            res.json(result);
        } catch (error) {
            console.error('게임 종료 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * GET /api/streak-game/current
     * 현재 진행 중인 게임 상태
     */
    async getCurrentGame(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: '로그인이 필요합니다.'
                });
            }

            // 진행 중인 게임 찾기
            const game = await this.streakGameService.streakGameRepository.findInProgressGame(userId);

            if (!game) {
                return res.json({
                    success: true,
                    hasGame: false,
                    message: '진행 중인 게임이 없습니다.'
                });
            }

            const gameState = await this.streakGameService.getGameState(game.id, userId);

            res.json({
                success: true,
                hasGame: true,
                game: gameState
            });
        } catch (error) {
            console.error('현재 게임 조회 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * GET /api/streak-game/history
     * 사용자 게임 히스토리
     */
    async getHistory(req, res) {
        try {
            const userId = req.user?.id;
            const limit = parseInt(req.query.limit) || 10;

            const history = await this.streakGameService.getUserHistory(userId, limit);

            res.json({
                success: true,
                history
            });
        } catch (error) {
            console.error('히스토리 조회 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * GET /api/streak-game/stats
     * 사용자 통계
     */
    async getStats(req, res) {
        try {
            const userId = req.user?.id;

            const stats = await this.streakGameService.getUserStats(userId);

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('통계 조회 오류:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = StreakGameController;
