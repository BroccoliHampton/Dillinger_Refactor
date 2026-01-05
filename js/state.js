// ===========================================
// GAME STATE MANAGEMENT
// ===========================================

import { GAME_CONFIG, MAP_DURATIONS, SUN_INTENSITY, ETH_PRICE } from './config.js';
import { randRange, clamp, generateId } from './utils.js';

/**
 * GameState class manages all game state
 */
export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.photons = 250;
        this.lightyears = 0;
        this.warrants = 0;
        this.hasWon = false;
        this.maxLightyears = GAME_CONFIG.WIN_DISTANCE;
        this.slots = Array(GAME_CONFIG.SAIL_SLOTS).fill(null);
        this.log = [{
            timestamp: new Date().toLocaleTimeString(),
            message: "The Outrider is ready for warp...",
            type: 'info'
        }];
        this.timestamp = Date.now();
        this.mapTimer = MAP_DURATIONS[0];
    }

    // ================
    // PHOTON METHODS
    // ================

    addPhotons(amount) {
        this.photons += amount;
    }

    removePhotons(amount) {
        if (this.photons >= amount) {
            this.photons -= amount;
            return true;
        }
        return false;
    }

    getTotalPhotonRate() {
        return this.slots
            .filter(s => s && s.type === 'battery')
            .reduce((sum, battery) => sum + (battery.rate || 0), 0);
    }

    // ================
    // LIGHTYEAR METHODS
    // ================

    addLightyears(amount) {
        this.lightyears = Math.min(this.lightyears + amount, GAME_CONFIG.WIN_DISTANCE);
        return this.lightyears >= GAME_CONFIG.WIN_DISTANCE;
    }

    removeLightyears(amount) {
        if (this.lightyears >= amount) {
            this.lightyears -= amount;
            return true;
        }
        return false;
    }

    // ================
    // SLOT METHODS
    // ================

    getEmptySlotIndex() {
        return this.slots.findIndex(s => s === null);
    }

    hasEmptySlot() {
        return this.slots.some(s => s === null);
    }

    addSail(power) {
        const index = this.getEmptySlotIndex();
        if (index === -1) return null;

        const sail = {
            type: 'sail',
            id: generateId(),
            power: power,
            durability: GAME_CONFIG.SAIL_MAX_DURABILITY,
            isBroken: false
        };
        this.slots[index] = sail;
        return sail;
    }

    addBattery(rate) {
        const index = this.getEmptySlotIndex();
        if (index === -1) return null;

        const battery = {
            type: 'battery',
            id: generateId(),
            rate: rate
        };
        this.slots[index] = battery;
        return battery;
    }

    removeSlot(index) {
        if (index >= 0 && index < this.slots.length && this.slots[index]) {
            const removed = this.slots[index];
            this.slots[index] = null;
            return removed;
        }
        return null;
    }

    destroyAllSails() {
        this.slots = this.slots.map(slot => 
            (slot && slot.type === 'battery') ? slot : null
        );
    }

    getSlotCounts() {
        let sailCount = 0;
        let batteryCount = 0;
        let totalPower = 0;
        let totalPhotonRate = 0;

        this.slots.forEach(slot => {
            if (slot) {
                if (slot.type === 'sail') {
                    sailCount++;
                    if (slot.durability > 0) {
                        totalPower += slot.power;
                    }
                } else if (slot.type === 'battery') {
                    batteryCount++;
                    totalPhotonRate += slot.rate || 0;
                }
            }
        });

        return { sailCount, batteryCount, totalPower, totalPhotonRate };
    }

    // ================
    // DECAY & MINING
    // ================

    processMiningCycle(logCallback) {
        let totalPower = 0;
        
        this.slots = this.slots.map(slot => {
            if (slot && slot.type === 'sail') {
                if (slot.durability > 0) {
                    slot.durability -= randRange(1, 3);
                }
                if (slot.durability > 0) {
                    totalPower += slot.power;
                } else if (slot.durability <= 0 && !slot.isBroken) {
                    if (logCallback) {
                        logCallback(`Sail [${slot.power}P] has broken down! It must be jettisoned.`, 'error');
                    }
                    slot.isBroken = true;
                }
            }
            return slot;
        });

        const lyGain = totalPower * randRange(5, 15);
        
        if (lyGain > 0) {
            if (logCallback) {
                logCallback(`Travelled ${lyGain.toLocaleString()} lightyears. Total Power: ${totalPower}.`, 'success');
            }
        } else if (this.slots.some(s => s && s.type === 'sail' && s.durability > 0) && totalPower === 0) {
            if (logCallback) {
                logCallback("Warning: All functioning Solar Sails have broken down.", 'error');
            }
        }

        return { lyGain, totalPower };
    }

    // ================
    // WARRANT METHODS
    // ================

    claimWarrant() {
        this.warrants = (this.warrants || 0) + 1;
        this.lightyears = 0;
        this.hasWon = false;
        const nextTimerIndex = Math.min(this.warrants, MAP_DURATIONS.length - 1);
        this.mapTimer = MAP_DURATIONS[nextTimerIndex];
    }

    // ================
    // LOG METHODS
    // ================

    addLogEntry(message, type = 'info') {
        const entry = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        };
        this.log = [entry, ...this.log].slice(0, 50);
        return entry;
    }

    // ================
    // PROGRESS
    // ================

    getProgressRatio() {
        return this.lightyears / GAME_CONFIG.WIN_DISTANCE;
    }

    checkWinCondition() {
        if (this.lightyears >= GAME_CONFIG.WIN_DISTANCE && !this.hasWon) {
            this.hasWon = true;
            return true;
        }
        return false;
    }
}

/**
 * MarketState manages sun intensity and ETH price
 */
export class MarketState {
    constructor() {
        this.sunIntensity = SUN_INTENSITY.INITIAL;
        this.ethPrice = ETH_PRICE.INITIAL;
    }

    updateSunIntensity() {
        const change = randRange(-2500, 2500);
        this.sunIntensity = clamp(
            this.sunIntensity + change,
            SUN_INTENSITY.MIN,
            SUN_INTENSITY.MAX
        );
        return this.sunIntensity;
    }

    updateEthPrice() {
        const change = randRange(-100, 100);
        this.ethPrice = clamp(
            this.ethPrice + change,
            ETH_PRICE.MIN,
            ETH_PRICE.MAX
        );
        return this.ethPrice;
    }

    calculateSailPower() {
        return Math.max(1, Math.round(this.sunIntensity * 0.001));
    }

    calculateBatteryRate() {
        return parseFloat((this.ethPrice * 0.001).toFixed(2));
    }
}

/**
 * UIState manages UI-specific state
 */
export class UIState {
    constructor() {
        this.currentThemeIndex = 0;
        this.currentTrackIndex = 2;
        this.scannerDisplayIndex = 0;
        this.craftCooldownTimer = 0;
        this.activeEncounter = null;
        this.lastEncounterResult = null;
        this.pastShipPositions = [];
        this.engineTabInitialized = false;
        this.mapTabInitialized = false;
    }

    reset() {
        this.craftCooldownTimer = 0;
        this.activeEncounter = null;
        this.lastEncounterResult = null;
        this.pastShipPositions = [];
    }

    addShipPosition(pos) {
        if (this.pastShipPositions.length === 0 || 
            Math.abs(this.pastShipPositions[this.pastShipPositions.length - 1].x - pos.x) > 2) {
            this.pastShipPositions.push(pos);
            if (this.pastShipPositions.length > 100) {
                this.pastShipPositions.shift();
            }
        }
    }

    clearShipPositions() {
        this.pastShipPositions = [];
    }
}
