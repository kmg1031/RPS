/**
 * RESTful Users API Routes (v1)
 * Resource: /api/v1/users
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../../middlewares/errorHandler');
const { validationErrorResponse } = require('../../utils/response');

module.exports = (authController, pveGameController, streakGameController, authenticateToken) => {
    const router = express.Router();

    // Validation 미들웨어
    const validateRegister = [
        body('username')
            .isLength({ min: 3, max: 20 })
            .withMessage('사용자명은 3-20자 사이여야 합니다.')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('사용자명은 영문, 숫자, 밑줄만 사용 가능합니다.'),
        body('email')
            .isEmail()
            .withMessage('유효한 이메일 주소를 입력해주세요.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
            .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
            .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.')
    ];

    const checkValidation = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return validationErrorResponse(res, errors.array());
        }
        next();
    };

    /**
     * POST /api/v1/users
     * 새 사용자 생성 (회원가입)
     */
    router.post('/',
        validateRegister,
        checkValidation,
        catchAsync((req, res) => authController.register(req, res))
    );

    /**
     * GET /api/v1/users/me
     * 현재 로그인한 사용자 정보 조회
     */
    router.get('/me',
        authenticateToken,
        catchAsync((req, res) => authController.getMe(req, res))
    );

    /**
     * GET /api/v1/users/me/stats
     * 현재 사용자의 통계
     */
    router.get('/me/stats',
        authenticateToken,
        catchAsync((req, res) => {
            // 쿼리 파라미터로 게임 타입 구분
            const gameType = req.query.type || 'pve';
            if (gameType === 'streak') {
                return streakGameController.getStats(req, res);
            }
            return pveGameController.getStats(req, res);
        })
    );

    return router;
};
