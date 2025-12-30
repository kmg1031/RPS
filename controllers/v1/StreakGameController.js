/**
 * RESTful Streak Game Controller (v1)
 * 리소스: Games (연승제 모드)
 */
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    conflictResponse
} = require('../../utils/response');

class StreakGameController {
    constructor(streakGameService) {
        this.streakGameService = streakGameService;
    }

    /**
     * POST /api/v1/games/streak
     * 새 연승제 게임 시작
     */
    async startGame(req, res) {
        const userId = req.user.id;

        // 진행 중인 게임이 있는지 확인
        const currentGame = await this.streakGameService.getCurrentGame(userId);
        if (currentGame) {
            return conflictResponse(res, '이미 진행 중인 게임이 있습니다.');
        }

        const game = await this.streakGameService.startGame(userId);

        return createdResponse(res, game, '연승제 게임이 시작되었습니다.');
    }

    /**
     * POST /api/v1/games/streak/play
     * 라운드 플레이
     */
    async playRound(req, res) {
        const userId = req.user.id;
        const { playerChoice } = req.body;

        if (!playerChoice) {
            return res.status(400).json({
                success: false,
                error: '플레이어 선택이 필요합니다.'
            });
        }

        const result = await this.streakGameService.playRound(userId, playerChoice);

        return successResponse(res, result);
    }

    /**
     * DELETE /api/v1/games/streak/current
     * 현재 게임 포기
     */
    async quitGame(req, res) {
        const userId = req.user.id;

        const result = await this.streakGameService.quitGame(userId);

        if (!result.success) {
            return notFoundResponse(res, result.message);
        }

        return successResponse(res, result, '게임을 포기했습니다.');
    }

    /**
     * GET /api/v1/games/streak/current
     * 현재 진행 중인 게임 조회
     */
    async getCurrentGame(req, res) {
        const userId = req.user.id;

        const game = await this.streakGameService.getCurrentGame(userId);

        if (!game) {
            return notFoundResponse(res, '진행 중인 게임이 없습니다.');
        }

        return successResponse(res, game);
    }

    /**
     * GET /api/v1/games/streak/history?limit=10
     * 게임 히스토리
     */
    async getHistory(req, res) {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const history = await this.streakGameService.getUserHistory(userId, limit, offset);

        return successResponse(res, {
            games: history,
            pagination: {
                limit,
                offset,
                count: history.length
            }
        });
    }

    /**
     * GET /api/v1/users/me/stats?type=streak
     * 사용자 통계
     */
    async getStats(req, res) {
        const userId = req.user.id;
        const stats = await this.streakGameService.getUserStats(userId);

        return successResponse(res, stats);
    }
}

module.exports = StreakGameController;
