// ===========================================
// ANIMATIONS & VISUAL EFFECTS
// ===========================================

import { $, randRange } from './utils.js';

/**
 * Background starfield animation
 */
export function initStarfield() {
    const starfield = $('starfield');
    if (!starfield) return;

    const createStar = () => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = star.style.height = `${randRange(1, 3)}px`;
        star.style.left = `${randRange(0, 100)}vw`;
        star.style.top = `-${randRange(0, 100)}vh`;
        star.style.animationDuration = `${randRange(5, 15)}s`;
        star.style.animationDelay = `-${randRange(0, 15)}s`;
        return star;
    };

    for (let i = 0; i < 300; i++) {
        starfield.appendChild(createStar());
    }
}

/**
 * Map overlay with grid, scan line, and targeting reticles
 */
export function initMapOverlay() {
    const canvas = $('map-overlay-canvas');
    if (!canvas) return;

    const container = $('navigation-map');
    const ctx = canvas.getContext('2d');
    let scanLineY = 0;
    let reticles = [];
    const NUM_RETICLES = 5;

    class Reticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
            this.y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
            this.life = Math.random() * 250 + 150;
            this.maxLife = this.life;
        }

        update() {
            this.life--;
            if (this.life <= 0) this.reset();
        }

        draw() {
            const size = 8;
            const alpha = Math.sin((this.life / this.maxLife) * Math.PI);
            ctx.strokeStyle = `rgba(255, 65, 0, ${alpha * 0.7})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - size, this.y);
            ctx.lineTo(this.x + size, this.y);
            ctx.moveTo(this.x, this.y - size);
            ctx.lineTo(this.x, this.y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    const resizeCanvas = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        reticles = [];
        for (let i = 0; i < NUM_RETICLES; i++) {
            reticles.push(new Reticle());
        }
    };

    const drawGrid = () => {
        const gridSize = 40;
        ctx.strokeStyle = "rgba(0, 255, 65, 0.1)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    };

    const animate = () => {
        if (!canvas.isConnected) return;
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawGrid();

        // Scan line
        scanLineY = (scanLineY + 1.5) % (canvas.height + 10);
        const gradient = ctx.createLinearGradient(0, scanLineY - 10, 0, scanLineY);
        gradient.addColorStop(0, "rgba(0, 255, 65, 0)");
        gradient.addColorStop(1, "rgba(0, 255, 65, 0.4)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanLineY - 10, canvas.width, 10);

        // Reticles
        reticles.forEach(r => {
            r.update();
            r.draw();
        });
    };

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 0);
    animate();
}

/**
 * Title starfield with twinkling stars and shooting stars
 */
export function initTitleStarfield() {
    const canvas = $('title-starfield-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    const numStars = 200;
    const numShootingStars = 3;

    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 1.5;
            this.alpha = Math.random();
            this.blinkSpeed = (Math.random() - 0.5) * 0.05;
        }

        update() {
            this.alpha += this.blinkSpeed;
            if (this.alpha > 1 || this.alpha < 0) {
                this.alpha = Math.max(0, Math.min(1, this.alpha));
                this.blinkSpeed *= -1;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fill();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width + canvas.width;
            this.y = Math.random() * canvas.height;
            this.len = Math.random() * 80 + 10;
            this.speed = Math.random() * 5 + 2;
            this.waitTime = Math.random() * 500;
        }

        update() {
            if (this.waitTime > 0) {
                this.waitTime--;
                return;
            }
            this.x -= this.speed;
            if (this.x < -this.len) {
                this.reset();
            }
        }

        draw() {
            if (this.waitTime > 0) return;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.len, this.y);
            ctx.lineWidth = 2;
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
            ctx.strokeStyle = gradient;
            ctx.stroke();
        }
    }

    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        stars = [];
        shootingStars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
        for (let i = 0; i < numShootingStars; i++) {
            shootingStars.push(new ShootingStar());
        }
    };

    const animate = () => {
        if (!canvas.isConnected) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            s.update();
            s.draw();
        });
        shootingStars.forEach(s => {
            s.update();
            s.draw();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}

/**
 * Substrate gauge lightning effect
 */
export function initSubstrateGauge() {
    const canvas = $('substrate-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let bolts = [];

    const resizeCanvas = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    };

    class Bolt {
        constructor() {
            this.path = [{ x: 0, y: canvas.height / 2 }];
            this.life = 30;
            this.maxLife = this.life;
        }

        update() {
            this.life--;
            if (this.path[this.path.length - 1].x < canvas.width) {
                const lastPoint = this.path[this.path.length - 1];
                const newPoint = {
                    x: lastPoint.x + 10,
                    y: lastPoint.y + (Math.random() - 0.5) * 10
                };
                this.path.push(newPoint);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            const alpha = this.life / this.maxLife;
            ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = `rgba(244, 63, 94, 1)`;
            ctx.shadowBlur = 5;
            ctx.stroke();
        }
    }

    const animate = () => {
        if (!canvas.isConnected) return;
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() > 0.8 && bolts.length < 3) {
            bolts.push(new Bolt());
        }

        bolts = bolts.filter(b => b.life > 0);
        bolts.forEach(b => {
            b.update();
            b.draw();
        });
        ctx.shadowBlur = 0;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}

/**
 * Airstream particles effect for ship visualization
 */
export function initAirstream() {
    const canvas = $('airstream-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const numParticles = 50;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * -canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = Math.random() * 2 + 1;
            this.life = Math.random() * 50 + 20;
            this.initialLife = this.life;
            this.color = Math.random() > 0.5 ? 'rgba(0, 255, 255,' : 'rgba(255, 255, 240,';
        }

        update() {
            this.life--;
            if (this.life <= 0) {
                this.reset();
            }
            this.x += this.vx;
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 15, this.y);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `${this.color} ${this.life / this.initialLife})`;
            ctx.stroke();
        }
    }

    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        if (!canvas.isConnected) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    createParticles();
    animate();
}

/**
 * Atom decay effect in radiation chamber
 */
export function initAtomDecayEffect() {
    const chamber = document.querySelector('.fuse-box-panel');
    if (!chamber) return;

    const numAtoms = 30;
    const colors = ['atom-yellow', 'atom-yellow', 'atom-yellow'];

    for (let i = 0; i < numAtoms; i++) {
        const atom = document.createElement('div');
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        atom.className = `atom-decay ${colorClass}`;
        atom.style.top = `${Math.random() * 100}%`;
        atom.style.left = `${Math.random() * 100}%`;
        atom.style.animationDelay = `${Math.random() * -3}s`;
        atom.style.animationDuration = `${Math.random() * 2 + 2}s`;
        chamber.appendChild(atom);
    }
}

/**
 * Photon bursts effect in radiation chamber
 */
export function initPhotonBurstsEffect() {
    const chamber = document.querySelector('.fuse-box-panel');
    if (!chamber) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'photon-bursts-canvas';
    canvas.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-[4]';
    chamber.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let bursts = [];
    const particleColors = ['rgba(255, 255, 0,'];

    const resizeCanvas = () => {
        canvas.width = chamber.clientWidth;
        canvas.height = chamber.clientHeight;
    };

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = randRange(30, 60);
            this.maxLife = this.life;
            this.color = color;
        }

        update() {
            this.life--;
            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color}${this.life / this.maxLife * 0.9})`;
            ctx.fill();
        }
    }

    class Burst {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.particles = [];
            this.life = 60;
            const color = particleColors[0];
            const numParticles = randRange(10, 20);
            for (let i = 0; i < numParticles; i++) {
                this.particles.push(new Particle(this.x, this.y, color));
            }
        }

        update() {
            this.life--;
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.life > 0);
        }

        draw() {
            this.particles.forEach(p => p.draw());
        }
    }

    const animate = () => {
        if (!canvas.isConnected) return;
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() > 0.95 && bursts.length < 5) {
            bursts.push(new Burst());
        }

        bursts.forEach(b => {
            b.update();
            b.draw();
        });
        bursts = bursts.filter(b => b.life > 0 && b.particles.length > 0);
    };

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 0);
    animate();
}

/**
 * Initialize activity gauges (visual bars that animate)
 */
export function initializeActivityGauges() {
    const GAUGE_SEGMENTS = 15;
    const gaugeContainers = [
        { id: 'photons-activity-gauge', color: 'yellow' },
        { id: 'sun-activity-gauge', color: 'orange' },
        { id: 'substrate-activity-gauge', color: 'pink' },
        { id: 'lightyears-activity-gauge', color: 'cyan' },
    ];

    gaugeContainers.forEach(containerInfo => {
        const container = $(containerInfo.id);
        if (container) {
            container.innerHTML = '';
            if (containerInfo.id === 'sun-activity-gauge') {
                container.classList.add('flame-gauge');
            } else if (containerInfo.id === 'lightyears-activity-gauge') {
                container.classList.add('meteor-gauge');
            } else if (containerInfo.id === 'substrate-activity-gauge') {
                container.classList.add('electric-gauge');
                const canvas = document.createElement('canvas');
                canvas.id = 'substrate-canvas';
                container.appendChild(canvas);
            } else {
                for (let i = 0; i < GAUGE_SEGMENTS; i++) {
                    const segment = document.createElement('div');
                    segment.className = `gauge-segment ${containerInfo.color}`;
                    container.appendChild(segment);
                }
            }
        }
    });
}

/**
 * Update activity gauge animations
 */
export function updateActivityGauges() {
    const segments = document.querySelectorAll('.gauge-segment');
    segments.forEach(segment => {
        const randomHeight = Math.random() * 100;
        const randomOpacity = 0.5 + Math.random() * 0.5;
        segment.style.height = `${randomHeight}%`;
        segment.style.opacity = randomOpacity;
    });
}
