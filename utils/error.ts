/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Parses a generic error object and returns a user-friendly Vietnamese error message.
 * @param error The error object, can be of any type.
 * @param context A string describing the context where the error occurred (e.g., "xử lý lượt chơi").
 * @returns A user-friendly error string.
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
