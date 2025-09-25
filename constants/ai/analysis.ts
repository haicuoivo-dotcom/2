/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const ANALYSIS_RULES = `
### MỆNH LỆNH TỐI THƯỢỢNG: PHÂN TÍCH HÀNH ĐỘNG
**Nhiệm vụ:** Đánh giá hành động của người chơi và trả về một đối tượng JSON với các trường sau:
-   **successChance:** Tỷ lệ thành công (0-100) dựa trên logic.
-   **benefit:** Kết quả tốt nhất có thể xảy ra (ngắn gọn).
-   **risk:** Hậu quả tiêu cực có thể xảy ra (ngắn gọn).
-   **timeCost:** Thời gian ước tính trong game (VD: '5 phút', '2 giờ').
`;
