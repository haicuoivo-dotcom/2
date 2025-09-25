/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { PersonalityTrait } from '../types';

export const PERSONALITY_TRAITS_LIBRARY: Record<string, PersonalityTrait[]> = {
    'Big Five (OCEAN)': [
        { id: 'trait_creative', name: 'Sáng tạo', description: 'Có trí tưởng tượng phong phú, thích những ý tưởng mới và nghệ thuật.', tags: ['openness', 'positive', 'cognitive'] },
        { id: 'trait_curious', name: 'Tò mò', description: 'Thích khám phá, học hỏi những điều mới và đặt câu hỏi.', tags: ['openness', 'positive', 'cognitive'] },
        { id: 'trait_organized', name: 'Có tổ chức', description: 'Làm việc có kế hoạch, ngăn nắp và chú ý đến chi tiết.', tags: ['conscientiousness', 'positive', 'behavioral'] },
        { id: 'trait_disciplined', name: 'Kỷ luật', description: 'Có khả năng tự kiểm soát, hoàn thành nhiệm vụ và tuân thủ quy tắc.', tags: ['conscientiousness', 'positive', 'behavioral'] },
        { id: 'trait_reliable', name: 'Đáng tin cậy', description: 'Luôn giữ lời hứa và có thể tin tưởng để giao phó công việc.', tags: ['conscientiousness', 'positive', 'social'] },
        { id: 'trait_sociable', name: 'Hòa đồng', description: 'Thích giao tiếp, năng động trong các hoạt động xã hội và dễ dàng kết bạn.', tags: ['extraversion', 'positive', 'social'] },
        { id: 'trait_energetic', name: 'Năng động', description: 'Tràn đầy năng lượng, nhiệt huyết và luôn sẵn sàng hành động.', tags: ['extraversion', 'positive', 'behavioral'] },
        { id: 'trait_kind', name: 'Tốt bụng', description: 'Thân thiện, đồng cảm và luôn sẵn lòng giúp đỡ người khác.', tags: ['agreeableness', 'positive', 'social'] },
        { id: 'trait_cooperative', name: 'Hợp tác', description: 'Dễ dàng làm việc nhóm và sẵn sàng thỏa hiệp vì mục tiêu chung.', tags: ['agreeableness', 'positive', 'social'] },
        { id: 'trait_anxious', name: 'Lo lắng', description: 'Thường cảm thấy căng thẳng, lo âu và không an toàn.', tags: ['neuroticism', 'negative', 'emotional'] },
        { id: 'trait_sensitive', name: 'Nhạy cảm', description: 'Dễ bị ảnh hưởng bởi cảm xúc và các yếu tố bên ngoài.', tags: ['neuroticism', 'neutral', 'emotional'] },
    ],
    'DISC': [
        { id: 'trait_decisive', name: 'Quyết đoán', description: 'Nhanh chóng đưa ra quyết định và hành động một cách dứt khoát.', tags: ['dominance', 'positive', 'behavioral'] },
        { id: 'trait_confident', name: 'Tự tin', description: 'Tin tưởng vào khả năng của bản thân và không ngần ngại thể hiện điều đó.', tags: ['dominance', 'positive', 'emotional'] },
        { id: 'trait_persuasive', name: 'Thuyết phục', description: 'Có khả năng dùng lời lẽ để tác động và thuyết phục người khác.', tags: ['influence', 'positive', 'social'] },
        { id: 'trait_enthusiastic', name: 'Nhiệt tình', description: 'Luôn thể hiện sự hăng hái và lạc quan trong mọi việc.', tags: ['influence', 'positive', 'emotional'] },
        { id: 'trait_patient', name: 'Kiên nhẫn', description: 'Có thể chờ đợi và đối mặt với khó khăn mà không nản lòng.', tags: ['steadiness', 'positive', 'behavioral'] },
        { id: 'trait_calm', name: 'Bình tĩnh', description: 'Giữ được sự điềm tĩnh và sáng suốt ngay cả trong những tình huống căng thẳng.', tags: ['steadiness', 'positive', 'emotional'] },
        { id: 'trait_precise', name: 'Chính xác', description: 'Cẩn thận, tỉ mỉ và luôn yêu cầu sự chính xác trong công việc.', tags: ['conscientiousness', 'neutral', 'behavioral'] },
        { id: 'trait_logical', name: 'Logic', description: 'Suy nghĩ dựa trên lý trí, dữ liệu và các quy tắc logic.', tags: ['conscientiousness', 'neutral', 'cognitive'] },
    ],
    'Phổ biến khác': [
        { id: 'trait_introverted', name: 'Hướng nội', description: 'Thích sự yên tĩnh, không gian riêng và các mối quan hệ sâu sắc nhưng ít ỏi.', tags: ['introversion', 'neutral', 'social'] },
        { id: 'trait_rational', name: 'Lý trí', description: 'Luôn đặt lý trí lên trên cảm xúc khi đưa ra quyết định.', tags: ['cognitive', 'neutral'] },
        { id: 'trait_pragmatic', name: 'Thực tế', description: 'Tập trung vào những gì thực tế và có thể làm được, thay vì những ý tưởng viển vông.', tags: ['cognitive', 'neutral'] },
        { id: 'trait_optimistic', name: 'Lạc quan', description: 'Luôn nhìn thấy mặt tích cực của vấn đề và tin tưởng vào tương lai.', tags: ['emotional', 'positive'] },
        { id: 'trait_serious', name: 'Nghiêm túc', description: 'Có thái độ nghiêm túc và tập trung trong công việc và cuộc sống.', tags: ['behavioral', 'neutral'] },
        { id: 'trait_cautious', name: 'Thận trọng', description: 'Luôn suy nghĩ kỹ lưỡng về rủi ro trước khi hành động.', tags: ['behavioral', 'neutral'] },
        { id: 'trait_brave', name: 'Dũng cảm', description: 'Sẵn sàng đối mặt với nguy hiểm và thử thách.', tags: ['behavioral', 'positive'] },
        { id: 'trait_honest', name: 'Trung thực', description: 'Luôn nói sự thật và hành động ngay thẳng.', tags: ['social', 'positive'] },
        { id: 'trait_humble', name: 'Giản dị', description: 'Khiêm tốn, không khoe khoang về bản thân.', tags: ['social', 'positive'] },
        { id: 'trait_humorous', name: 'Hài hước', description: 'Thích đùa và có khả năng làm người khác cười.', tags: ['social', 'positive'] },
        { id: 'trait_arrogant', name: 'Kiêu ngạo', description: 'Tự cho mình là hơn người và thường coi thường người khác.', tags: ['social', 'negative'] },
        { id: 'trait_ambitious', name: 'Tham vọng', description: 'Luôn có mục tiêu lớn và nỗ lực hết mình để đạt được nó.', tags: ['behavioral', 'neutral'] },
        { id: 'trait_selfish', name: 'Ích kỷ', description: 'Luôn đặt lợi ích của bản thân lên trên hết.', tags: ['social', 'negative'] },
        { id: 'trait_shy', name: 'Nhút nhát', description: 'Ngại ngùng, rụt rè khi tiếp xúc với người lạ.', tags: ['social', 'negative'] },
        { id: 'trait_conservative', name: 'Bảo thủ', description: 'Ngại thay đổi và có xu hướng giữ gìn các giá trị truyền thống.', tags: ['cognitive', 'neutral'] },
        { id: 'trait_strict', name: 'Khó tính', description: 'Yêu cầu cao ở bản thân và người khác, ít khi hài lòng.', tags: ['social', 'negative'] },
        { id: 'trait_hot_headed', name: 'Nóng nảy', description: 'Dễ tức giận và hành động thiếu suy nghĩ khi bị kích động.', tags: ['emotional', 'negative'] },
        { id: 'trait_altruistic', name: 'Vị tha', description: 'Luôn quan tâm và sẵn sàng hy sinh vì lợi ích của người khác.', tags: ['social', 'positive'] },
        { id: 'trait_cold', name: 'Lạnh lùng', description: 'Ít biểu lộ cảm xúc, có vẻ xa cách và khó gần.', tags: ['emotional', 'neutral', 'social'] },
        { id: 'trait_lewd', name: 'Dâm đãng', description: 'Có ham muốn tình dục cao và không ngần ngại thể hiện điều đó.', tags: ['sexual', 'neutral', '18+'] },
        { id: 'trait_sadistic', name: 'Bạo dâm', description: 'Tìm thấy khoái cảm trong việc gây đau đớn (thể xác hoặc tinh thần) cho người khác.', tags: ['sexual', 'negative', '18+'] },
        { id: 'trait_masochistic', name: 'Khổ dâm', description: 'Tìm thấy khoái cảm khi nhận lấy sự đau đớn (thể xác hoặc tinh thần).', tags: ['sexual', 'negative', '18+'] },
    ]
};
