/**
 * RESTful Authentication API Routes (v1)
 * Resource: /api/v1/auth
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../../middlewares/errorHandler');
const { validationErrorResponse } = require('../../utils/response');

module.exports = (authController) => {
    const router = express.Router();

    const validateLogin = [
        body('username').notEmpty().withMessage('사용자명을 입력해주세요.'),
        body('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
    ];

    const checkValidation = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return validationErrorResponse(res, errors.array());
        }
        next();
    };

    /**
     * POST /api/v1/auth/login
     * 사용자 로그인 (토큰 발급)
     */
    router.post('/login',
        validateLogin,
        checkValidation,
        catchAsync((req, res) => authController.login(req, res))
    );

    /**
     * POST /api/v1/auth/logout
     * 사용자 로그아웃 (클라이언트에서 토큰 삭제)
     */
    router.post('/logout', (req, res) => {
        res.json({
            success: true,
            message: '로그아웃되었습니다.'
        });
    });

    return router;
};
