/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Uploads an image file to Cloudinary.
 * @param file The image file to upload.
 * @returns A promise that resolves with the secure URL of the uploaded image.
 * @throws An error if the Cloudinary credentials are not configured or if the upload fails.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const CLOUD_NAME = 'dikxn02y9';
    const UPLOAD_PRESET = 'game_ai_uploads';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Tính năng tải ảnh lên chưa được cấu hình bởi quản trị viên. Vui lòng liên hệ hỗ trợ nếu sự cố vẫn tiếp diễn.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Tải ảnh lên Cloudinary thất bại: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url;
};