// ===========================================
// UI RENDERER
// ===========================================

import { $, formatTime, formatMapTime, getShipMapPosition } from './utils.js';
import { GAME_CONFIG, SYSTEM_NAMES, MAP_NODES, THEMES, TARGET_DATA, SCANNER_TEXTS } from './config.js';

/**
 * UIRenderer handles all DOM updates and UI state
 */
export class UIRenderer {
    constructor(gameState, marketState, uiState) {
        this.gameState = gameState;
        this.marketState = marketState;
        this.uiState = uiState;
    }

    /**
     * Main render function - updates all UI elements
     */
    render() {
        if (!this.gameState) return;

        this.renderVitals();
        this.renderSlots();
        this.renderMap();
        this.renderEncounterDebrief();
        this.bindDynamicListeners();
    }

    /**
     * Render vitals panel
     */
    renderVitals() {
        const gs = this.gameState;
        const ms = this.marketState;

        // Basic stats
        $('photons-display').textContent = gs.photons.toLocaleString();
        $('lightyears-display').textContent = gs.lightyears.toLocaleString();
        $('photon-balance-engines').textContent = gs.photons.toLocaleString();
        $('lightyear-balance-engines').textContent = gs.lightyears.toLocaleString();
        $('btc-price-display').textContent = `${ms.sunIntensity.toLocaleString()}`;
        $('eth-price-display').textContent = `${ms.ethPrice.toLocaleString()}`;
        $('warrants-display').innerHTML = `<i class="fas fa-skull-crossbones mr-2"></i> ${gs.warrants || 0}`;

        // Progress bar
        $('progress-fill').style.width = `${Math.min(100, gs.getProgressRatio() * 100)}%`;

        // Cooldown timer
        $('cooldown-timer').textContent = formatTime(this.uiState.craftCooldownTimer);

        // Map timer
        const timerDisplay = $('map-timer-display');
        timerDisplay.textContent = formatMapTime(gs.mapTimer);
        if (gs.mapTimer <= 60) {
            timerDisplay.classList.add('animate-pulse');
        } else {
            timerDisplay.classList.remove('animate-pulse');
        }

        // Craft buttons
        const hasEmptySlot = gs.hasEmptySlot();
        $('craft-sail-button').disabled = !(gs.photons >= GAME_CONFIG.CRAFT_SAIL_COST && hasEmptySlot && this.uiState.craftCooldownTimer <= 0);
        $('craft-battery-button').disabled = !(gs.lightyears >= GAME_CONFIG.CRAFT_BATTERY_COST && hasEmptySlot && this.uiState.craftCooldownTimer <= 0);

        // Slot counts and power
        const { sailCount, batteryCount, totalPower, totalPhotonRate } = gs.getSlotCounts();
        $('total-power-display').textContent = totalPower;

        const avgLightyearRate = totalPower * 2;
        $('photon-rate-display').textContent = `+${totalPhotonRate.toFixed(2)}/s`;
        $('lightyear-rate-display').textContent = `~${avgLightyearRate.toLocaleString()}/s`;

        // Ratio bars
        $('sail-ratio-bar').style.width = `${(sailCount / GAME_CONFIG.SAIL_SLOTS) * 100}%`;
        $('battery-ratio-bar').style.width = `${(batteryCount / GAME_CONFIG.SAIL_SLOTS) * 100}%`;
    }

    /**
     * Render inventory slots
     */
    renderSlots() {
        const inventorySlotsEl = $('inventory-slots');
        inventorySlotsEl.innerHTML = '';

        this.gameState.slots.forEach((slot, index) => {
            if (slot && slot.type === 'sail') {
                const durabilityPercent = Math.max(0, Math.round(slot.durability));
                if (durabilityPercent > 0) {
                    inventorySlotsEl.innerHTML += `
                        <div class="p-2 rounded-lg text-center inventory-slot-item" style="background-color: #1e293b; border-color: var(--neon-cyan);">
                            <p class="font-bold text-white text-xs">SOLAR SAIL</p>
                            <div class="text-xs opacity-80" style="color: var(--neon-cyan);">
                                <span>Pwr: ${slot.power}</span> | <span>Dur: ${durabilityPercent}%</span>
                            </div>
                            <div class="h-1 bg-black/50 mt-1 rounded">
                                <div class="bg-cyan-400 h-1 rounded" style="width: ${durabilityPercent}%;"></div>
                            </div>
                        </div>`;
                } else {
                    inventorySlotsEl.innerHTML += `
                        <div class="p-2 rounded-lg text-center flex flex-col justify-between h-full inventory-slot-item" style="background-color: #1e293b; border-color: var(--neon-red); color: var(--neon-red);">
                            <p class="font-bold text-xs">BROKEN SAIL</p>
                            <div class="text-xs opacity-80">
                                <span>Pwr: ${slot.power}</span> | <span>Dur: 0%</span>
                            </div>
                            <button data-action="remove-module" data-index="${index}" class="mt-1 w-full text-xs p-1 rounded bg-red-800/50 hover:bg-red-700/50 text-white">JETTISON</button>
                        </div>`;
                }
            } else if (slot && slot.type === 'battery') {
                inventorySlotsEl.innerHTML += `
                    <div class="p-2 rounded-lg text-center flex flex-col items-center justify-between h-full inventory-slot-item" style="background-color: #1e293b; border-color: var(--neon-yellow); color: var(--neon-yellow);">
                        <div class="flex-grow flex flex-col justify-center">
                            <i class="fas fa-battery-full text-2xl mb-1"></i>
                            <span class="font-bold text-xs">PHOTON BATTERY</span>
                            <span class="text-xs opacity-80">${(slot.rate || 0).toFixed(2)} p/s</span>
                        </div>
                        <button data-action="remove-module" data-index="${index}" class="mt-1 w-full text-xs p-1 rounded bg-yellow-800/50 hover:bg-yellow-700/50 text-white">REMOVE</button>
                    </div>`;
            } else {
                inventorySlotsEl.innerHTML += `
                    <div class="p-2 rounded-lg text-center flex flex-col items-center justify-center h-full bg-black/20 inventory-slot-item" style="border-color: #475569; color: #64748b;">
                        <i class="far fa-circle text-2xl mb-1"></i>
                        <span class="font-bold text-xs">EMPTY SLOT</span>
                    </div>`;
            }
        });
    }

    /**
     * Render navigation map
     */
    renderMap() {
        const gs = this.gameState;
        const currentMapIndex = (gs.warrants || 0) % 6;

        // System name
        $('system-name-display').textContent = SYSTEM_NAMES[currentMapIndex];

        // Map displays
        ['map-display-1', 'map-display-2', 'map-display-3', 'map-display-4', 'map-display-5', 'map-display-6'].forEach((id, index) => {
            const mapEl = $(id);
            if (mapEl) {
                mapEl.style.display = (index === currentMapIndex) ? 'block' : 'none';
            }
        });

        // Ship position
        const shipGroup = $('dillinger-ship-group');
        const trailGroup = $('ship-trail-group');
        const progressRatio = gs.getProgressRatio();
        const currentPos = getShipMapPosition(progressRatio, MAP_NODES.START, MAP_NODES.END);

        // Update ship trail
        this.uiState.addShipPosition(currentPos);

        if (trailGroup) {
            while (trailGroup.firstChild) {
                trailGroup.removeChild(trailGroup.firstChild);
            }
            this.uiState.pastShipPositions.forEach(pos => {
                const trailDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                trailDot.setAttribute('cx', pos.x);
                trailDot.setAttribute('cy', pos.y);
                trailDot.setAttribute('r', 2);
                trailDot.setAttribute('fill', '#00ff41');
                trailDot.setAttribute('opacity', 0.4);
                trailGroup.appendChild(trailDot);
            });
        }

        if (shipGroup) {
            shipGroup.setAttribute('transform', `translate(${currentPos.x} ${currentPos.y})`);
        }
    }

    /**
     * Render encounter debrief panel
     */
    renderEncounterDebrief() {
        const panel = $('encounter-debrief-panel');
        const textEl = $('encounter-debrief-text');
        if (this.uiState.lastEncounterResult) {
            textEl.textContent = this.uiState.lastEncounterResult;
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }

    /**
     * Bind dynamic listeners (for dynamically created buttons)
     */
    bindDynamicListeners() {
        // This is handled in main.js event delegation
    }

    /**
     * Add log message to display
     */
    addLog(message, type = 'info') {
        const entry = this.gameState.addLogEntry(message, type);
        const color = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-gray-400';
        const logElement = $('log-display');
        const newMessage = `<p class="mb-1 ${color}">[${entry.timestamp}] <span class="text-white">${message}</span></p>`;
        logElement.innerHTML = newMessage + logElement.innerHTML;
        if (logElement.children.length > 50) {
            logElement.removeChild(logElement.lastChild);
        }
    }

    /**
     * Show encounter modal
     */
    showEncounter(encounter) {
        $('encounter-description').textContent = `${encounter.name}: ${encounter.description}`;
        $('encounter-modal').classList.remove('hidden');
    }

    /**
     * Hide encounter modal
     */
    hideEncounter() {
        $('encounter-modal').classList.add('hidden');
    }

    /**
     * Set system mode/theme
     */
    setSystemMode(themeIndex) {
        this.uiState.currentThemeIndex = themeIndex;
        const theme = THEMES[themeIndex];

        document.documentElement.style.setProperty('--neon-green', theme.color);

        const displayEl = $('system-mode-display');
        displayEl.textContent = theme.name;
        displayEl.style.color = theme.color;

        const targetData = TARGET_DATA[theme.name];
        $('target-id').textContent = targetData.id;
        $('target-class').textContent = targetData.class;
        $('target-dist').textContent = targetData.dist;
        $('target-signal').textContent = targetData.signal;

        return theme.trackIndex;
    }

    /**
     * Cycle to next system mode
     */
    cycleSystemMode() {
        const nextIndex = (this.uiState.currentThemeIndex + 1) % THEMES.length;
        return this.setSystemMode(nextIndex);
    }

    /**
     * Toggle scanner text
     */
    toggleScanner() {
        this.uiState.scannerDisplayIndex = (this.uiState.scannerDisplayIndex + 1) % SCANNER_TEXTS.length;
        const textStream = document.querySelector('.text-stream');
        if (textStream) {
            textStream.innerHTML = SCANNER_TEXTS[this.uiState.scannerDisplayIndex].replace(/ :: /g, '<br>');
        }
    }

    /**
     * Set initial scanner text
     */
    setInitialScannerText() {
        const textStream = document.querySelector('.text-stream');
        if (textStream) {
            textStream.innerHTML = SCANNER_TEXTS[0].replace(/ :: /g, '<br>');
        }
    }

    /**
     * Show specific tab
     */
    showTab(tabName) {
        ['vitals', 'map', 'engines', 'action', 'briefing'].forEach(name => {
            const content = $(`${name}-tab-content`);
            const button = $(`nav-${name}`);
            if (content && button) {
                const isActive = name === tabName;
                content.classList.toggle('active', isActive);
                button.classList.toggle('active', isActive);
            }
        });
    }

    /**
     * Update mute icons
     */
    updateMuteIcons(isMusicMuted, isSfxMuted) {
        const mainIcon = $('mute-icon');
        const commsIcon = $('mute-music-icon');
        const sfxIcon = $('mute-sfx-icon');

        if (mainIcon) {
            mainIcon.classList.toggle('fa-volume-up', !isMusicMuted);
            mainIcon.classList.toggle('fa-volume-mute', isMusicMuted);
        }
        if (commsIcon) {
            commsIcon.classList.toggle('fa-volume-up', !isMusicMuted);
            commsIcon.classList.toggle('fa-volume-mute', isMusicMuted);
        }
        if (sfxIcon) {
            sfxIcon.classList.toggle('fa-volume-up', !isSfxMuted);
            sfxIcon.classList.toggle('fa-volume-mute', isSfxMuted);
        }
    }

    /**
     * Show win screen
     */
    showWinScreen() {
        $('win-message').classList.remove('hidden');
    }

    /**
     * Hide win screen
     */
    hideWinScreen() {
        $('win-message').classList.add('hidden');
    }

    /**
     * Show game over screen
     */
    showGameOver() {
        $('game-over-message').classList.remove('hidden');
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        $('game-over-message').classList.add('hidden');
    }

    /**
     * Show reset confirmation modal
     */
    showResetModal() {
        $('reset-confirm-modal').classList.remove('hidden');
    }

    /**
     * Hide reset confirmation modal
     */
    hideResetModal() {
        $('reset-confirm-modal').classList.add('hidden');
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        $('loading-spinner').classList.remove('hidden');
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        $('loading-spinner').classList.add('hidden');
    }

    /**
     * Show game container
     */
    showGameContainer() {
        $('game-container').classList.remove('hidden');
        $('bottom-nav-bar').classList.remove('hidden');
        $('game-header').classList.remove('hidden');
    }

    /**
     * Show minigame, hide prompt
     */
    showMinigame() {
        $('minigame-prompt').classList.add('hidden');
        $('minigame-container').classList.remove('hidden');
        $('minigame-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Hide minigame, show prompt
     */
    hideMinigame() {
        $('minigame-prompt').classList.remove('hidden');
        $('minigame-container').classList.add('hidden');
    }
}
