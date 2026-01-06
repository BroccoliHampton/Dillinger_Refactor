// ===========================================
// ENCOUNTER SYSTEM
// ===========================================

import { ENCOUNTERS, GAME_CONFIG } from './config.js';
import { randRange } from './utils.js';

/**
 * EncounterManager handles random encounter logic
 */
export class EncounterManager {
    constructor(gameState, uiState, audioManager, uiRenderer) {
        this.gameState = gameState;
        this.uiState = uiState;
        this.audioManager = audioManager;
        this.uiRenderer = uiRenderer;
    }

    /**
     * Attempt to trigger a random encounter
     * @returns {Object|null} The triggered encounter or null
     */
    triggerRandomEncounter() {
        // Don't trigger if player doesn't have minimum lightyears to participate
        if (this.gameState.lightyears < 10000) {
            return null;
        }

        if (Math.random() > GAME_CONFIG.ENCOUNTER_TRIGGER_CHANCE) {
            return null;
        }

        const roll = Math.random();
        let cumulativeChance = 0;

        for (const encounter of ENCOUNTERS) {
            cumulativeChance += encounter.chance;
            if (roll <= cumulativeChance) {
                this.uiState.activeEncounter = encounter;
                this.uiRenderer.showEncounter(encounter);
                this.audioManager.playEncounterAlert();
                this.uiRenderer.addLog(`[ENCOUNTER ALERT]: ${encounter.name} detected.`, 'error');
                return encounter;
            }
        }

        return null;
    }

    /**
     * Force trigger a random encounter (for testing)
     * @returns {Object} The triggered encounter
     */
    forceTriggerEncounter() {
        const roll = Math.random();
        let cumulativeChance = 0;

        for (const encounter of ENCOUNTERS) {
            cumulativeChance += encounter.chance;
            if (roll <= cumulativeChance) {
                this.uiState.activeEncounter = encounter;
                this.uiRenderer.showEncounter(encounter);
                this.audioManager.playEncounterAlert();
                this.uiRenderer.addLog(`[ENCOUNTER ALERT]: ${encounter.name} detected.`, 'error');
                return encounter;
            }
        }

        // Fallback: pick a random encounter
        const randomEncounter = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
        this.uiState.activeEncounter = randomEncounter;
        this.uiRenderer.showEncounter(randomEncounter);
        this.audioManager.playEncounterAlert();
        this.uiRenderer.addLog(`[ENCOUNTER ALERT]: ${randomEncounter.name} detected.`, 'error');
        return randomEncounter;
    }

    /**
     * Handle encounter decision (risk it or avoid)
     * @param {boolean} riskIt - Whether the player chose to risk it
     * @returns {Object|null} Result of the decision
     */
    handleEncounterDecision(riskIt) {
        this.uiRenderer.hideEncounter();

        const encounter = this.uiState.activeEncounter;
        if (!encounter || !this.gameState) {
            return null;
        }

        // If avoiding, just log and return
        if (!riskIt) {
            this.uiRenderer.addLog(`Avoided ${encounter.name}.`, 'info');
            this.uiState.activeEncounter = null;
            return { avoided: true };
        }

        // Check if player has enough lightyears
        if (this.gameState.lightyears < encounter.lyCost) {
            this.audioManager.playError();
            this.uiRenderer.addLog(`Insufficient lightyears to engage ${encounter.name}.`, 'error');
            this.uiState.activeEncounter = null;
            return { error: 'insufficient_ly' };
        }

        // Calculate outcome
        const cost = encounter.lyCost;
        const success = Math.random() < encounter.winChance;

        let lyGain, logMessage, logType;

        if (success) {
            lyGain = randRange(encounter.minLy, encounter.maxLy);
            const netResult = lyGain - cost;
            logMessage = `SUCCESS: Gained ${lyGain.toLocaleString()} lightyears from ${encounter.name}. (Net: ${netResult.toLocaleString()})`;
            logType = netResult >= 0 ? 'success' : 'error';
            this.audioManager.playSuccess();
            this.uiState.lastEncounterResult = encounter.successDescription;
        } else {
            lyGain = randRange(1000, 5000);
            const netResult = lyGain - cost;
            logMessage = `FAILURE: Only recovered ${lyGain.toLocaleString()} lightyears from ${encounter.name}. (Net: ${netResult.toLocaleString()})`;
            logType = 'error';
            this.audioManager.playError();
            this.uiState.lastEncounterResult = encounter.failureDescription;
        }

        // Apply net change
        const netChange = lyGain - cost;
        this.gameState.lightyears = Math.max(0, this.gameState.lightyears + netChange);

        this.uiRenderer.addLog(logMessage, logType);
        this.uiState.activeEncounter = null;

        return {
            success,
            lyGain,
            cost,
            netChange,
            logMessage
        };
    }
}
