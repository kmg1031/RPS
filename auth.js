const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'rps-game-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
    static generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('유효하지 않은 토큰입니다.');
        }
    }

    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    static validateRegister() {
        return [
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
    }

    static validateLogin() {
        return [
            body('username')
                .notEmpty()
                .withMessage('사용자명을 입력해주세요.'),
            body('password')
                .notEmpty()
                .withMessage('비밀번호를 입력해주세요.')
        ];
    }

    static checkValidation(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array()
            });
        }
        next();
    }
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: '액세스 토큰이 필요합니다.' 
        });
    }

    try {
        const decoded = AuthService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: '유효하지 않은 토큰입니다.' 
        });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = AuthService.verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // 토큰이 유효하지 않아도 계속 진행 (선택적 인증)
        }
    }
    next();
};

module.exports = {
    AuthService,
    authenticateToken,
    optionalAuth
};