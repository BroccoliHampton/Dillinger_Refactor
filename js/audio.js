// ===========================================
// AUDIO MANAGER (Tone.js)
// ===========================================

import { TRACK_NAMES } from './config.js';

/**
 * AudioManager handles all game audio using Tone.js
 */
export class AudioManager {
    constructor() {
        this.soundsReady = false;
        this.isPlaying = false;
        this.isMusicMuted = false;
        this.isSfxMuted = false;
        this.currentTrackIndex = 2;
        
        // Synths for sound effects
        this.synth = null;
        this.metalSynth = null;
        this.errorSynth = null;
        
        // Music tracks
        this.musicTracks = [];
        this.trackNames = TRACK_NAMES;
    }

    async initialize() {
        if (this.soundsReady || typeof Tone === 'undefined') return;
        
        await Tone.start();
        
        // Initialize sound effect synths
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        
        this.metalSynth = new Tone.MetalSynth({
            frequency: 50,
            envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
        
        this.errorSynth = new Tone.MonoSynth({
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.2, release: 0.2 }
        }).toDestination();

        // Initialize music tracks
        this._initializeMusicTracks();

        // Setup transport
        Tone.Transport.bpm.value = 160;
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = '16m';
        
        // Start with default track
        this.musicTracks[this.currentTrackIndex].forEach(seq => seq.start(0));
        Tone.Transport.start();
        
        this.isPlaying = true;
        this.soundsReady = true;
        console.log("Audio context started.");
    }

    _initializeMusicTracks() {
        // Shared effects
        const reverb = new Tone.Reverb(6).toDestination();
        const delay = new Tone.FeedbackDelay("8n", 0.7).connect(reverb);

        // Track 1: "Outlaw Radio"
        this.musicTracks.push(this._createTrack1());
        
        // Track 2: "Stardust Echoes"
        this.musicTracks.push(this._createTrack2(delay, reverb));
        
        // Track 3: "Void Drifter"
        this.musicTracks.push(this._createTrack3(delay, reverb));
        
        // Track 4: "Red Alert"
        this.musicTracks.push(this._createTrack4());
        
        // Track 5: "Distress Signal"
        this.musicTracks.push(this._createTrack5());
    }

    _createTrack1() {
        const kick = new Tone.MembraneSynth({
            pitchDecay: 0.02,
            octaves: 6,
            envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.8 }
        }).toDestination();
        kick.volume.value = -4;

        const snare = new Tone.NoiseSynth({
            noise: { type: 'white', playbackRate: 2 },
            envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
        }).toDestination();
        snare.volume.value = -9;

        const bass = new Tone.MonoSynth({
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.01, decay: 0.1, release: 0.2, sustain: 0.1 },
            filter: { Q: 4, type: 'lowpass', frequency: 600, rolloff: -24 },
            filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, baseFrequency: 200, octaves: 2 }
        }).toDestination();
        bass.volume.value = -8;

        const distortion = new Tone.Distortion(0.7).toDestination();
        const lead = new Tone.MonoSynth({
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
        }).connect(distortion);
        lead.volume.value = -20;

        const leadPart = new Tone.Part((time, value) => {
            lead.triggerAttackRelease(value.note, value.duration, time);
        }, [
            { time: '0:0', note: 'G4', duration: '16n' }, { time: '0:0:2', note: 'C5', duration: '16n' },
            { time: '0:1', note: 'D#5', duration: '16n' }, { time: '0:1:2', note: 'C5', duration: '16n' },
            { time: '0:2', note: 'G4', duration: '16n' }, { time: '0:2:2', note: 'C5', duration: '16n' },
            { time: '0:3', note: 'D#5', duration: '16n' }, { time: '0:3:2', note: 'C5', duration: '16n' },
            { time: '1:0', note: 'G4', duration: '16n' }, { time: '1:0:2', note: 'C5', duration: '16n' },
            { time: '1:1', note: 'D#5', duration: '16n' }, { time: '1:1:2', note: 'C5', duration: '16n' },
            { time: '1:2', note: 'A#4', duration: '16n' }, { time: '1:2:2', note: 'C5', duration: '16n' },
            { time: '1:3', note: 'G4', duration: '16n' },
            { time: '2:0', note: 'G4', duration: '16n' }, { time: '2:0:2', note: 'B4', duration: '16n' },
            { time: '2:1', note: 'D5', duration: '16n' }, { time: '2:1:2', note: 'B4', duration: '16n' },
            { time: '2:2', note: 'G4', duration: '16n' }, { time: '2:2:2', note: 'B4', duration: '16n' },
            { time: '2:3', note: 'D5', duration: '16n' }, { time: '2:3:2', note: 'B4', duration: '16n' },
            { time: '3:0', note: 'G4', duration: '16n' }, { time: '3:0:2', note: 'B4', duration: '16n' },
            { time: '3:1', note: 'D5', duration: '16n' }, { time: '3:1:2', note: 'B4', duration: '16n' },
            { time: '3:2', note: 'F#5', duration: '8n' }, { time: '3:3', note: 'D5', duration: '16n' },
            { time: '4:0', note: 'Ab4', duration: '16n' }, { time: '4:0:2', note: 'C5', duration: '16n' },
            { time: '4:1', note: 'F5', duration: '16n' }, { time: '4:1:2', note: 'C5', duration: '16n' },
            { time: '4:2', note: 'Ab4', duration: '16n' }, { time: '4:2:2', note: 'C5', duration: '16n' },
            { time: '4:3', note: 'F5', duration: '16n' }, { time: '4:3:2', note: 'C5', duration: '16n' },
            { time: '5:2', note: 'G5', duration: '8n' },
            { time: '6:0', note: 'G4', duration: '16n' }, { time: '6:0:2', note: 'A#4', duration: '16n' },
            { time: '6:1', note: 'D#5', duration: '16n' }, { time: '6:1:2', note: 'A#4', duration: '16n' },
            { time: '7:0', note: 'G4', duration: '8n' }, { time: '7:1', note: 'A#4', duration: '8n' },
            { time: '7:2', note: 'C5', duration: '8n' }, { time: '7:3', note: 'D5', duration: '8n' },
            { time: '8:0', note: 'D#5', duration: '4n' }, { time: '8:2', note: 'D5', duration: '4n' },
            { time: '9:0', note: 'C5', duration: '2n' }
        ]);
        leadPart.loop = true;
        leadPart.loopEnd = '10m';

        return [
            new Tone.Sequence((time, note) => {
                bass.triggerAttackRelease(note, '16n', time);
            }, ['G1', ['G#1', 'G1'], 'G1', null, 'G1', null, ['A#1', 'G1'], null, 'C2', null, 'C2', null, 'C2', ['C2', 'A#1'], 'G1', null], '8n'),
            new Tone.Sequence((time, note) => {
                kick.triggerAttackRelease(note, '8n', time);
            }, ['C1', null, [null, 'C1'], 'C1', null, 'C1', [null, 'C1'], null], '8n'),
            new Tone.Sequence((time) => {
                snare.triggerAttack(time);
            }, [null, 'C2', null, 'C2', 'C2', null, ['C2', 'C2'], 'C2'], '8n'),
            leadPart
        ];
    }

    _createTrack2(delay, reverb) {
        const pad = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 1.5,
            envelope: { attack: 4, decay: 0.1, sustain: 0.2, release: 5 },
            oscillator: { type: 'sine' },
            modulation: { type: 'sawtooth' }
        }).connect(delay);
        pad.volume.value = -10;

        const bass = new Tone.MonoSynth({
            oscillator: { type: 'pulse', width: 0.4 },
            envelope: { attack: 0.1, decay: 0.3, release: 2 },
            filter: { type: 'lowpass', frequency: 800 },
            filterEnvelope: { attack: 0.2, decay: 0.2, baseFrequency: 200, octaves: 3 }
        }).toDestination();
        bass.volume.value = -8;

        const arp = new Tone.FMSynth({
            harmonicity: 2,
            modulationIndex: 5,
            envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
        }).connect(delay);
        arp.volume.value = -22;

        return [
            new Tone.Sequence((time, note) => {
                pad.triggerAttackRelease(note, '4m', time);
            }, [['C3', 'G3', 'D#4'], ['G#2', 'D#3', 'A#3'], ['D#3', 'A#3', 'F4'], ['A#2', 'F3', 'C4'], ['C3', 'G3', 'D#4'], ['G#2', 'D#3', 'A#3'], ['F3', 'C4', 'G4'], ['A#2', 'F3', 'C4']], '2m'),
            new Tone.Sequence((time, note) => {
                bass.triggerAttackRelease(note, '2n', time);
            }, ['C1', null, 'G#1', null, 'D#1', null, 'A#1', null, 'C1', null, 'G#1', null, 'F1', null, 'A#1', null], '1m'),
            new Tone.Sequence((time, note) => {
                arp.triggerAttackRelease(note, '16n', time);
            }, [['C5', 'D#5', 'G5', 'A#5'], null, ['G#4', 'C5', 'D#5', 'F5'], null, ['F5', 'G5', 'A#5', 'C6'], null, ['A#4', 'C5', 'D#5', 'F5'], null], '2n')
        ];
    }

    _createTrack3(delay, reverb) {
        const arp = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 10,
            detune: 0,
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.5 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
        }).connect(delay);
        arp.volume.value = -18;

        const bass = new Tone.MonoSynth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.1, decay: 0.3, release: 2 },
            filter: { type: 'lowpass', frequency: 400 },
            filterEnvelope: { attack: 0.5, decay: 0.2, baseFrequency: 150, octaves: 3 }
        }).toDestination();
        bass.volume.value = -8;

        const choir = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 1.01,
            envelope: { attack: 3, release: 3 },
            oscillator: { type: 'sine' },
            modulation: { type: 'sawtooth' }
        }).connect(reverb);
        choir.volume.value = -20;

        return [
            new Tone.Sequence((time, note) => {
                arp.triggerAttackRelease(note, '16n', time);
            }, ['C4', 'D#4', 'G4', 'A#4', 'C5', 'A#4', 'G4', 'D#4', 'C4', 'D#4', 'G4', 'A#4', 'D5', 'A#4', 'G4', 'D#4'], '8n'),
            new Tone.Sequence((time, note) => {
                bass.triggerAttackRelease(note, '1m', time);
            }, ['C1', 'G#0', 'D#1', 'A#0', 'F1', 'C1', 'G1', 'A#0'], '1m'),
            new Tone.Sequence((time, note) => {
                choir.triggerAttackRelease(note, '4m', time);
            }, [['G4', 'C5'], ['G#4', 'D#5'], ['D#4', 'A#4'], ['F4', 'C5']], '1m')
        ];
    }

    _createTrack4() {
        const kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();
        kick.volume.value = -6;

        const alarm = new Tone.DuoSynth({
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: {
                volume: -10,
                portamento: 0,
                oscillator: { type: "square" },
                filterEnvelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 },
                envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 }
            },
            voice1: {
                volume: -10,
                portamento: 0,
                oscillator: { type: "square" },
                filterEnvelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 },
                envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 }
            }
        }).toDestination();
        alarm.volume.value = -15;

        const sub = new Tone.MonoSynth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 }
        }).toDestination();
        sub.volume.value = -10;

        return [
            new Tone.Sequence((time, note) => {
                kick.triggerAttackRelease(note, "8n", time);
            }, ['C1', null, 'C1', ['C1', 'C1'], 'C1', null, 'C1', null], "8n"),
            new Tone.Sequence((time, note) => {
                alarm.triggerAttackRelease(note, "8n", time);
            }, [['G5', 'G#5'], null, null, null, ['G5', 'G#5'], null, ['G5', 'G#5'], null], '4n'),
            new Tone.Sequence((time, note) => {
                sub.triggerAttackRelease(note, '16n', time);
            }, ['C2', 'C#2', 'D2', 'D#2', 'C2', 'C#2', 'D2', 'D#2'], '4n')
        ];
    }

    _createTrack5() {
        const distressFilter = new Tone.AutoFilter("4n").toDestination().start();
        const distressDelay = new Tone.FeedbackDelay("8n", 0.8).connect(distressFilter);
        const distressDistortion = new Tone.Distortion(0.9).connect(distressDelay);
        
        const voice = new Tone.FMSynth({
            harmonicity: 1.2,
            modulationIndex: 14,
            oscillator: { type: "sine" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.1, release: 0.8 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.2, decay: 0.1, sustain: 0.3, release: 0.8 }
        }).connect(distressDistortion);
        voice.volume.value = -22;

        return [
            new Tone.Sequence((time, note) => {
                voice.triggerAttackRelease(note, "4n", time);
                voice.modulationIndex.rampTo(Math.random() * 20 + 5, 0.1);
            }, ['C3', null, null, 'D#3', null, 'C3', null, 'D#3', 'A#2', null, 'G2', null, 'A#2', null, 'D#3', null, 'C3', null, null, 'D#3', 'D#3', null, null, 'C3'], '2n')
        ];
    }

    // ================
    // SOUND EFFECTS
    // ================

    playClick() {
        if (!this.soundsReady || this.isSfxMuted) return;
        this.synth.triggerAttackRelease("C4", "8n");
    }

    playCraft() {
        if (!this.soundsReady || this.isSfxMuted) return;
        this.metalSynth.triggerAttackRelease("C2", "4n", Tone.now(), 0.8);
    }

    playSuccess() {
        if (!this.soundsReady || this.isSfxMuted) return;
        const now = Tone.now();
        this.synth.triggerAttackRelease(["C5", "E5", "G5"], "16n", now);
    }

    playError() {
        if (!this.soundsReady || this.isSfxMuted) return;
        this.errorSynth.triggerAttackRelease("G#2", "8n");
    }

    playEncounterAlert() {
        if (!this.soundsReady || this.isSfxMuted) return;
        const now = Tone.now();
        this.synth.triggerAttackRelease("A4", "16n", now);
        this.synth.triggerAttackRelease("A4", "16n", now + 0.1);
    }

    // ================
    // TRACK MANAGEMENT
    // ================

    setTrack(trackIndex) {
        if (!this.soundsReady || trackIndex === this.currentTrackIndex) return;
        
        this.musicTracks[this.currentTrackIndex].forEach(seq => seq.stop(0));
        this.currentTrackIndex = trackIndex;
        this.musicTracks[this.currentTrackIndex].forEach(seq => seq.start(0));
    }

    // ================
    // MUTE CONTROLS
    // ================

    toggleMusicMute() {
        if (!this.soundsReady) return;
        this.isMusicMuted = !this.isMusicMuted;
        Tone.Destination.mute = this.isMusicMuted;
        return this.isMusicMuted;
    }

    toggleSfxMute() {
        this.isSfxMuted = !this.isSfxMuted;
        // Play feedback sound (always, to confirm the toggle)
        if (this.soundsReady) {
            this.synth.triggerAttackRelease("C4", "8n");
        }
        return this.isSfxMuted;
    }
}
