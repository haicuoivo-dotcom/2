/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './PreEventModal.css';

interface PreEventModalProps {
    type: 'combat' | 'auction';
    onConfirm: () => void;
    onCancel: () => void;
    opponentNames?: string[];
}

const UnmemoizedPreEventModal = ({ type, onConfirm, onCancel, opponentNames }: PreEventModalProps) => {
    const isCombat = type === 'combat';
    const title = isCombat ? '⚔️ Trận chiến sắp nổ ra! ⚔️' : '⚖️ Phiên đấu giá sắp bắt đầu! ⚖️';
    
    let description = isCombat 
        ? "Diễn biến hiện tại cho thấy một cuộc đối đầu sắp xảy ra. Bạn có muốn bắt đầu chiến đấu không?"
        : "Một phiên đấu giá sắp được tổ chức. Bạn có muốn tham gia không?";

    if (isCombat && opponentNames && opponentNames.length > 0) {
        description = `Diễn biến hiện tại cho thấy một cuộc đối đầu với ${opponentNames.join(', ')} sắp xảy ra. Bạn có muốn bắt đầu chiến đấu không?`;
    }

    const confirmText = isCombat ? "Bắt đầu Chiến đấu" : "Bắt đầu Đấu giá";

    return (
        <div className="modal-overlay pre-event-overlay">
            <div className="modal-content pre-event-modal">
                <header className="modal-header" style={{ justifyContent: 'center' }}>
                    <h3>{title}</h3>
                </header>
                <div className="modal-body">
                    <p className="pre-event-description">{description}</p>
                </div>
                <footer className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="confirmation-button cancel" onClick={onCancel}>
                        Bỏ Qua
                    </button>
                    <button className="confirmation-button confirm-danger" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export const PreEventModal = React.memo(UnmemoizedPreEventModal);
