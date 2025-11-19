const express = require('express');
const { body, validationResult } = require('express-validator');

/**
 * 인증 라우터
 * AuthController를 사용한 라우터
 */
module.exports = (authController, authenticateToken) => {
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

    const validateLogin = [
        body('username').notEmpty().withMessage('사용자명을 입력해주세요.'),
        body('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
    ];

    const checkValidation = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array()
            });
        }
        next();
    };

    // 회원가입
    router.post('/register',
        validateRegister,
        checkValidation,
        (req, res) => authController.register(req, res)
    );

    // 로그인
    router.post('/login',
        validateLogin,
        checkValidation,
        (req, res) => authController.login(req, res)
    );

    // 사용자 정보 조회 (인증 필요)
    router.get('/me',
        authenticateToken,
        (req, res) => authController.getMe(req, res)
    );

    return router;
};
