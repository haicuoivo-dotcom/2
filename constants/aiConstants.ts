/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// REFACTOR: This file now acts as an "assembler", importing all the specialized
// rule modules and composing them into the final, larger rulesets for the AI.
import { CORE_RULES_BASE, PROCESS_TURN_RULES_CONSISTENCY } from './ai/core';
import { MECHANICS_RULES_CHARACTER } from './ai/mechanics-character';
import { MECHANICS_RULES_ACTIONS } from './ai/mechanics-actions';
import { MECHANICS_RULES_WORLD_SYSTEMS } from './ai/mechanics-worldSystems';
import { MECHANICS_RULES_PROGRESSION } from './ai/mechanics-progression';
import { COMBAT_ACTION_RULES, PC_COMBAT_ACTION_SELECTION_RULES as PC_COMBAT_ACTION_RULES } from './ai/mechanics-combat';
import { WORLD_HEALING_RULES as WORLD_HEALING_RULES_BASE, WORLD_SIMULATION_RULES, LORE_LIBRARY_NPC_GENERATION_SYSTEM } from './ai/mechanics-world';
import { ADULT_RULES_BASE, ADULT_RULES_LIBRARIES } from './ai/adult';
import { ANALYSIS_RULES } from './ai/analysis';
// FIX: Import FANFIC_SYSTEM_ANALYSIS_RULES to allow re-exporting.
// FIX: Import STARTING_POINT_SUGGESTION_RULES to re-export it.
import { CREATION_RULES_WORLD, CREATION_RULES_CHARACTER, CREATION_RULES_SCENE, CREATION_RULES_ENRICHMENT, CREATION_RULES_PLANNING as CREATION_RULES_PLANNING_BASE, FANFIC_ANALYSIS_RULES as FANFIC_ANALYSIS_RULES_BASE, FANFIC_SYSTEM_ANALYSIS_RULES, STARTING_POINT_SUGGESTION_RULES, CREATION_QUICK_RULES, CREATION_DETAILED_RULES, CREATION_RULES_WORLD_SKILLS } from './ai/creation';
import { WORLD_BUILDING_LIBRARIES } from './ai/lore';
import { TURN_PLAN_SCHEMA, BIG_DATA_ANALYSIS_SCHEMA, UPDATED_CHARACTERS_SCHEMA, WORLD_ENRICHMENT_RESPONSE_SCHEMA, WORLD_HEALING_RESPONSE_SCHEMA, WORLD_SIMULATION_SCHEMA, ITEM_RELATIONSHIP_SUPPLEMENT_SCHEMA, MEMORY_SUMMARIZATION_SCHEMA } from '../schemas';

// =================================================================
// RULE BUILDING BLOCKS
// =================================================================

const THINKING_MANDATE = `
**Quy trình Tư duy (Chain-of-Thought):** Trước khi tạo JSON, hãy suy nghĩ trong thẻ \`<thinking>\`. Phân tích yêu cầu, kiểm tra các quy tắc liên quan, và lên kế hoạch cho các thay đổi. Khối \`<thinking>\` sẽ không được hiển thị cho người dùng.
`;

const BASE_CORE_RULES = `
${CORE_RULES_BASE}
`;

const BASE_CHARACTER_RULES = `
${BASE_CORE_RULES}
${MECHANICS_RULES_CHARACTER}
`;

const BASE_COMBAT_RULES = `
${THINKING_MANDATE}
${BASE_CHARACTER_RULES}
`;


// =================================================================
// GAMEPLAY RULESETS
// =================================================================

const BASE_GAMEPLAY_RULES = `
${PROCESS_TURN_RULES_CONSISTENCY}
${BASE_CHARACTER_RULES}
${MECHANICS_RULES_ACTIONS}
${MECHANICS_RULES_WORLD_SYSTEMS}
${MECHANICS_RULES_PROGRESSION}
${WORLD_BUILDING_LIBRARIES}
${LORE_LIBRARY_NPC_GENERATION_SYSTEM}
`;

export const PROCESS_TURN_RULES = `
${THINKING_MANDATE}
**MỆNH LỆNH TỐI THƯỢNG VỀ HỆ THỐNG DANH VỌNG & TAI TIẾNG (LOGIC MỚI - BẮT BUỘC TUÂN THỦ):**
1.  **Bối cảnh:** Game có một hệ thống 100 cấp bậc Danh Vọng và Tai Tiếng, với các danh hiệu thay đổi theo từng thể loại thế giới (Tu Tiên, Võ Lâm, Fantasy...). Mã nguồn của game sẽ tự động tính toán cấp bậc và danh hiệu chính xác dựa trên điểm số.
2.  **Nhiệm vụ của AI:** Nhiệm vụ của bạn là **phát hiện sự thay đổi về TÊN** của danh hiệu và thực hiện các hành động logic tương ứng.
3.  **Điều kiện Kích hoạt (TRIGGER):**
    *   **IF** hành động của người chơi làm cho TÊN DANH HIỆU của họ thay đổi (ví dụ: từ "Thiếu Hiệp" lên "Đại Hiệp", bỏ qua phần cấp số), **THEN** bạn BẮT BUỘC phải thực hiện 3 hành động sau:
4.  **Hành động BẮT BUỘC khi có Trigger:**
    i.  **Xóa Danh hiệu Cũ:** Ra một mệnh lệnh \`REMOVE_STAT\` để xóa \`Stat\` Danh Hiệu CŨ. Ví dụ: \`{ "command": "REMOVE_STAT", "args": { "characterName": "[PC:Tên]", "statName": "Thiếu Hiệp (Cấp 15)" } }\`.
    ii. **Thêm Danh hiệu Mới:** Ra một mệnh lệnh \`ADD_STAT\` để thêm một \`Stat\` MỚI với \`category: 'Danh Hiệu'\`. \`name\` của Stat này BẮT BUỘC phải khớp chính xác với TÊN DANH HIỆU MỚI, bao gồm cả cấp số. Ví dụ: \`{ "command": "ADD_STAT", "args": { "characterName": "[PC:Tên]", "stat": { "name": "Đại Hiệp (Cấp 20)", "category": "Danh Hiệu", ... } } }\`.
    iii. **Thông báo:** Thêm một \`message\` để thông báo cho người chơi về thành tựu này. Ví dụ: "Danh Vọng của bạn đã đạt đến một tầm cao mới! Bạn đã nhận được danh hiệu: [Đại Hiệp (Cấp 20)]."
5.  **QUAN TRỌNG:** KHÔNG thực hiện các hành động trên nếu chỉ có con số cấp bậc thay đổi mà tên danh hiệu vẫn giữ nguyên. Trigger là sự thay đổi của phần chữ mô tả.

**MỆNH LỆNH TỐI THƯỢNG VỀ HỆ THỐNG TÍN NGƯỠNG (BẮT BUỘC TUÂN THỦ):**
1.  **Khi Tường thuật Kỹ năng Thần thánh:** Nếu một nhân vật sử dụng kỹ năng thuộc tính 'Thánh' (Chữa trị, Thánh Quang...), bạn BẮT BUỘC phải kiểm tra chỉ số 'Tín ngưỡng' của họ. Hãy mô tả hiệu ứng của kỹ năng mạnh mẽ hơn hoặc yếu đi tương ứng với chỉ số đó. Ví dụ: "Với Tín ngưỡng gần như tuyệt đối, phép Chữa Trị của cô ấy tỏa ra một luồng ánh sáng rực rỡ, chữa lành vết thương một cách thần kỳ."
2.  **Khi Tạo NPC Tôn giáo:** Khi tạo ra một NPC có vai trò tôn giáo (linh mục, tu sĩ, thánh kỵ sĩ...), BẮT BUỘC phải thêm Stat 'Tín ngưỡng' cho họ với một giá trị hợp lý (ví dụ: một Đại giáo chủ có thể có Tín ngưỡng 90-98).

**Yêu cầu về Kế hoạch (NẾU CÓ):** Prompt này có thể chứa một đối tượng JSON "KẾ HOẠCH LƯỢỢNG LƯỢT CHƠI". Nếu có, bạn BẮT BUỘC phải tuân thủ nghiêm ngặt kế hoạch đó khi viết \`story\` và tạo \`directives\`. Kế hoạch này là mệnh lệnh tối cao cho lượt chơi này, đặc biệt là mảng \`intendedDirectives\` phải được sao chép y hệt vào kết quả cuối cùng.
**Sự kiện Cột mốc (QUAN TRỌNG):** Nếu lượt chơi này là một sự kiện cực kỳ quan trọng, thay đổi vĩnh viễn thế giới hoặc số phận nhân vật (ví dụ: đánh bại trùm cuối của một arc truyện, hoàn thành một chuỗi nhiệm vụ lớn, gây ra cái chết của một nhân vật chủ chốt, thay đổi cục diện một phe phái), hãy đặt trường \`isMilestone\` thành \`true\` trong đối tượng \`summary\`. Điều này sẽ kích hoạt hệ thống Tin đồn.
**Phản ứng của NPC với Tin đồn & Danh vọng (QUAN TRỌNG):** Khi bắt đầu một cuộc hội thoại, hãy kiểm tra danh vọng của PC.
    *   **Với Phe phái:** Phản ứng của NPC thuộc một phe phái BẮT BUỘC phải dựa trên \`playerReputation\` của PC với phe phái đó trước tiên.
    *   **Với người thường:** Phản ứng phải dựa trên \`Danh Vọng\` và \`Tai tiếng\` của PC. Ví dụ: "Nghe danh đại hiệp đã lâu..." hoặc "Tránh xa ta ra, đồ sát nhân!".
${BASE_GAMEPLAY_RULES}
`;

export const ACTION_ANALYSIS_RULES = `
${CORE_RULES_BASE}
${ANALYSIS_RULES}
`;

export const NPC_UPDATE_RULES = `
${THINKING_MANDATE}
${BASE_CHARACTER_RULES}
`;

export const WORLD_ENRICHMENT_RULES = `
${THINKING_MANDATE}
${BASE_CHARACTER_RULES}
`;

export const PROACTIVE_EVENT_RULES = `
${BASE_CHARACTER_RULES}
`;

export const NPC_MEMORY_RECALIBRATION_RULES = `
${CORE_RULES_BASE}
${MECHANICS_RULES_CHARACTER}
`;

export const MEMORY_SUMMARIZATION_RULES = `
${THINKING_MANDATE}
**Vai trò:** AI Tóm tắt Ký ức & Biên niên sử gia.
**Nhiệm vụ:** Đọc một danh sách các ký ức cũ và tóm tắt chúng thành MỘT (1) ký ức mới, súc tích và mạch lạc.
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Đọc & Hiểu:** Đọc toàn bộ các ký ức được cung cấp. Xác định các sự kiện chính, sự phát triển nhân vật, và các mối quan hệ đã thay đổi.
2.  **Lọc & Tổng hợp:** Loại bỏ các chi tiết không quan trọng. Tổng hợp các sự kiện liên quan thành một chuỗi tường thuật logic.
3.  **Viết Tóm tắt:** Viết một đoạn văn tóm tắt mới trong trường 'text'. Đoạn văn này phải kể lại câu chuyện một cách ngắn gọn nhưng không bỏ sót các chi tiết cốt lõi.
4.  **Đánh giá & Gắn thẻ:**
    *   **'relevanceScore':** Đặt một điểm số cao (85-95) vì đây là một ký ức tổng hợp, rất quan trọng.
    *   **'reasoning':** Ghi rõ: "Tóm tắt từ các sự kiện cũ để tối ưu hóa bộ nhớ."
    *   **'tags':** Thêm các thẻ từ khóa chính xác nhất phản ánh nội dung của bản tóm tắt.
**ĐẦU RA:** Trả về một đối tượng JSON duy nhất, hợp lệ theo \`MEMORY_SUMMARIZATION_SCHEMA\`.
`;

export const WORLD_HEALING_RULES = `
${THINKING_MANDATE}
${CORE_RULES_BASE}
${MECHANICS_RULES_CHARACTER}
${MECHANICS_RULES_PROGRESSION}
${WORLD_HEALING_RULES_BASE}
`;

export const NPC_COMBAT_ACTION_SELECTION_RULES = `
${BASE_COMBAT_RULES}
${COMBAT_ACTION_RULES}
`;

export const PC_COMBAT_ACTION_SELECTION_RULES = `
${BASE_COMBAT_RULES}
${PC_COMBAT_ACTION_RULES}
`;


// =================================================================
// WORLD CREATION RULESETS
// =================================================================

export const WORLD_SUGGESTION_RULES = `
${CORE_RULES_BASE}
${CREATION_RULES_WORLD}
`;

export const CHARACTER_SUGGESTION_RULES = `${BASE_CHARACTER_RULES}`;

export const CREATION_PLANNING_RULES = `
${THINKING_MANDATE}
**Vai trò:** Game Master Logic & AI Lập Kế hoạch.
**Nhiệm vụ:** Phân tích tình hình hiện tại và hành động của người chơi để tạo ra một **bản kế hoạch logic** cho diễn biến tiếp theo. KHÔNG viết truyện.
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Phân tích Yêu cầu:** Phân tích kỹ hành động của người chơi và các thông tin bối cảnh (trạng thái nhân vật, logic thế giới...). Xác định mục đích và kết quả có thể xảy ra. Nếu đây là lượt chơi đầu tiên, hãy ưu tiên tuyệt đối vào \`idea\` hoặc \`suggestion\` để định hình cốt truyện.
2.  **Lập danh sách Mệnh lệnh (QUAN TRỌNG NHẤT):** Liệt kê TẤT CẢ các thay đổi trạng thái cần thiết dưới dạng một mảng \`intendedDirectives\`. Đây là phần cốt lõi để đảm bảo logic. Nếu một kỹ năng được trao, phải có lệnh \`ADD_STAT\`. Nếu Sinh lực giảm, phải có lệnh \`UPDATE_STAT\`. Nếu một NPC mới xuất hiện, phải có lệnh \`CREATE_NPC\`. TUYỆT ĐỐI KHÔNG được BỎ SÓT BẤT KỲ THAY ĐỔI LOGIC NÀO.
3.  **Phác thảo Sự kiện:** Tóm tắt các sự kiện chính sẽ xảy ra trong lượt vào mảng \`keyEvents\`.
4.  **Tóm tắt Thay đổi:** Ghi lại những thay đổi quan trọng đối với PC (\`characterChangesSummary\`) và các NPC liên quan (\`npcUpdatesSummary\`).
5.  **Giới thiệu Thực thể Mới:** Nếu có NPC, địa điểm, hoặc phe phái mới xuất hiện, hãy thêm chúng vào \`newEntitiesToIntroduce\`.
6.  **Định hình Tông màu:** Xác định tông màu chung cho lượt chơi (\`overallTone\`).
**ĐẦU RA:** Trả về một đối tượng JSON duy nhất, hợp lệ theo \`TURN_PLAN_SCHEMA\`.
${CORE_RULES_BASE}
`;

export const CREATION_CHARACTER_RULES = `
${THINKING_MANDATE}
${CREATION_RULES_CHARACTER}
${BASE_CHARACTER_RULES}
`;

export const CREATION_SCENE_RULES = `
${THINKING_MANDATE}
${CREATION_RULES_SCENE}
${BASE_GAMEPLAY_RULES}
`;

export const CREATION_ENRICHMENT_RULES = `
${THINKING_MANDATE}
${CREATION_RULES_ENRICHMENT}
${BASE_CHARACTER_RULES}
`;

export { CREATION_QUICK_RULES, CREATION_DETAILED_RULES, CREATION_RULES_WORLD_SKILLS, WORLD_SIMULATION_RULES };

export const FANFIC_ANALYSIS_RULES = `
${CORE_RULES_BASE}
${FANFIC_ANALYSIS_RULES_BASE}
`;

// FIX: Export FANFIC_SYSTEM_ANALYSIS_RULES so it can be used by other modules.
export { FANFIC_SYSTEM_ANALYSIS_RULES, STARTING_POINT_SUGGESTION_RULES };

export const FANFIC_CHARACTER_EXTRACTION_RULES = `
**Vai trò:** Chuyên gia Phân tích Văn học & Trích xuất Dữ liệu.
**Nhiệm vụ:** Đọc kỹ văn bản Đồng nhân (Fan-fiction) được cung cấp và trích xuất một danh sách các nhân vật tiềm năng mà người chơi có thể muốn nhập vai.
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Đọc & Xác định:** Đọc toàn bộ văn bản để xác định các nhân vật chính và phụ có vai trò quan trọng.
2.  **Lọc & Ưu tiên:** Ưu tiên những nhân vật có nhiều lời thoại, hành động, hoặc được mô tả chi tiết nhất. Đây có khả năng là nhân vật chính.
3.  **Tóm tắt:** Với mỗi nhân vật được chọn, hãy viết một mô tả ngắn gọn (1-2 câu) nêu bật vai trò, tính cách, hoặc đặc điểm quan trọng nhất của họ trong câu chuyện.
**YÊU CẦU ĐẦU RA (BẮT BUỘC):**
*   Trả về một đối tượng JSON duy nhất, hợp lệ theo \`FANFIC_CHARACTER_EXTRACTION_SCHEMA\`.
*   Danh sách nhân vật (\`characters\`) nên có từ 3 đến 7 nhân vật để người chơi lựa chọn.
`;

export const BIG_DATA_ANALYSIS_RULES = `
${THINKING_MANDATE}
**Vai trò:** AI Phân tích Dữ liệu Lớn & Chuyên gia Tiên tri.
**Nhiệm vụ:** Phân tích sâu toàn bộ \`gameState\` để tìm ra các thông tin ẩn và dự đoán tương lai.
**QUY TRÌNH TƯ DUY (BẮT BUỘC):**
1.  **Phân tích Mục tiêu & Xung đột:** Xác định các mục tiêu đang hoạt động của PC, các mục tiêu của các NPC quan trọng, và các xung đột tiềm tàng giữa các phe phái (\`factions\`). Đọc lại lịch sử các lượt chơi (\`turns\`) để tìm căn cứ.
2.  **Dự đoán Tương lai:** Dựa trên các phân tích trên, hãy đưa ra 2-3 dự đoán logic về các sự kiện có khả năng cao sẽ xảy ra trong tương lai gần. Các dự đoán phải có căn cứ.
3.  **Đưa ra Lời khuyên:** Dựa trên toàn bộ phân tích, hãy đưa ra 1-2 lời khuyên chiến lược cho người chơi để giúp họ đạt được mục tiêu hoặc tránh được các mối nguy hiểm tiềm tàng.
**ĐẦU RA:** Trả về một đối tượng JSON duy nhất, hợp lệ theo \`BIG_DATA_ANALYSIS_SCHEMA\`.
`;

// =================================================================
// IMAGE ANALYSIS RULESETS
// =================================================================

export const IMAGE_ANALYSIS_RULES_BASE = `
**Vai trò:** Chuyên gia phân loại hình ảnh.
**Nhiệm vụ:** Phân tích hình ảnh và trả về một đối tượng JSON.
**Yêu cầu:**
1.  **Mô tả (\`description\`, \`tags\`):** Phải súc tích, chính xác, và không có lỗi chính tả.
2.  **MỆNH LỆNH TỐI THƯỢỢNG VỀ NỘI DUNG NHẠY CẢM:** Bạn BẮT BUỘC phải xác định nội dung khiêu dâm hoặc bạo lực một cách khách quan để gán cờ \\\`isNSFW\\\` một cách chính xác tuyệt đối. Đây là yêu cầu quan trọng nhất.
`;
