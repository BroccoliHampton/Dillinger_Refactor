// ===========================================
// MAIN ENTRY POINT
// ===========================================

import { $ } from './utils.js';
import { GAME_CONFIG, MAP_DURATIONS } from './config.js';
import { GameState, MarketState, UIState } from './state.js';
import { AudioManager } from './audio.js';
import { UIRenderer } from './ui.js';
import { WarpMinigame } from './minigame.js';
import { EncounterManager } from './encounters.js';
import {
    initStarfield,
    initMapOverlay,
    initTitleStarfield,
    initSubstrateGauge,
    initAirstream,
    initAtomDecayEffect,
    initPhotonBurstsEffect,
    initializeActivityGauges,
    updateActivityGauges
} from './animations.js';

// ===========================================
// GAME INSTANCE
// ===========================================

class Game {
    constructor() {
        // State managers
        this.gameState = new GameState();
        this.marketState = new MarketState();
        this.uiState = new UIState();

        // Managers
        this.audioManager = new AudioManager();
        this.uiRenderer = new UIRenderer(this.gameState, this.marketState, this.uiState);
        this.warpMinigame = new WarpMinigame();
        this.encounterManager = new EncounterManager(
            this.gameState,
            this.uiState,
            this.audioManager,
            this.uiRenderer
        );

        // Interval IDs
        this.craftIntervalId = null;
        this.miningIntervalId = null;
        this.mapTimerIntervalId = null;

        // Farcaster SDK
        this.sdk = null;
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================

    async init() {
        // Import Farcaster SDK
        try {
            const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
            this.sdk = sdk;
            
            // Signal ready to Farcaster
            try {
                await sdk.actions.ready();
            } catch (e) {
                console.error("Farcaster initial ready signal failed:", e);
            }
        } catch (e) {
            console.log("Farcaster SDK not available");
        }

        // Initialize background starfield
        initStarfield();

        // Ensure initial UI state
        $('mint-overlay').classList.remove('hidden');
        $('loading-spinner').classList.add('hidden');
        $('game-container').classList.add('hidden');
        $('bottom-nav-bar').classList.add('hidden');
        $('game-header').classList.add('hidden');
        $('user-id-display').classList.add('hidden');

        // Bind all event listeners
        this.bindEventListeners();
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================

    bindEventListeners() {
        document.body.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            let action = button.id;
            if (button.dataset.action) {
                action = button.dataset.action;
            }

            await this.handleAction(action, button);
        });
    }

    async handleAction(action, button) {
        switch (action) {
            // Startup
            case 'mint-button':
                await this.handleMintAndStart();
                break;

            // Audio controls
            case 'mute-button':
            case 'mute-music-button':
                this.toggleMusicMute();
                break;
            case 'mute-sfx-button':
                this.toggleSfxMute();
                break;

            // Mode & Scanner
            case 'cycle-mode-button':
                this.cycleSystemMode();
                break;
            case 'toggle-scanner-btn':
                this.toggleScanner();
                break;

            // Crafting
            case 'craft-sail-button':
                await this.craftSolarSail();
                break;
            case 'craft-battery-button':
                await this.craftBattery();
                break;

            // Navigation
            case 'nav-vitals':
                this.showTab('vitals');
                break;
            case 'nav-map':
                this.showTab('map');
                break;
            case 'nav-engines':
                this.showTab('engines');
                break;
            case 'nav-action':
                this.showTab('action');
                break;
            case 'nav-briefing':
                this.showTab('briefing');
                break;

            // Encounters
            case 'encounter-risk-it':
                await this.handleEncounterDecision(true);
                break;
            case 'encounter-avoid':
                await this.handleEncounterDecision(false);
                break;
            case 'encounter-result-close':
                this.uiRenderer.hideEncounterResult();
                break;

            // Win/Game Over
            case 'next-map-button':
                await this.advanceToNextMap();
                break;
            case 'win-reset-button':
            case 'game-over-reset-button':
            case 'reset-confirm-button':
                await this.handleFullReset();
                break;

            // Reset
            case 'reset-prompt-button':
                await this.promptForReset();
                break;
            case 'reset-cancel-button':
                await this.cancelReset();
                break;

            // Blackhole
            case 'enter-blackhole-button':
                this.attemptEnterBlackhole();
                break;

            // Test buttons
            case 'test-lightyears-button':
                await this.mintTestLightyears();
                break;
            case 'test-encounter-button':
                await this.forceTriggerEncounter();
                break;
            case 'test-photons-button':
                await this.mintTestPhotons();
                break;

            // Dynamic actions
            case 'remove-module':
                await this.removeModule(parseInt(button.dataset.index, 10));
                break;
        }
    }

    // ===========================================
    // GAME START & RESET
    // ===========================================

    async handleMintAndStart() {
        $('mint-overlay').classList.add('hidden');
        this.uiRenderer.showLoading();
        $('game-header').classList.remove('hidden');

        await this.audioManager.initialize();

        // Farcaster user context
        if (this.sdk) {
            try {
                const isMiniApp = await this.sdk.isInMiniApp({ timeoutMs: 200 });
                if (isMiniApp) {
                    $('user-id-display').classList.remove('hidden');
                    const context = await this.sdk.context;
                    if (context.user) {
                        $('user-id-display').textContent = `FID: ${context.user.fid}`;
                    } else {
                        $('user-id-display').textContent = `Connected, no user`;
                    }
                }
            } catch (err) {
                console.error("Farcaster SDK Error:", err);
                $('user-id-display').textContent = `Error fetching Farcaster context`;
            }
        }

        setTimeout(() => {
            this.uiRenderer.hideLoading();
            this.uiRenderer.showGameContainer();

            this.gameState.reset();
            initializeActivityGauges();
            this.uiRenderer.render();
            this.startGameLoops();
            this.uiRenderer.setInitialScannerText();
            initSubstrateGauge();

            this.warpMinigame.init();

            this.showTab('vitals', false);
            this.setSystemMode(0, false);
        }, 1500);
    }

    async handleFullReset() {
        await this.audioManager.initialize();
        this.audioManager.playClick();

        this.gameState.reset();
        this.uiState.reset();
        this.uiState.craftCooldownTimer = 0;

        this.uiRenderer.hideWinScreen();
        this.uiRenderer.hideGameOver();
        this.uiRenderer.hideResetModal();

        this.stopGameLoops();
        this.startGameLoops();
        this.uiRenderer.render();
    }

    async promptForReset() {
        await this.audioManager.initialize();
        this.audioManager.playClick();
        this.uiRenderer.showResetModal();
    }

    async cancelReset() {
        await this.audioManager.initialize();
        this.audioManager.playClick();
        this.uiRenderer.hideResetModal();
    }

    async advanceToNextMap() {
        await this.audioManager.initialize();
        this.audioManager.playSuccess();

        this.gameState.advanceToNextMap();
        this.uiState.clearShipPositions();
        this.uiState.activeEncounter = null;

        this.uiRenderer.hideWinScreen();
        this.stopGameLoops();
        this.startGameLoops();
        this.uiRenderer.render();
    }

    // ===========================================
    // GAME LOOPS
    // ===========================================

    startGameLoops() {
        if (this.craftIntervalId) return;

        this.craftIntervalId = setInterval(() => this.handlePhotonsDrip(), GAME_CONFIG.PHOTONS_DRIP_INTERVAL);
        this.miningIntervalId = setInterval(() => this.handleMiningAndDecay(), GAME_CONFIG.MINING_INTERVAL);
        this.mapTimerIntervalId = setInterval(() => this.handleMapTimer(), 1000);
        
        setInterval(() => this.handleCraftCooldown(), 1000);
        setInterval(() => this.marketState.updateSunIntensity(), 3000);
        setInterval(() => this.marketState.updateSubstrateConductivity(), 3000);
        setInterval(() => updateActivityGauges(), 150);

        this.uiRenderer.addLog("The Outrider is powered up. System check nominal.", 'info');
    }

    stopGameLoops() {
        clearInterval(this.craftIntervalId);
        clearInterval(this.miningIntervalId);
        clearInterval(this.mapTimerIntervalId);
        this.craftIntervalId = null;
        this.miningIntervalId = null;
        this.mapTimerIntervalId = null;
    }

    handlePhotonsDrip() {
        if (!this.gameState) return;
        const totalPhotonGain = this.gameState.getTotalPhotonRate();
        if (totalPhotonGain > 0) {
            this.gameState.addPhotons(totalPhotonGain);
            this.uiRenderer.render();
        }
    }

    handleMiningAndDecay() {
        if (!this.gameState || this.gameState.hasWon) return;

        const { lyGain } = this.gameState.processMiningCycle((msg, type) => {
            this.uiRenderer.addLog(msg, type);
        });

        if (lyGain > 0) {
            const won = this.gameState.addLightyears(lyGain);
            if (won && !this.gameState.hasWon) {
                this.gameState.hasWon = true;
                this.uiRenderer.showWinScreen();
                this.stopGameLoops();
                this.audioManager.playSuccess();
            }
        }

        this.uiRenderer.render();
    }

    handleCraftCooldown() {
        if (this.uiState.craftCooldownTimer > 0) {
            this.uiState.craftCooldownTimer--;
        }
        this.uiRenderer.render();
    }

    handleMapTimer() {
        if (!this.gameState || this.gameState.hasWon) return;

        if (this.gameState.mapTimer > 0) {
            this.gameState.mapTimer--;
        }

        this.uiRenderer.render();

        if (this.gameState.mapTimer <= 0) {
            this.uiRenderer.showGameOver();
            this.stopGameLoops();
            this.audioManager.playError();
        }
    }

    // ===========================================
    // CRAFTING
    // ===========================================

    async craftSolarSail() {
        await this.audioManager.initialize();

        if (!this.gameState ||
            this.uiState.craftCooldownTimer > 0 ||
            !this.gameState.hasEmptySlot() ||
            this.gameState.photons < GAME_CONFIG.CRAFT_SAIL_COST) {
            this.audioManager.playError();
            return;
        }

        const power = this.marketState.calculateSailPower();
        const sail = this.gameState.addSail(power);
        this.gameState.removePhotons(GAME_CONFIG.CRAFT_SAIL_COST);
        this.uiState.craftCooldownTimer = GAME_CONFIG.CRAFT_COOLDOWN;

        this.audioManager.playCraft();
        this.uiRenderer.addLog(`Crafted new Solar Sail with ${sail.power} Power.`, 'info');

        this.encounterManager.triggerRandomEncounter();
        this.uiRenderer.render();
    }

    async craftBattery() {
        await this.audioManager.initialize();

        if (!this.gameState ||
            this.uiState.craftCooldownTimer > 0 ||
            !this.gameState.hasEmptySlot() ||
            this.gameState.lightyears < GAME_CONFIG.CRAFT_BATTERY_COST) {
            this.audioManager.playError();
            this.uiRenderer.addLog("Cannot craft battery: Requirements not met.", "error");
            return;
        }

        const rate = this.marketState.calculateBatteryRate();
        const battery = this.gameState.addBattery(rate);
        this.gameState.removeLightyears(GAME_CONFIG.CRAFT_BATTERY_COST);
        this.uiState.craftCooldownTimer = 5;

        this.audioManager.playCraft();
        this.uiRenderer.addLog(
            `Crafted a Photon Battery with a rate of ${battery.rate} p/s, costing ${GAME_CONFIG.CRAFT_BATTERY_COST.toLocaleString()} LY.`,
            'info'
        );

        this.encounterManager.triggerRandomEncounter();
        this.uiRenderer.render();
    }

    async removeModule(index) {
        if (!this.gameState || !this.gameState.slots[index]) return;
        await this.audioManager.initialize();
        this.audioManager.playClick();

        const removed = this.gameState.removeSlot(index);
        if (removed) {
            this.uiRenderer.addLog(`Jettisoned ${removed.type} from inventory slot ${index + 1}.`, 'info');
        }
        this.uiRenderer.render();
    }

    // ===========================================
    // ENCOUNTERS
    // ===========================================

    async handleEncounterDecision(riskIt) {
        await this.audioManager.initialize();
        this.audioManager.playClick();

        const result = this.encounterManager.handleEncounterDecision(riskIt);
        this.uiRenderer.render();
        
        // Show result popup if the player risked it
        if (result && !result.avoided && !result.error) {
            this.uiRenderer.showEncounterResult(result);
        }
    }

    async forceTriggerEncounter() {
        if (!this.gameState) return;
        await this.audioManager.initialize();
        this.audioManager.playClick();
        this.uiRenderer.addLog("TEST: Forcing random encounter.", 'info');
        this.encounterManager.forceTriggerEncounter();
    }

    // ===========================================
    // BLACKHOLE MINIGAME
    // ===========================================

    attemptEnterBlackhole() {
        const costLY = 250000;
        if (this.gameState.lightyears >= costLY) {
            this.audioManager.playSuccess();
            this.gameState.removeLightyears(costLY);
            this.gameState.destroyAllSails();
            this.uiRenderer.addLog("All sails destroyed! Entering black hole...", 'error');
            this.uiRenderer.render();

            this.uiRenderer.showMinigame();
            this.warpMinigame.resizeCanvas();
            this.warpMinigame.start(
                (score) => this.handleMinigameSuccess(score),
                () => this.handleMinigameFailure()
            );
        } else {
            this.audioManager.playError();
            this.uiRenderer.addLog("Insufficient resources to enter black hole.", 'error');
        }
    }

    handleMinigameSuccess(finalScore) {
        this.uiRenderer.addLog(
            `Successfully warped out of the black hole! Gained ${finalScore.toLocaleString()} lightyears.`,
            'success'
        );

        const won = this.gameState.addLightyears(finalScore);
        this.uiRenderer.hideMinigame();
        this.uiRenderer.render();

        if (won && !this.gameState.hasWon) {
            this.gameState.hasWon = true;
            this.uiRenderer.showWinScreen();
            this.stopGameLoops();
            this.audioManager.playSuccess();
        }
    }

    handleMinigameFailure() {
        this.uiRenderer.addLog("Lost in the black hole! The Outrider is gone...", 'error');
        this.uiRenderer.hideMinigame();
        this.uiRenderer.showGameOver();
        this.stopGameLoops();
    }

    // ===========================================
    // UI CONTROLS
    // ===========================================

    toggleMusicMute() {
        const isMuted = this.audioManager.toggleMusicMute();
        this.uiRenderer.updateMuteIcons(isMuted, this.audioManager.isSfxMuted);
    }

    toggleSfxMute() {
        const isMuted = this.audioManager.toggleSfxMute();
        this.uiRenderer.updateMuteIcons(this.audioManager.isMusicMuted, isMuted);
    }

    cycleSystemMode(playSound = true) {
        if (playSound) {
            this.audioManager.playClick();
        }
        const trackIndex = this.uiRenderer.cycleSystemMode();
        this.audioManager.setTrack(trackIndex);
    }

    setSystemMode(index, playSound = true) {
        if (playSound) {
            this.audioManager.playClick();
        }
        const trackIndex = this.uiRenderer.setSystemMode(index);
        this.audioManager.setTrack(trackIndex);
    }

    toggleScanner() {
        this.audioManager.playClick();
        this.uiRenderer.toggleScanner();
    }

    showTab(tabName, playSound = true) {
        if (playSound) {
            this.audioManager.playClick();
        }
        this.uiRenderer.showTab(tabName);

        // Lazy-load animations
        if (tabName === 'map' && !this.uiState.mapTabInitialized) {
            initTitleStarfield();
            initMapOverlay();
            this.uiState.mapTabInitialized = true;
        }
        if (tabName === 'engines' && !this.uiState.engineTabInitialized) {
            initAirstream();
            initAtomDecayEffect();
            initPhotonBurstsEffect();
            this.uiState.engineTabInitialized = true;
        }
    }

    // ===========================================
    // TEST FUNCTIONS
    // ===========================================

    async mintTestLightyears() {
        if (!this.gameState) return;
        await this.audioManager.initialize();
        this.audioManager.playSuccess();

        const won = this.gameState.addLightyears(250000);
        this.uiRenderer.addLog("TEST: Minted 250,000 lightyears.", 'info');
        this.uiRenderer.render();

        if (won && !this.gameState.hasWon) {
            this.gameState.hasWon = true;
            this.uiRenderer.showWinScreen();
            this.stopGameLoops();
            this.audioManager.playSuccess();
        }
    }

    async mintTestPhotons() {
        if (!this.gameState) return;
        await this.audioManager.initialize();
        this.audioManager.playSuccess();

        this.gameState.addPhotons(1000);
        this.uiRenderer.addLog("TEST: Minted 1,000 photons.", 'info');
        this.uiRenderer.render();
    }
}

// ===========================================
// BOOTSTRAP
// ===========================================

window.onload = () => {
    const game = new Game();
    game.init();
};
