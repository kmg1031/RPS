/**
 * PVEGameController - PVE 덱 모드 게임 컨트롤러
 */
class PVEGameController {
    constructor(pveGameService) {
        this.pveGameService = pveGameService;
    }

    /**
     * POST /api/pve-game/play
     * 게임 플레이 (덱 제출)
     */
    async playGame(req, res) {
        try {
            const userId = req.user.id;
            const { playerDeck } = req.body;

            if (!playerDeck) {
                return res.status(400).json({
                    success: false,
                    message: '플레이어 덱이 필요합니다.'
                });
            }

            const result = await this.pveGameService.playGame(userId, playerDeck);
            res.json(result);
        } catch (error) {
            console.error('PVE 게임 플레이 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message || '게임 처리 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * GET /api/pve-game/:gameId
     * 게임 결과 조회
     */
    async getGame(req, res) {
        try {
            const userId = req.user.id;
            const gameId = parseInt(req.params.gameId);

            const game = await this.pveGameService.getGame(gameId, userId);
            res.json({
                success: true,
                ...game
            });
        } catch (error) {
            console.error('게임 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message || '게임 조회 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * GET /api/pve-game/history
     * 게임 히스토리 조회
     */
    async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;

            const history = await this.pveGameService.getUserHistory(userId, limit);
            res.json({
                success: true,
                history
            });
        } catch (error) {
            console.error('히스토리 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message || '히스토리 조회 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * GET /api/pve-game/stats
     * 사용자 통계 조회
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await this.pveGameService.getUserStats(userId);
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message || '통계 조회 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = PVEGameController;
