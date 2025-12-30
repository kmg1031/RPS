/**
 * RESTful Auth Controller (v1)
 * 인증 및 사용자 관리
 */
const {
    successResponse,
    createdResponse,
    unauthorizedResponse,
    conflictResponse
} = require('../../utils/response');

class AuthController {
    constructor(userService) {
        this.userService = userService;
    }

    /**
     * POST /api/v1/users
     * 회원가입 (새 사용자 생성)
     */
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            const result = await this.userService.register(username, email, password);

            // 비밀번호 해시 제외
            const { password_hash, ...userWithoutPassword } = result.user;

            return createdResponse(res, {
                token: result.token,
                user: userWithoutPassword
            }, '회원가입이 완료되었습니다.');
        } catch (error) {
            if (error.message.includes('이미 존재')) {
                return conflictResponse(res, error.message);
            }
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * POST /api/v1/auth/login
     * 로그인 (토큰 발급)
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            const result = await this.userService.login(username, password);

            // 비밀번호 해시 제외
            const { password_hash, ...userWithoutPassword } = result.user;

            return successResponse(res, {
                token: result.token,
                user: userWithoutPassword
            }, 200, '로그인에 성공했습니다.');
        } catch (error) {
            return unauthorizedResponse(res, error.message);
        }
    }

    /**
     * GET /api/v1/users/me
     * 현재 로그인한 사용자 정보 조회
     */
    async getMe(req, res) {
        try {
            const userId = req.user.id;
            const userInfo = await this.userService.getUserInfo(userId);

            return successResponse(res, userInfo);
        } catch (error) {
            return unauthorizedResponse(res, error.message);
        }
    }
}

module.exports = AuthController;
