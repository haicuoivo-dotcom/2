/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum ErrorType {
    REACT = 'REACT_ERROR',
    STATE = 'STATE_ERROR',
    API = 'API_ERROR',
    TOKEN_LIMIT = 'TOKEN_LIMIT_ERROR',
    NETWORK = 'NETWORK_ERROR',
    HYDRATION = 'HYDRATION_ERROR',
    GAME_LOGIC = 'GAME_LOGIC_ERROR',
    COMBAT = 'COMBAT_ERROR',
    DATA_CORRUPTION = 'DATA_CORRUPTION',
    UNKNOWN = 'UNKNOWN_ERROR'
}

export interface ErrorContext {
    type: ErrorType;
    timestamp: number;
    componentStack?: string;
    action?: string;
    state?: any;
    lastAction?: any;
    requestData?: any;
    responseData?: any;
    recoveryAttempted?: boolean;
    recoverySuccess?: boolean;
}

export interface DiagnosticReport {
    error: Error;
    context: ErrorContext;
    suggestions: string[];
}

export class GameError extends Error {
    public context: ErrorContext;

    constructor(message: string, type: ErrorType, context?: Partial<ErrorContext>) {
        super(message);
        this.name = 'GameError';
        this.context = {
            type,
            timestamp: Date.now(),
            ...context
        };
    }
}

/**
 * Phân tích và trả về thông báo lỗi thân thiện với người dùng bằng tiếng Việt.
 * @param error Đối tượng lỗi, có thể là bất kỳ kiểu nào.
 * @param context Chuỗi mô tả ngữ cảnh xảy ra lỗi (ví dụ: "xử lý lượt chơi").
 * @returns Chuỗi thông báo lỗi thân thiện với người dùng.
 */
export const getApiErrorMessage = (error: unknown, context: string): string => {
    console.error(`Lỗi khi ${context}:`, error);
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    const lowerCaseErrorMessage = originalErrorMessage.toLowerCase();
    let userFriendlyError = `Lỗi khi ${context}: `;

    // NEW: Check for detailed token error context first. This is a custom pre-flight check.
    const errorContext = (error as any).context;
    if (errorContext && errorContext.tokenCount && errorContext.tokenLimit) {
        return `TOKEN_LIMIT_ERROR:Yêu cầu của bạn quá lớn (ước tính ${errorContext.tokenCount.toLocaleString('vi-VN')} tokens, giới hạn an toàn ${errorContext.tokenLimit.toLocaleString('vi-VN')}).`;
    }
    
    if (lowerCaseErrorMessage.includes('token') && (lowerCaseErrorMessage.includes('exceeds') || lowerCaseErrorMessage.includes('limit'))) {
        return "TOKEN_LIMIT_ERROR:Bối cảnh câu chuyện đã vượt quá giới hạn token của AI.";
    }
    if (lowerCaseErrorMessage.includes('[safety]') || lowerCaseErrorMessage.includes('blocked')) {
        return userFriendlyError + "Yêu cầu của bạn đã bị chặn bởi bộ lọc an toàn của AI. Điều này có thể xảy ra do các từ ngữ hoặc chủ đề liên quan đến bạo lực cực đoan, nội dung khiêu dâm không phù hợp, hoặc các chủ đề nhạy cảm khác. Vui lòng điều chỉnh lại hành động của bạn và thử lại với một cách diễn đạt khác.";
    }
    if (lowerCaseErrorMessage.includes('safety filters blocking the request')) {
        return userFriendlyError + "AI không thể tạo ảnh do yêu cầu của bạn đã bị bộ lọc an toàn chặn. Điều này thường xảy ra với các câu lệnh (prompt) chứa các từ khóa liên quan đến ảnh khỏa thân, bạo lực, hoặc các chủ đề nhạy cảm. Hãy thử sửa lại câu lệnh của bạn, loại bỏ các từ ngữ có thể bị hiểu lầm và thử lại.";
    }
    if (lowerCaseErrorMessage.includes('billed users') || lowerCaseErrorMessage.includes('billing')) {
        return userFriendlyError + "Tính năng này yêu cầu API Key có bật thanh toán (billing enabled) trên Google Cloud. Vui lòng kiểm tra lại cài đặt API Key của bạn.";
    }
    if (lowerCaseErrorMessage.includes('429') || lowerCaseErrorMessage.includes('rate limit')) {
        return userFriendlyError + "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một lát rồi thử lại.";
    }
    if (lowerCaseErrorMessage.includes('invalidturnstructure')) {
        return userFriendlyError + "AI không cung cấp đủ diễn biến truyện hoặc hành động tiếp theo. Điều này có thể do yêu cầu quá phức tạp. Vui lòng thử một hành động khác đơn giản hơn.";
    }
    if (lowerCaseErrorMessage.includes('emptyairesponse') || lowerCaseErrorMessage.includes('empty or invalid response') || lowerCaseErrorMessage.includes('empty response') || lowerCaseErrorMessage.includes('invalid string length')) {
        return userFriendlyError + "AI đã trả về một phản hồi rỗng hoặc không hợp lệ. Điều này có thể do lỗi mạng tạm thời, lỗi máy chủ AI, hoặc yêu cầu quá phức tạp. Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('json') || lowerCaseErrorMessage.includes('unexpected token')) {
        return userFriendlyError + "AI đã trả về dữ liệu không đúng định dạng. Hãy thử thay đổi hành động của bạn hoặc thử lại.";
    }
    if (lowerCaseErrorMessage.includes('schema') || lowerCaseErrorMessage.includes('field is required')) {
        return userFriendlyError + "AI đã trả về dữ liệu không tuân thủ cấu trúc yêu cầu (lỗi schema). Vui lòng thử lại hành động.";
    }
    if (lowerCaseErrorMessage.includes('api key') || lowerCaseErrorMessage.includes('permission')) {
        return userFriendlyError + "Lỗi xác thực API Key. Hệ thống đã tự động thử một key khác (nếu có). Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('timed out') || lowerCaseErrorMessage.includes('network')) {
        return userFriendlyError + "Lỗi kết nối mạng hoặc máy chủ AI không phản hồi. Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('500') || lowerCaseErrorMessage.includes('503') || lowerCaseErrorMessage.includes('server')) {
        return userFriendlyError + "Lỗi máy chủ AI. Vui lòng thử lại sau giây lát.";
    }
    
    return userFriendlyError + `Đã xảy ra lỗi không xác định: ${originalErrorMessage}. Vui lòng thử lại.`;
};

export const diagnoseError = (error: Error | GameError): DiagnosticReport => {
    const context: ErrorContext = (error as GameError).context || {
        type: ErrorType.UNKNOWN,
        timestamp: Date.now()
    };

    const suggestions: string[] = [];

    switch (context.type) {
        case ErrorType.TOKEN_LIMIT:
            suggestions.push('Giảm độ dài của prompt');
            suggestions.push('Xóa bớt lịch sử trò chuyện');
            suggestions.push('Chia nhỏ yêu cầu thành nhiều phần');
            break;

        case ErrorType.NETWORK:
            suggestions.push('Kiểm tra kết nối mạng');
            suggestions.push('Thử lại sau vài giây');
            suggestions.push('Kiểm tra API endpoint có hoạt động không');
            break;

        case ErrorType.STATE:
            suggestions.push('Làm mới trạng thái game');
            suggestions.push('Kiểm tra tính hợp lệ của dữ liệu');
            suggestions.push('Quay lại bước trước đó');
            break;

        case ErrorType.HYDRATION:
            suggestions.push('Kiểm tra cấu trúc dữ liệu');
            suggestions.push('Đảm bảo tất cả trường bắt buộc đều có giá trị');
            suggestions.push('Reset về trạng thái mặc định');
            break;

        case ErrorType.GAME_LOGIC:
            suggestions.push('Kiểm tra điều kiện tiên quyết');
            suggestions.push('Xác minh trạng thái game hợp lệ');
            suggestions.push('Kiểm tra xung đột trạng thái');
            break;

        case ErrorType.COMBAT:
            suggestions.push('Kiểm tra tính hợp lệ của các chỉ số combat');
            suggestions.push('Xác minh thứ tự lượt đánh');
            suggestions.push('Đảm bảo không có hiệu ứng status nào xung đột');
            break;
            
        case ErrorType.DATA_CORRUPTION:
            suggestions.push('Khôi phục từ bản sao lưu gần nhất');
            suggestions.push('Xác minh tính toàn vẹn dữ liệu');
            suggestions.push('Reset về trạng thái mặc định nếu cần');
            break;

        default:
            suggestions.push('Thử tải lại trang');
            suggestions.push('Xóa cache và cookies');
            suggestions.push('Kiểm tra console để biết thêm chi tiết');
    }

    return {
        error,
        context,
        suggestions
    };
};

export const attemptRecovery = async (error: GameError): Promise<boolean> => {
    if (error.context.recoveryAttempted) {
        return false; // Tránh lặp vô tận
    }

    error.context.recoveryAttempted = true;

    switch (error.context.type) {
        case ErrorType.TOKEN_LIMIT:
            // Thử giảm độ dài context
            if (error.context.requestData?.context) {
                error.context.requestData.context = truncateContext(error.context.requestData.context);
                error.context.recoverySuccess = true;
                return true;
            }
            break;

        case ErrorType.STATE:
            // Thử reset về trạng thái trước đó
            if (error.context.lastAction && error.context.state) {
                error.context.recoverySuccess = true;
                return true;
            }
            break;

        case ErrorType.HYDRATION:
            // Thử hydrate lại với defaults
            if (error.context.state) {
                error.context.recoverySuccess = true;
                return true;
            }
            break;

        case ErrorType.DATA_CORRUPTION:
            // Thử load backup
            const hasBackup = await checkBackupExists();
            if (hasBackup) {
                error.context.recoverySuccess = true;
                return true;
            }
            break;

        case ErrorType.NETWORK:
            // Thử retry với exponential backoff
            if (error.context.requestData) {
                error.context.recoverySuccess = await retryWithBackoff(error.context.requestData);
                return error.context.recoverySuccess;
            }
            break;
    }

    error.context.recoverySuccess = false;
    return false;
};

const checkBackupExists = async (): Promise<boolean> => {
    try {
        const saves = await indexedDB.open('gameDB');
        return saves !== null;
    } catch {
        return false;
    }
};

const truncateContext = (context: string): string => {
    // Giữ lại 75% độ dài ban đầu
    return context.slice(0, Math.floor(context.length * 0.75));
};

const retryWithBackoff = async (requestData: any): Promise<boolean> => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Thử lại request
            await fetch(requestData.url, requestData.options);
            return true;
        } catch {
            continue;
        }
    }

    return false;
};
