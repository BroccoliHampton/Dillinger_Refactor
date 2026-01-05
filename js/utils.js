// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Shorthand for document.getElementById
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export const $ = (id) => document.getElementById(id);

/**
 * Generate random integer in range (inclusive)
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Format seconds as "Xs" or "READY"
 * @param {number} seconds 
 * @returns {string}
 */
export const formatTime = (seconds) => (seconds <= 0) ? "READY" : `${seconds}s`;

/**
 * Format seconds as MM:SS
 * @param {number} seconds 
 * @returns {string}
 */
export const formatMapTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Calculate ship position on map based on progress
 * @param {number} progressRatio - 0 to 1
 * @param {Object} startNode - {x, y}
 * @param {Object} endNode - {x, y}
 * @returns {Object} {x, y}
 */
export const getShipMapPosition = (progressRatio, startNode, endNode) => ({
    x: startNode.x + (endNode.x - startNode.x) * progressRatio,
    y: startNode.y + (endNode.y - startNode.y) * progressRatio
});

/**
 * Clamp a value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Generate a UUID
 * @returns {string}
 */
export const generateId = () => crypto.randomUUID();

/**
 * Debounce function execution
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
