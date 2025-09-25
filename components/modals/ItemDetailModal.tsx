/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import type { Stat, GalleryImage } from '../../types';
import './ItemDetailModal.css';
import { AvatarEditModal } from './AvatarEditModal';
import { useToasts } from '../contexts/ToastContext';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';
import { useGameContext } from '../contexts/GameContext';
import { ConfirmationModal } from './ConfirmationModal';
import { formatCurrency, getRarityClass } from '../../utils/game';
import { BASE_ITEM_TEMPLATES } from '../../constants/items';
import { ItemIcon } from '../ui/ItemIcon';

interface ItemDetailModalProps {
    item: Stat;
    onClose: () => void;
    // FIX: Changed type from `void` to `Promise<void> | void` to allow async handlers.
    onUse?: () => void | Promise<void>;
    onEdit: () => void;
    onUpdate: (updates: Partial<Stat> | { stats: Stat[] }) => void; // Modified to accept full stats array
    onRemove: () => void;
    enableCheats: boolean;
    isPlayerCharacter: boolean;
    isEquipped: boolean;
    onEquip: () => void;
    onUnequip: () => void;
    equippedSetCount: number;
    // FIX: Add missing prop for API request counting.
    incrementApiRequestCount: () => void;
}

export const ItemDetailModal = ({
    item, onClose, onUse, onEdit, onUpdate, onRemove, enableCheats, isPlayerCharacter, isEquipped, onEquip, onUnequip, equippedSetCount, incrementApiRequestCount
}: ItemDetailModalProps) => {
    const { gameState, worldSettings } = useGameContext();
    const [isImageEditOpen, setIsImageEditOpen] = useState(false);
    const { addToast } = useToasts();
    const [showConfirm, setShowConfirm] = useState(false);

    const relatedRecipes = useMemo(() => {
        if (item.category !== 'Nguyên liệu') {
            return [];
        }
        const allRecipes = gameState.character.stats?.filter(
            s => s.category === 'Sơ Đồ Chế Tạo' && s.recipeData
        ) || [];

        return allRecipes.filter(recipe => 
            recipe.recipeData!.ingredients.some(ing => ing.name === item.name)
        );
    }, [item, gameState.character.stats]);

    const handleImageSave = async (newUrl: string) => {
        onUpdate({ imageUrl: newUrl });
        
        try {
            const newImage: GalleryImage = {
                id: generateUniqueId('gallery-item'),
                name: item.name,
                dataUrl: newUrl,
                description: `Ảnh cho vật phẩm: ${item.name}`,
                type: 'item',
            };
            await db.addOrUpdateImage(newImage);
            addToast("Đã lưu ảnh vật phẩm vào thư viện.", "success");
        } catch (error) {
            console.error("Failed to save item image to gallery:", error);
            addToast("Không thể lưu ảnh vật phẩm vào thư viện.", "error");
        }
        
        setIsImageEditOpen(false);
        addToast("Đã cập nhật ảnh vật phẩm.", "success");
    };

    const handleSplit = () => {
        const currentQuantity = item.quantity || 1;
        if (currentQuantity <= 1) {
            addToast("Không thể tách vật phẩm có số lượng là 1.", "warning");
            return;
        }

        const amountToSplit = parseInt(prompt(`Bạn muốn tách bao nhiêu? (Tối đa ${currentQuantity - 1})`, "1") || "0", 10);

        if (isNaN(amountToSplit) || amountToSplit <= 0 || amountToSplit >= currentQuantity) {
            addToast("Số lượng không hợp lệ.", "error");
            return;
        }

        const newStats = [...gameState.character.stats];
        const sourceItemIndex = newStats.findIndex(i => i.id === item.id);
        
        if (sourceItemIndex === -1) {
            addToast("Lỗi: Không tìm thấy vật phẩm gốc.", "error");
            return;
        }

        // Update original stack
        newStats[sourceItemIndex] = {
            ...newStats[sourceItemIndex],
            quantity: currentQuantity - amountToSplit,
        };

        // Create new stack
        const newStack: Stat = {
            ...newStats[sourceItemIndex],
            id: generateUniqueId('item-split'),
            quantity: amountToSplit,
        };
        newStats.push(newStack);

        onUpdate({ stats: newStats });
        addToast(`Đã tách ra ${amountToSplit} ${item.name}.`, 'success');
        onClose(); // Close modal after action
    };
    
    const confirmActionText = enableCheats ? 'Xóa' : 'Vứt Bỏ';
    const confirmMessage = (
        <span>
            Bạn có chắc chắn muốn {confirmActionText.toLowerCase()} vật phẩm <strong>"{item.name}"</strong> không? Hành động này không thể hoàn tác.
        </span>
    );
    
    const isEquipment = item.slot && item.slot !== 'Không có';
    const rarityClass = getRarityClass(item.rarity);
    
    return (
        <>
            {isImageEditOpen && (
                <AvatarEditModal
                    item={item}
                    onClose={() => setIsImageEditOpen(false)}
                    onSave={handleImageSave}
                    addToast={addToast}
                    incrementApiRequestCount={incrementApiRequestCount}
                />
            )}
            {showConfirm && (
                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={onRemove}
                    title={`Xác nhận ${confirmActionText}`}
                    message={confirmMessage}
                    confirmText={confirmActionText}
                />
            )}
            <div className="modal-overlay item-detail-overlay" onClick={onClose}>
                <div className={`modal-content item-detail-modal ${rarityClass}`} onClick={e => e.stopPropagation()}>
                    <header className="item-detail-header">
                        <div 
                            className="item-image-box"
                            onClick={() => setIsImageEditOpen(true)}
                            title="Chỉnh sửa ảnh vật phẩm"
                        >
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} />
                            ) : (
                                <div className="item-image-placeholder">
                                    <ItemIcon item={item} />
                                    <div className="add-image-overlay">
                                        <span>📷</span>
                                        <small>Thêm ảnh</small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="item-header-title">
                            <h3 className={rarityClass}>{item.name}{item.quantity && item.quantity > 1 && ` (x${item.quantity})`}</h3>
                            <div className="item-header-meta">
                                {item.rarity && <span className={`info-tag generic-tag ${rarityClass}`}>{item.rarity}</span>}
                                {isEquipment && (
                                    <span className="info-tag slot-tag">{item.slot}</span>
                                )}
                                {item.tags?.map(tag => (
                                    <span key={tag} className="info-tag generic-tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                    </header>
                    <div className="modal-body item-detail-body">
                        <p className="item-description">{item.description}</p>
                        
                        <hr className="item-divider" />
                        
                        {typeof item.price === 'number' && (
                            <div className="item-info-section item-price-section">
                                <h4>Giá trị</h4>
                                <div className="price-value">
                                    <span>{formatCurrency(item.price * (item.quantity || 1), worldSettings.genre, worldSettings.setting)}</span>
                                    {item.quantity && item.quantity > 1 && <small>({formatCurrency(item.price, worldSettings.genre, worldSettings.setting)} / mỗi cái)</small>}
                                </div>
                            </div>
                        )}
                        
                        {item.effects && item.effects.length > 0 && (
                            <div className="item-info-section">
                                <h4>Thuộc tính & Hiệu ứng</h4>
                                <ul className="item-effects-list">
                                    {item.effects.map((effect, index) => (
                                        <li key={index} className="effect-line">
                                            <span>{effect.targetStat}</span>
                                            <span className={`effect-modifier ${effect.modifier.includes('+') ? 'positive' : 'negative'}`}>
                                                {effect.modifier}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {item.setName && item.setBonuses && (
                            <div className="item-info-section">
                                <h4>Set: {item.setName} ({equippedSetCount}/{item.setBonuses[item.setBonuses.length - 1].count})</h4>
                                <ul className="set-bonus-list">
                                    {item.setBonuses.map(bonus => (
                                        <li key={bonus.count} className={`set-bonus-item ${(equippedSetCount || 0) >= bonus.count ? 'active-bonus' : ''}`}>
                                            <strong>({bonus.count})</strong> {bonus.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {relatedRecipes.length > 0 && (
                            <div className="item-info-section">
                                <h4>Công thức liên quan</h4>
                                <ul className="related-recipes-list">
                                    {relatedRecipes.map(recipe => {
                                        if (!recipe.recipeData?.product) return null;
                                        const productTemplate = BASE_ITEM_TEMPLATES[recipe.recipeData.product];
                                        if (!productTemplate) return null;
                                        // FIX: Create a valid Stat object from the template for the ItemIcon component, which expects a Stat.
                                        // The ItemTemplate from BASE_ITEM_TEMPLATES is missing 'id' and 'description' properties.
                                        const productStatForIcon: Stat = {
                                            ...productTemplate,
                                            id: `temp-recipe-product-${recipe.id}`,
                                            description: productTemplate.baseDescription
                                        };
                                        return (
                                            <li key={recipe.id} className="related-recipe-item">
                                                <span className="recipe-name" title={recipe.description}>{recipe.name}</span>
                                                <div className="recipe-product-info">
                                                    <span>➔</span>
                                                    <div className="product-icon" title={productTemplate.baseDescription}>
                                                        <ItemIcon item={productStatForIcon} />
                                                    </div>
                                                    <span className={`product-name ${getRarityClass(productTemplate.rarity)}`}>{productTemplate.name}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <footer className="item-detail-footer">
                        {item.quantity && item.quantity > 1 && (
                            <button className="item-action-button" onClick={handleSplit}>Tách</button>
                        )}
                        {isEquipped ? (
                            <button className="item-action-button" onClick={onUnequip}>Tháo gỡ</button>
                        ) : (
                           item.slot && item.slot !== 'Không có' && <button className="item-action-button equip" onClick={onEquip}>Trang bị</button>
                        )}
                        {onUse && <button className="item-action-button use" onClick={onUse}>Sử dụng</button>}
                        {enableCheats && <button className="item-action-button" onClick={onEdit}>Sửa</button>}
                        {(isPlayerCharacter || enableCheats) && (
                            <button className="item-action-button remove" onClick={() => setShowConfirm(true)}>
                                {confirmActionText}
                            </button>
                        )}
                    </footer>
                </div>
            </div>
        </>
    );
};