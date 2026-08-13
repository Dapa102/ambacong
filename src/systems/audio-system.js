import pickupUrl from '../../assets/audio/sfx/ambil-barang.wav';
import inventoryUrl from '../../assets/audio/sfx/buka-inventori.wav';
import ghostNearUrl from '../../assets/audio/sfx/suara-hantu-dekat.ogg';
import ghostStepUrl from '../../assets/audio/sfx/langkah-hantu.wav';
import phoneRingUrl from '../../assets/audio/sfx/telpon-bunyi.ogg';
import phonePickupUrl from '../../assets/audio/sfx/suara-angkat-telpon.wav';
import bgmUrl from '../../assets/audio/music/backsound-game.ogg';

const AUDIO_PATHS = {
  pickup: pickupUrl,
  inventory: inventoryUrl,
  ghostNear: ghostNearUrl,
  ghostStep: ghostStepUrl,
  phoneRing: phoneRingUrl,
  phonePickup: phonePickupUrl,
  bgm: bgmUrl,
};

export class AudioSystem {
  constructor() {
    this.pool = new Map();
    this.masterVolume = 0.8;
    this.sfxVolume = 1;
    this.musicVolume = 0.45;
    this.ghostNearRange = 22;
  }

  get(name) {
    if (!this.pool.has(name)) {
      const audio = new Audio(AUDIO_PATHS[name]);
      audio.preload = name === 'bgm' ? 'none' : 'auto';
      audio.loop = name === 'bgm' || name === 'ghostNear' || name === 'phoneRing';
      this.pool.set(name, audio);
    }
    return this.pool.get(name);
  }

  play(name, volume = 1) {
    const audio = this.get(name);
    audio.volume = Math.min(1, Math.max(0, volume * this.sfxVolume * this.masterVolume));
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  startLoop(name, volume = 1) {
    const audio = this.get(name);
    audio.volume = Math.min(1, Math.max(0, volume * this.masterVolume));
    audio.loop = true;
    audio.play().catch(() => {});
  }

  setLoopVolume(name, volume) {
    const audio = this.get(name);
    audio.volume = Math.min(1, Math.max(0, volume * this.masterVolume));
  }

  stop(name) {
    const audio = this.pool.get(name);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  stopAll() {
    for (const name of this.pool.keys()) this.stop(name);
  }
}
