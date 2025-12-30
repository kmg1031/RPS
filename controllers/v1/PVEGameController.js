/**
 * RESTful PVE Game Controller (v1)
 * 리소스: Games (PVE 덱 모드)
 */
const {
    successResponse,
    createdResponse,
    notFoundResponse
} = require('../../utils/response');

class PVEGameController {
    constructor(pveGameService) {
        this.pveGameService = pveGameService;
    }

    /**
     * POST /api/v1/games
     * 새 게임 생성 및 플레이
     */
    async playGame(req, res) {
        const userId = req.user.id;
        const { playerDeck } = req.body;

        if (!playerDeck || !Array.isArray(playerDeck) || playerDeck.length !== 10) {
            return res.status(400).json({
                success: false,
                error: '10개의 선택으로 구성된 플레이어 덱이 필요합니다.'
            });
        }

        const result = await this.pveGameService.playGame(userId, playerDeck);

        return createdResponse(res, result, '게임이 성공적으로 생성되었습니다.');
    }

    /**
     * GET /api/v1/games/:id
     * 특정 게임 조회
     */
    async getGame(req, res) {
        const userId = req.user.id;
        const gameId = parseInt(req.params.id);

        if (isNaN(gameId)) {
            return res.status(400).json({
                success: false,
                error: '유효하지 않은 게임 ID입니다.'
            });
        }

        const game = await this.pveGameService.getGame(gameId, userId);

        if (!game) {
            return notFoundResponse(res, '게임을 찾을 수 없습니다.');
        }

        return successResponse(res, game);
    }

    /**
     * GET /api/v1/games?limit=10
     * 게임 목록 조회 (히스토리)
     */
    async getHistory(req, res) {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const history = await this.pveGameService.getUserHistory(userId, limit, offset);

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
     * GET /api/v1/users/me/stats?type=pve
     * 사용자 통계 조회
     */
    async getStats(req, res) {
        const userId = req.user.id;
        const stats = await this.pveGameService.getUserStats(userId);

        return successResponse(res, stats);
    }
}

module.exports = PVEGameController;
