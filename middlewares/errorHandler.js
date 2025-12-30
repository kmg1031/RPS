/**
 * 중앙 집중식 에러 핸들링 미들웨어
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 에러 핸들링 미들웨어
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 개발 환경
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            stack: err.stack,
            details: err
        });
    }
    // 프로덕션 환경
    else {
        // Operational 에러 (예측 가능한 에러)
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        }
        // 프로그래밍 에러 또는 알 수 없는 에러
        else {
            console.error('ERROR 💥:', err);
            res.status(500).json({
                success: false,
                error: '서버 내부 오류가 발생했습니다.'
            });
        }
    }
};

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`요청한 경로 ${req.originalUrl}를 찾을 수 없습니다.`, 404);
    next(err);
};

/**
 * 비동기 에러 캐치 래퍼
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    catchAsync
};
