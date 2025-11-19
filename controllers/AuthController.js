/**
 * AuthController - 인증 컨트롤러
 * HTTP 요청/응답 처리 및 UserService 호출
 */
class AuthController {
    constructor(userService) {
        this.userService = userService;
    }

    /**
     * 회원가입
     */
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            const result = await this.userService.register(username, email, password);

            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                token: result.token,
                user: {
                    id: result.user.id,
                    username: result.user.username,
                    email: result.user.email
                }
            });

        } catch (error) {
            console.error('회원가입 오류:', error);

            if (error.message.includes('이미 존재하는')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 로그인
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            const result = await this.userService.login(username, password);

            res.json({
                success: true,
                message: '로그인에 성공했습니다.',
                token: result.token,
                user: {
                    id: result.user.id,
                    username: result.user.username
                }
            });

        } catch (error) {
            console.error('로그인 오류:', error);

            if (error.message.includes('찾을 수 없습니다') || error.message.includes('일치하지')) {
                return res.status(401).json({
                    success: false,
                    message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
                });
            }

            res.status(500).json({
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 사용자 정보 조회 (인증 필요)
     */
    async getMe(req, res) {
        try {
            const userId = req.user.id;
            const user = await this.userService.getUserInfo(userId);

            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    total_points: user.total_points || 0,
                    created_at: user.created_at,
                    last_login: user.last_login
                }
            });

        } catch (error) {
            console.error('사용자 정보 조회 오류:', error);

            if (error.message.includes('찾을 수 없습니다')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = AuthController;
