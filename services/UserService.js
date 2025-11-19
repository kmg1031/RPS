const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * UserService - 사용자 비즈니스 로직 계층
 * 인증, 회원가입, 사용자 관리 등의 비즈니스 로직 담당
 */
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 회원가입
     */
    async register(username, email, password) {
        // 중복 검사
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('이미 존재하는 사용자명입니다.');
        }

        const existingEmail = await this.userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('이미 존재하는 이메일입니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = await this.userRepository.create(username, email, hashedPassword);

        // JWT 토큰 생성
        const token = this.generateToken(user.id, username);

        return { user, token };
    }

    /**
     * 로그인
     */
    async login(username, password) {
        // 사용자 조회
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 검증
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // 마지막 로그인 시간 업데이트
        await this.userRepository.updateLastLogin(user.id);

        // JWT 토큰 생성
        const token = this.generateToken(user.id, user.username);

        return { user, token };
    }

    /**
     * 사용자 정보 조회
     */
    async getUserInfo(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 비밀번호 해시 제외
        const { password_hash, ...userInfo } = user;
        return userInfo;
    }

    /**
     * 사용자 포인트 관리
     */
    async addPoints(userId, points) {
        return await this.userRepository.incrementPoints(userId, points);
    }

    async getPoints(userId) {
        return await this.userRepository.getPoints(userId);
    }

    async setPoints(userId, points) {
        return await this.userRepository.setPoints(userId, points);
    }

    /**
     * JWT 토큰 생성
     */
    generateToken(userId, username) {
        return jwt.sign(
            { id: userId, username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
    }

    /**
     * JWT 토큰 검증
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            throw new Error('유효하지 않은 토큰입니다.');
        }
    }

    /**
     * Express 미들웨어 - JWT 토큰 인증
     */
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
        }

        try {
            const user = this.verifyToken(token);
            req.user = user;
            next();
        } catch (error) {
            return res.status(403).json({ error: error.message });
        }
    }
}

module.exports = UserService;
