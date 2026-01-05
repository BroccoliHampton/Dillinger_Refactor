// ===========================================
// GAME CONFIGURATION & CONSTANTS
// ===========================================

export const GAME_CONFIG = {
    WIN_DISTANCE: 1000000,
    PHOTONS_DRIP_INTERVAL: 1000,
    MINING_INTERVAL: 5000,
    CRAFT_SAIL_COST: 250,
    CRAFT_BATTERY_COST: 5000,
    SAIL_MAX_DURABILITY: 100,
    SAIL_SLOTS: 8,
    CRAFT_COOLDOWN: 10,
    ENCOUNTER_TRIGGER_CHANCE: 0.75,
    GAUGE_SEGMENTS: 15,
};

export const MAP_DURATIONS = [330, 210, 150, 180, 90]; // 5.5, 3.5, 2.5, 3, 1.5 minutes

export const SYSTEM_NAMES = [
    "Orion's Anvil",
    "The Crimson Expanse",
    "Hyperion Reach",
    "Specter's Drift",
    "The Cygnus Forge",
    "Leviathan's Cradle"
];

export const MAP_NODES = {
    START: { x: 50, y: 350 },
    END: { x: 350, y: 50 }
};

export const SUN_INTENSITY = {
    MIN: 500000,
    MAX: 690000,
    INITIAL: 500000
};

export const ETH_PRICE = {
    MIN: 3000,
    MAX: 5000,
    INITIAL: 4000
};

export const THEMES = [
    { name: "STANDARD", color: "#00ff41", trackIndex: 2 },
    { name: "COMBAT", color: "#ff4100", trackIndex: 3 },
    { name: "STEALTH", color: "#00ffff", trackIndex: 4 },
    { name: "HAZARD", color: "#ffff00", trackIndex: 1 },
    { name: "OUTLAW", color: "#a855f7", trackIndex: 0 }
];

export const TARGET_DATA = {
    "STANDARD": { id: "UN-77-B", class: "Nebula Fragment", dist: "1.2 AU", signal: "Weak EM" },
    "COMBAT": { id: "HOSTILE-X1", class: "Pirate Fighter", dist: "0.4 AU", signal: "Weapons Hot" },
    "STEALTH": { id: "GHOST-SHIP", class: "Unknown", dist: "3.1 AU", signal: "Faint Echo" },
    "HAZARD": { id: "FIELD-A9", class: "Radiation Cloud", dist: "0.8 AU", signal: "High Gamma" },
    "OUTLAW": { id: "BLACK-MKT", class: "Smuggler's Den", dist: "4.3 AU", signal: "Encrypted Bid" }
};

export const SCANNER_TEXTS = [
    "SYSTEM SCAN: OK :: STARDIVE CORES: NOMINAL :: FUSION LEVELS: 98% :: DEFLECTOR SHIELDS: ONLINE :: TACHYON CANNONS: STANDBY",
    "DECRYPTING GHOST SIGNAL... :: SOURCE: VEGA-9 :: TYPE: HYPER-ENCRYPTED :: WARNING: POLICE TRACKER DETECTED",
    "MAINTENANCE CYCLE :: PLASMA CONDUITS: STABLE :: HULL INTEGRITY: 99.4% :: GRAVITON PLATING: 98.9% :: LIFE SUPPORT: OPTIMAL",
    "GALACTIC BOUNTY ALERT :: TARGET ID: DILLINGER :: PAYOUT: 1.5M CREDITS :: STATUS: ARMED & DANGEROUS :: NOTE: APPROACH WITH EXTREME CAUTION"
];

export const TRACK_NAMES = [
    "Outlaw Radio",
    "Stardust Echoes",
    "Void Drifter",
    "Red Alert",
    "Distress Signal"
];

export const ENCOUNTERS = [
    {
        name: "Corporate Interdictor",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.75,
        type: 'loss',
        minLy: 10000,
        maxLy: 25000,
        description: "Megacorp cruiser demands inspection. Reroute power to stealth field (RISK)?",
        successDescription: "With a surge of power to the stealth field, The Outrider vanishes from their scopes! The corporate pigs are left scanning empty space, another costly failure for their quarterly reports.",
        failureDescription: "The stealth field flickers and dies! The Interdictor's tractor beam locks on, and a hefty 'fine' is siphoned from your lightyear reserves. A costly encounter with corporate justice."
    },
    {
        name: "Derelict Freighter",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.50,
        type: 'gain',
        minLy: 15000,
        maxLy: 45000,
        description: "Unstable reactor, high-value cargo. Brave radiation to salvage (RISK)?",
        successDescription: "Navigating the sparking corridors, you grab the primary fusion cells just as the reactor goes critical! A clean getaway with a massive lightyear boost.",
        failureDescription: "A sudden radiation spike forces a hasty retreat! You escape with your life, but the salvage is lost to the void, along with the lightyears spent on the attempt."
    },
    {
        name: "The Ghost Market",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.40,
        type: 'mix',
        minLy: 5000,
        maxLy: 30000,
        description: "Shadowy dealer offers a 'jump drive shortcut.' Trap or huge payoff?",
        successDescription: "The dealer was legitimate! The 'shortcut' was a stable wormhole that propels you thousands of lightyears in an instant. The galaxy just got a little smaller.",
        failureDescription: "It was a trap! The 'shortcut' leads directly into a pirate ambush. You escape with heavy damage, losing precious lightyears to evasive maneuvers."
    },
    {
        name: "The Quantum Storm",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.30,
        type: 'gain',
        minLy: 30000,
        maxLy: 75000,
        description: "Wild anomaly rips open. Try to ride the current for a massive slingshot (HIGH RISK)?",
        successDescription: "Masterful piloting! The Outrider surfs the quantum wave, emerging light-years ahead of schedule. The crew celebrates a legendary feat of navigation.",
        failureDescription: "The storm is too powerful! The ship is tossed violently, and you emerge battered and disoriented, having lost significant ground."
    },
    {
        name: "Asteroid Belt Run",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.65,
        type: 'mix',
        minLy: 8000,
        maxLy: 20000,
        description: "Fast route through rock field. Dangerous maneuvering required.",
        successDescription: "You weave through the debris field like a phantom. The shortcut pays off, shaving precious time off your journey.",
        failureDescription: "A rogue asteroid clips a sail! You manage to stabilize, but the repairs cost you time and distance."
    },
    {
        name: "Civilian Distress Call",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.60,
        type: 'gain',
        minLy: 12000,
        maxLy: 40000,
        description: "Transport disabled but rigged to explode. Risk rescue for reward?",
        successDescription: "A daring rescue! You save the crew and they gratefully transfer their spare lightyear reserves to you before their ship goes supernova.",
        failureDescription: "It was a setup! The distress call was a lure by scavengers. You fight them off but lose lightyears in the skirmish."
    },
    {
        name: "Bounty Hunter Tracking",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.70,
        type: 'loss',
        minLy: 15000,
        maxLy: 35000,
        description: "Professional hunter closing. Use counter-measure or hide?",
        successDescription: "Your counter-measures work perfectly! The bounty hunter's tracking system is fried, and they fly right past, oblivious.",
        failureDescription: "The hunter is too good. They anticipate your move and force a long, costly chase before you can shake them."
    },
    {
        name: "Abandoned Orbital",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.55,
        type: 'gain',
        minLy: 10000,
        maxLy: 25000,
        description: "Silent station. Check for forgotten fuel cells.",
        successDescription: "Jackpot! The station's emergency power cells are still charged. You siphon their energy, gaining a significant lightyear boost.",
        failureDescription: "The station is a deathtrap. Automated defenses activate, forcing a rapid retreat. The risk was for nothing."
    },
    {
        name: "Engine Malfunction",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.70,
        type: 'loss',
        minLy: 5000,
        maxLy: 15000,
        description: "The Outrider's drives stutter. Attempt emergency field repairs under stress?",
        successDescription: "With sparks flying, you jury-rig a bypass and the engines roar back to life! Crisis averted with minimal distance lost.",
        failureDescription: "The repair fails! The engines sputter and die, forcing you to drift while you perform a full system reboot, losing valuable time and distance."
    },
    {
        name: "Signal Interception",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.60,
        type: 'gain',
        minLy: 15000,
        maxLy: 45000,
        description: "Intercepted massive data transfer. Decrypt route data for a shortcut?",
        successDescription: "The decryption is successful! You've uncovered a secret smuggler's route that bypasses police patrols, catapulting you forward.",
        failureDescription: "The data is a logic bomb! Your systems crash, and by the time they're back online, you've drifted far off course."
    },
    {
        name: "Vacuum Leak",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.90,
        type: 'loss',
        minLy: 1000,
        maxLy: 5000,
        description: "Minor hull breach on The Outrider. Divert power from life support to propulsion?",
        successDescription: "The patch holds! You managed to seal the breach without losing too much ground. A close call, but you're still on the run.",
        failureDescription: "The breach is worse than it looked! You have to divert significant power to life support, slowing your progress to a crawl."
    },
    {
        name: "Gravity Well Swing",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.55,
        type: 'gain',
        minLy: 20000,
        maxLy: 50000,
        description: "Heavy planet nearby. Attempt a precision gravity sling maneuver?",
        successDescription: "Perfect execution! The Outrider slingshots around the gas giant, gaining immense speed and leaving pursuers in the dust.",
        failureDescription: "You miscalculate the trajectory! The planet's gravity pulls you in too close, and you have to burn precious fuel to escape, losing significant distance."
    },
    {
        name: "Plasma Cloud",
        chance: 0.03,
        lyCost: 10000,
        winChance: 0.45,
        type: 'loss',
        minLy: 15000,
        maxLy: 40000,
        description: "Corrosive energy cloud. Boost The Outrider through before shields fail?",
        successDescription: "Shields hold just long enough! You punch through the cloud, emerging singed but having taken a valuable shortcut.",
        failureDescription: "The plasma eats through the shields! Your sails take direct damage, crippling your speed and forcing you to limp away."
    },
    {
        name: "Xenomorph Hive",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.30,
        type: 'loss',
        minLy: 40000,
        maxLy: 80000,
        description: "Hostile bioforms in abandoned habitat. Attempt a fast, dangerous purge?",
        successDescription: "You vent the main reactor coolant into the habitat, flash-freezing the aliens. A risky, but clean, escape.",
        failureDescription: "They're on the ship! You fight off the boarders, but the damage is extensive. The cost in lightyears is staggering."
    },
    {
        name: "Warp Gate Alignment",
        chance: 0.04,
        lyCost: 10000,
        winChance: 0.35,
        type: 'gain',
        minLy: 75000,
        maxLy: 150000,
        description: "Unstable Warp Gate found. Risk alignment for a huge jump?",
        successDescription: "The gate stabilizes for a split second, and you jump! The Outrider is flung across an entire sector, a massive gain.",
        failureDescription: "The gate collapses as you enter! You're violently shunted into an unknown, dangerous region, far from your intended path."
    },
];
