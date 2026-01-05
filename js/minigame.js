// ===========================================
// WARP MINIGAME
// ===========================================

import { $, randRange } from './utils.js';

/**
 * WarpMinigame class handles the blackhole warp minigame
 */
export class WarpMinigame {
    constructor() {
        // DOM elements
        this.canvas = null;
        this.ctx = null;
        this.warpOutBtn = null;
        this.gameView = null;
        this.slider = null;

        // Colors
        this.C_BG_VERY_DARK = '#111100';
        this.C_TRACK_GREEN = '#B8FF42';
        this.C_PLAYER_ORANGE = '#FF8800';
        this.C_HAZARD_RED = '#CC0033';
        this.C_STAR_COLOR = '#FFAA44';

        // Game state
        this.isRunning = false;
        this.score = 0;
        this.playerX = 0;
        this.playerWidth = 20;
        this.trackWidthRatio = 0.5;

        // Obstacles
        this.obstacles = [];
        this.obstacleSpawnRate = 120;
        this.frameCount = 0;
        this.GRACE_PERIOD_FRAMES = 60;

        // Speed
        this.baseSpeed = 4;
        this.gameSpeed = 4;

        // Stars
        this.stars = [];
        this.STAR_COUNT = 80;

        // Callbacks
        this.onSuccessCallback = null;
        this.onFailureCallback = null;
    }

    /**
     * Initialize the minigame
     */
    init() {
        this.canvas = $('warp-gameCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.warpOutBtn = $('warp-out-button');
        this.gameView = $('warp-gameView');
        this.slider = $('warp-slider');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        const resetSlider = () => {
            if (this.slider && this.isRunning) {
                this.slider.value = 0;
            }
        };

        if (this.slider) {
            this.slider.addEventListener('mouseup', resetSlider);
            this.slider.addEventListener('touchend', resetSlider);
        }

        if (this.warpOutBtn) {
            this.warpOutBtn.addEventListener('click', () => this.warpOut());
        }
    }

    /**
     * Get canvas X position from relative position
     */
    getCanvasX(x) {
        const trackW = this.canvas.width * this.trackWidthRatio;
        const trackLeft = (this.canvas.width - trackW) / 2;
        return trackLeft + (trackW / 2) + x;
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        if (!this.gameView || !this.canvas) return;
        const parent = this.gameView;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.playerX = 0;
        this.initStars();
        this.draw();
    }

    /**
     * Initialize star background
     */
    initStars() {
        if (!this.canvas) return;
        this.stars = [];
        for (let i = 0; i < this.STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
            });
        }
    }

    /**
     * Main update loop
     */
    update() {
        if (!this.isRunning) return;

        // Handle slider input
        if (this.slider) {
            const sliderValue = parseInt(this.slider.value, 10);
            const maxDeviation = (this.canvas.width * this.trackWidthRatio) / 2 - this.playerWidth / 2;
            this.playerX = maxDeviation * (sliderValue / 100);
        }

        // Update score
        const continuousRate = 167;
        this.score = this.frameCount * continuousRate;

        // Increase difficulty over time
        this.baseSpeed = 4 + Math.floor(this.frameCount / 480) * 0.5;
        this.gameSpeed = this.baseSpeed;
        this.obstacleSpawnRate = Math.max(30, 120 - Math.floor(this.frameCount / 600) * 10);

        // Update stars
        this.stars.forEach(star => {
            star.y += this.gameSpeed * star.size * 0.25;
            if (star.y > this.canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * this.canvas.width;
            }
        });

        // Update obstacles
        this.obstacles.forEach(obs => {
            obs.y += this.gameSpeed;
        });
        this.obstacles = this.obstacles.filter(obs => obs.y < this.canvas.height);

        // Spawn new obstacles
        if (this.frameCount > this.GRACE_PERIOD_FRAMES && this.frameCount % Math.floor(this.obstacleSpawnRate) === 0) {
            const trackW = this.canvas.width * this.trackWidthRatio;
            const minGapW = trackW * 0.25;
            const maxGapW = trackW * 0.6;
            const gapWidth = minGapW + Math.random() * (maxGapW - minGapW);
            const trackHalfW = trackW / 2;
            const minGapCenter = -trackHalfW + gapWidth / 2;
            const maxGapCenter = trackHalfW - gapWidth / 2;
            const gapCenter = minGapCenter + Math.random() * (maxGapCenter - minGapCenter);
            this.obstacles.push({ y: -10, h: 30, gapX: gapCenter, gapW: gapWidth });
        }

        this.checkCollisions();
        this.frameCount++;
    }

    /**
     * Check for collisions with obstacles
     */
    checkCollisions() {
        if (!this.canvas || this.canvas.width === 0) return;

        const trackW = this.canvas.width * this.trackWidthRatio;
        const trackLeft = (this.canvas.width - trackW) / 2;
        const pCanvasX = this.getCanvasX(this.playerX);
        const playerHeight = this.playerWidth * 1.5;
        const playerYOffsetFromBottom = this.canvas.height * 0.2;
        const playerY = this.canvas.height - playerYOffsetFromBottom - playerHeight;

        const playerRect = {
            left: pCanvasX - this.playerWidth / 2,
            right: pCanvasX + this.playerWidth / 2,
            top: playerY,
            bottom: playerY + playerHeight
        };

        for (const obs of this.obstacles) {
            if (obs.y + obs.h > playerRect.top && obs.y < playerRect.bottom) {
                const obsLeftEnd = trackLeft + trackW / 2 + obs.gapX - obs.gapW / 2;
                const obsRightStart = trackLeft + trackW / 2 + obs.gapX + obs.gapW / 2;
                if (playerRect.left < obsLeftEnd || playerRect.right > obsRightStart) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    /**
     * Draw the game
     */
    draw() {
        if (!this.ctx || !this.canvas) return;

        // Background
        this.ctx.fillStyle = this.C_BG_VERY_DARK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        this.ctx.fillStyle = this.C_STAR_COLOR;
        this.ctx.shadowColor = this.C_STAR_COLOR;
        this.ctx.shadowBlur = 4;
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;

        // Track
        const trackW = this.canvas.width * this.trackWidthRatio;
        const trackLeft = (this.canvas.width - trackW) / 2;
        const trackRight = trackLeft + trackW;

        this.ctx.strokeStyle = this.C_TRACK_GREEN;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);

        const lineOffset = this.frameCount % 15;
        this.ctx.beginPath();
        for (let i = 0; i < this.canvas.height / 15 + 2; i++) {
            this.ctx.moveTo(trackLeft, i * 15 - lineOffset);
            this.ctx.lineTo(trackLeft, (i * 15 + 10) - lineOffset);
        }
        for (let i = 0; i < this.canvas.height / 15 + 2; i++) {
            this.ctx.moveTo(trackRight, i * 15 - lineOffset);
            this.ctx.lineTo(trackRight, (i * 15 + 10) - lineOffset);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Obstacles
        this.ctx.fillStyle = this.C_HAZARD_RED;
        this.ctx.shadowColor = this.C_HAZARD_RED;
        this.ctx.shadowBlur = 10;
        this.obstacles.forEach(obs => {
            const obsLeftEnd = trackLeft + trackW / 2 + obs.gapX - obs.gapW / 2;
            this.ctx.fillRect(trackLeft, obs.y, obsLeftEnd - trackLeft, obs.h);
            const obsRightStart = trackLeft + trackW / 2 + obs.gapX + obs.gapW / 2;
            this.ctx.fillRect(obsRightStart, obs.y, trackRight - obsRightStart, obs.h);
        });
        this.ctx.shadowBlur = 0;

        // Player
        const pCanvasX = this.getCanvasX(this.playerX);
        const playerHeight = this.playerWidth * 1.5;
        const playerYOffsetFromBottom = this.canvas.height * 0.2;
        const playerY = this.canvas.height - playerYOffsetFromBottom - playerHeight;

        this.ctx.fillStyle = this.C_PLAYER_ORANGE;
        this.ctx.shadowColor = this.C_PLAYER_ORANGE;
        this.ctx.shadowBlur = this.isRunning ? 8 : 0;
        this.ctx.beginPath();
        this.ctx.fillRect(pCanvasX - this.playerWidth / 2, playerY, this.playerWidth, playerHeight);
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;

        // Score
        this.ctx.fillStyle = this.C_PLAYER_ORANGE;
        this.ctx.font = '24px "VT323", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score.toLocaleString('en-US')}`, 10, 30);

        // Game over overlay
        if (!this.isRunning && this.onFailureCallback) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.C_HAZARD_RED;
            this.ctx.shadowColor = this.C_HAZARD_RED;
            this.ctx.shadowBlur = 20;
            this.ctx.font = '48px "VT323", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FAILURE', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '24px "VT323", monospace';
            this.ctx.fillText('The Outrider was lost to the warp...', this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.shadowBlur = 0;
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        this.update();
        this.draw();
        if (this.isRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.isRunning = false;
        this.draw();
        if (this.onFailureCallback) {
            this.onFailureCallback();
        }
    }

    /**
     * Warp out and claim score
     */
    warpOut() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.onSuccessCallback) {
            this.onSuccessCallback(this.score);
        }
    }

    /**
     * Start the minigame
     */
    start(onSuccess, onFailure) {
        if (this.isRunning) return;

        this.onSuccessCallback = onSuccess;
        this.onFailureCallback = onFailure;

        // Reset state
        this.score = 0;
        this.playerX = 0;
        this.obstacles = [];
        this.frameCount = 0;
        this.gameSpeed = this.baseSpeed;

        if (this.slider) {
            this.slider.value = 0;
        }

        this.initStars();
        this.isRunning = true;
        this.gameLoop();
    }
}
