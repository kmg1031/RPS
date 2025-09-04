const express = require('express');
const router = express.Router();
const { AuthService, authenticateToken } = require('../auth');

// 회원가입
router.post('/register', 
    AuthService.validateRegister(),
    AuthService.checkValidation,
    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const Database = require('../database');
            const db = new Database();

            // 중복 체크
            const existingUser = await db.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '이미 존재하는 사용자명입니다.'
                });
            }

            const existingEmail = await db.getUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다.'
                });
            }

            // 비밀번호 해싱 및 사용자 생성
            const passwordHash = await AuthService.hashPassword(password);
            const user = await db.createUser(username, email, passwordHash);

            // JWT 토큰 생성
            const token = AuthService.generateToken({
                id: user.id,
                username: user.username
            });

            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });

        } catch (error) {
            console.error('회원가입 오류:', error);
            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    }
);

// 로그인
router.post('/login',
    AuthService.validateLogin(),
    AuthService.checkValidation,
    async (req, res) => {
        try {
            const { username, password } = req.body;
            const Database = require('../database');
            const db = new Database();

            // 사용자 조회
            const user = await db.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
                });
            }

            // 비밀번호 확인
            const isPasswordValid = await AuthService.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
                });
            }

            // 마지막 로그인 시간 업데이트
            await db.updateLastLogin(user.id);

            // JWT 토큰 생성
            const token = AuthService.generateToken({
                id: user.id,
                username: user.username
            });

            res.json({
                success: true,
                message: '로그인에 성공했습니다.',
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });

        } catch (error) {
            console.error('로그인 오류:', error);
            res.status(500).json({
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.'
            });
        }
    }
);

// 사용자 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const Database = require('../database');
        const db = new Database();
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                total_points: user.total_points || 0,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;