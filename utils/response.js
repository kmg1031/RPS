/**
 * 표준화된 API 응답 헬퍼
 */

/**
 * 성공 응답
 */
const successResponse = (res, data, statusCode = 200, message = null) => {
    const response = {
        success: true,
        ...(message && { message }),
        data
    };
    return res.status(statusCode).json(response);
};

/**
 * 생성 성공 응답
 */
const createdResponse = (res, data, message = '리소스가 성공적으로 생성되었습니다.') => {
    return successResponse(res, data, 201, message);
};

/**
 * 에러 응답
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
    const response = {
        success: false,
        error: message,
        ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
};

/**
 * Validation 에러 응답
 */
const validationErrorResponse = (res, errors) => {
    return errorResponse(res, '입력 데이터가 유효하지 않습니다.', 400, errors);
};

/**
 * 인증 실패 응답
 */
const unauthorizedResponse = (res, message = '인증이 필요합니다.') => {
    return errorResponse(res, message, 401);
};

/**
 * 권한 없음 응답
 */
const forbiddenResponse = (res, message = '접근 권한이 없습니다.') => {
    return errorResponse(res, message, 403);
};

/**
 * 리소스 없음 응답
 */
const notFoundResponse = (res, message = '요청한 리소스를 찾을 수 없습니다.') => {
    return errorResponse(res, message, 404);
};

/**
 * 충돌 응답 (이미 존재하는 리소스 등)
 */
const conflictResponse = (res, message = '이미 존재하는 리소스입니다.') => {
    return errorResponse(res, message, 409);
};

module.exports = {
    successResponse,
    createdResponse,
    errorResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse
};
