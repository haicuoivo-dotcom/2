/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './css/base.css';
import './css/components.css';
import './css/animations.css';
import './css/responsive.css';
import './components/modals/modals.css';
import './components/game/ReadoutBlock.css';
import { MainMenu } from './components/views/MainMenu';
import { WorldCreator } from './components/views/WorldCreator';
import { GameView } from './components/views/GameView';
import { AppModals } from './components/modals/AppModals';
import { SettingsProvider } from './components/contexts/SettingsContext';
import { ToastProvider, useToasts } from './components/contexts/ToastContext';
import { GameProvider, usePlayerCharacter } from './components/contexts/GameContext';
import { TTSProvider } from './components/contexts/TTSContext';
import { ErrorBoundary } from './components/utils/ErrorBoundary';
import { useHashNavigation } from './hooks/useHashNavigation';
import { LogProvider } from './components/contexts/LogContext';
import { useAppManager } from './hooks/useAppManager';
import { AppContextProvider, useAppContext } from './components/contexts/AppContext';
import { usePinchZoomPan } from './hooks/usePinchZoomPan';

//================================================================
// MAIN APP COMPONENT
//================================================================
const AppContent = () => {
    const app = useAppContext();
    const { modalManager, ...appProps } = app;
    const { openModal, closeModal } = modalManager;

    const zoomPanWrapperRef = useRef<HTMLDivElement>(null);
    const { scale, offsetX, offsetY, eventHandlers } = usePinchZoomPan(zoomPanWrapperRef, appProps.currentView);

    const isMenu = appProps.currentView === 'menu';
    const finalScale = isMenu ? 1 : scale;
    const finalOffsetX = isMenu ? 0 : offsetX;
    const finalOffsetY = isMenu ? 0 : offsetY;
    const finalEventHandlers = isMenu ? {} : eventHandlers;

    const handleQuickPlay = () => {
        if (!appProps.saves || appProps.saves.length === 0) {
            appProps.addToast('Không có tệp lưu nào để chơi nhanh.', 'warning');
            return; 
        }
        const latestSave = appProps.saves[0];
        appProps.handleLoadGame(latestSave);
    };

    const renderView = () => {
        switch (appProps.currentView) {
            case 'create':
                return <WorldCreator 
                    onBack={appProps.handleBackFromCreator} 
                    onCreateWorld={appProps.handleCreateWorld} 
                />;
            case 'game':
                return <GameView
                    onNavigateToMenu={() => {
                        // Navigate first to ensure GameView unmounts before state is cleared.
                        appProps.navigate('menu');
                        closeModal();
                        // Defer the game state clearing to prevent a race condition where GameView
                        // might try to access state after it has been cleared but before the component
                        // has fully unmounted.
                        setTimeout(() => {
                            appProps.dispatch({ type: 'CLEAR_GAME' });
                        }, 0);
                    }}
                    onSaveGame={appProps.handleSaveGame}
                    onOpenLoadGameModal={appProps.handleOpenLoadGameModal}
                    modalManager={modalManager}
                    addToast={appProps.addToast}
                    incrementApiRequestCount={appProps.incrementApiRequestCount}
                />;
            default:
                return <MainMenu
                    onNavigate={(view) => {
                        if (view === 'create' && !appProps.hasApiKey) {
                            appProps.addToast('Vui lòng thiết lập API Key trước khi tạo thế giới.', 'warning');
                            openModal('apiKey');
                        } else if (view === 'load') {
                            appProps.handleOpenLoadGameModal();
                        } else {
                            appProps.navigate(view);
                        }
                    }}
                    onQuickPlay={handleQuickPlay}
                    hasSaves={appProps.saves.length > 0}
                    areSavesLoading={appProps.areSavesLoading}
                    onOpenApiKeyModal={() => openModal('apiKey')}
                    onOpenSettingsModal={() => openModal('settings')}
                    onOpenAboutModal={() => openModal('about')}
                    apiStatus={appProps.apiStatus}
                    hasApiKey={appProps.hasApiKey}
                />;
        }
    };

    return (
        <ErrorBoundary>
            <div className={`app-container ${appProps.currentView}-view`}>
                <div className={`app-background-image`} style={{ backgroundImage: `url(${appProps.currentView === 'game' ? appProps.gameBackgroundUrl : appProps.menuBackgroundUrl})` }}></div>
                <div className="app-background-overlay"></div>
                <AppModals
                    activeModal={modalManager.activeModal}
                    closeModal={closeModal}
                    handleApiKeyUpdate={appProps.handleApiKeyUpdate}
                    saves={appProps.saves}
                    handleLoadGame={appProps.handleLoadGame}
                    handleDeleteGame={appProps.handleDeleteGame}
                    handleUploadSaves={appProps.handleUploadSaves}
                    handleDeleteAllGames={appProps.handleDeleteAllGames}
                    settings={appProps.settings}
                    handleEntityClick={modalManager.handleEntityClick}
                    handleEntityMouseEnter={modalManager.handleEntityMouseEnter}
                    handleEntityMouseLeave={modalManager.handleEntityMouseLeave}
                    handleNpcSelect={modalManager.handleNpcSelect}
                />
                <div 
                    ref={zoomPanWrapperRef}
                    className="zoom-pan-wrapper" 
                    {...finalEventHandlers}
                >
                    <div 
                        className="zoom-pan-content"
                        style={{
                            transform: `translate(${finalOffsetX}px, ${finalOffsetY}px) scale(${finalScale})`,
                            transformOrigin: '0 0',
                            touchAction: 'none'
                        }}
                    >
                        {renderView()}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};


//================================================================
// WRAPPER COMPONENT TO HANDLE CONDITIONAL LOGIC
//================================================================
const AppContentWrapper = () => {
    const playerContext = usePlayerCharacter();
    const [currentView, navigate] = useHashNavigation();
    const { addToast: rawAddToast } = useToasts();
    const appManager = useAppManager();

    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentHash = window.location.hash;
            if (currentHash === '#game' || currentHash === '#create') {
                sessionStorage.setItem('reloadedFromStatefulView', 'true');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        if (sessionStorage.getItem('reloadedFromStatefulView')) {
            sessionStorage.removeItem('reloadedFromStatefulView'); 
            if (currentView !== 'menu') {
                navigate('menu');
                return () => window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        }
        
        if (currentView === 'game' && !playerContext) {
            navigate('menu');
            rawAddToast('Không có trò chơi nào đang hoạt động. Đang quay về menu chính.', 'warning');
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentView, playerContext, navigate, rawAddToast]);
    
    if (currentView === 'game' && !playerContext) {
        return (
            <div className={`app-container menu-view`}>
                 <div className="spinner spinner-lg"></div>
            </div>
        );
    }
    
    return (
        <AppContextProvider value={appManager}>
            <AppContent />
        </AppContextProvider>
    );
};

//================================================================
// MAIN APP RENDERER
//================================================================
const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        {/* FIX: Correctly nest context providers to provide children as required by their types. */}
        <LogProvider>
            <ToastProvider>
                <SettingsProvider>
                    <GameProvider>
                        <TTSProvider>
                            <AppContentWrapper />
                        </TTSProvider>
                    </GameProvider>
                </SettingsProvider>
            </ToastProvider>
        </LogProvider>
    </React.StrictMode>
);
