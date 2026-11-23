"""Generate original, copyright-free music beds for the shorts.

Run:  python3 scripts/make_music.py
Out:  public/music/<name>.wav  (60 s, loops cleanly at bar boundaries)

Every note is synthesized here, so there is nothing to license or claim.
"""
import os
import subprocess
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "music")
rng = np.random.default_rng(7)

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name: str) -> float:
    """'A3' -> 220.0"""
    pitch, octave = name[:-1], int(name[-1])
    midi = NOTE[pitch] + (octave + 1) * 12
    return 440.0 * 2 ** ((midi - 69) / 12)


def piano(f: float, dur: float, vel: float = 0.6) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    tone = np.zeros_like(t)
    for k in range(1, 9):
        amp = 1 / k ** 1.4
        decay = np.exp(-t * (1.2 + 0.9 * k))
        tone += amp * decay * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t)
    attack = np.minimum(1, t / 0.006)
    hammer = rng.normal(0, 0.02, len(t)) * np.exp(-t * 60)
    return vel * (tone * attack + hammer)


def pad(freqs, dur: float, vel: float = 0.12) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    sig = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.003 * t) for f in freqs)
    return vel * env * sig / len(freqs)


def kick(vel: float = 0.5) -> np.ndarray:
    t = np.arange(int(SR * 0.3)) / SR
    f = 110 * np.exp(-t * 18) + 40
    return vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)


def place(buf: np.ndarray, sig: np.ndarray, at: float):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def reverb(x: np.ndarray, seconds: float = 2.6, wet: float = 0.28) -> np.ndarray:
    n = int(SR * seconds)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / SR * (6.9 / seconds))
    ir = sosfilt(butter(2, 4500, "low", fs=SR, output="sos"), ir)
    ir /= np.abs(ir).sum() ** 0.5 * 30
    wet_sig = fftconvolve(x, ir)[: len(x)]
    return (1 - wet) * x + wet * wet_sig / (np.abs(wet_sig).max() + 1e-9) * np.abs(x).max()


def song(name, chords, bpm, pattern, total=60.0, drums=False, pad_from_bar=0, mood_bass=True):
    beat = 60 / bpm
    bar = beat * 4
    bars = int(total // bar)
    total = bars * bar
    buf = np.zeros(int(SR * (total + 3)))
    for b in range(bars):
        chord = chords[b % len(chords)]
        t0 = b * bar
        notes = [hz(n) for n in chord]
        if mood_bass:
            place(buf, piano(notes[0] / 2, bar + 1, 0.45), t0)
        if b >= pad_from_bar:
            place(buf, pad(notes, bar + 0.6), t0)
        steps = len(pattern)
        for s, idx in enumerate(pattern):
            if idx is None:
                continue
            octave_up = 2 if idx >= len(notes) else 1
            f = notes[idx % len(notes)] * octave_up
            vel = 0.32 if s % (steps // 4) == 0 else 0.22
            place(buf, piano(f, 2.5, vel), t0 + s * bar / steps)
        if drums and b >= 4:
            for q in range(4):
                place(buf, kick(0.35 if q % 2 == 0 else 0.18), t0 + q * beat)
    buf = buf[: int(SR * total)]
    # soft fade at the very end only; the loop point stays musical
    fade = int(SR * 1.5)
    buf[-fade:] *= np.linspace(1, 0, fade)
    buf = reverb(buf)
    buf /= np.abs(buf).max() * 1.12
    raw = os.path.join(OUT, f"_{name}.wav")
    import wave
    with wave.open(raw, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())
    final = os.path.join(OUT, f"{name}.mp3")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", "loudnorm=I=-18:TP=-1.5", "-ar", str(SR), "-ac", "2", final], check=True)
    os.remove(raw)
    print("wrote", final, f"{total:.1f}s")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    arp8 = [0, 1, 2, 3, 2, 1, 0, 2]
    arp16 = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 2, 5, 3, 1]
    pulse = [0, None, 0, None, 0, None, 2, None, 0, None, 0, None, 1, None, 2, None]
    # 1) reflective — the default for discipline / overthinking stories
    song("reflective-piano", [["A3", "C4", "E4", "A4"], ["F3", "A3", "C4", "F4"], ["C4", "E4", "G4", "C5"], ["G3", "B3", "D4", "G4"]], 72, arp8, pad_from_bar=2)
    # 2) rising — uplifting, for wins / "the doer made it"
    song("rising-hope", [["C4", "E4", "G4", "C5"], ["G3", "B3", "D4", "G4"], ["A3", "C4", "E4", "A4"], ["F3", "A3", "C4", "F4"]], 92, arp16, drums=True, pad_from_bar=4)
    # 3) tense — for loss / fake friends / debt stories
    song("tense-pulse", [["D3", "F3", "A3", "D4"], ["A#2", "D3", "F3", "A#3"], ["G2", "A#2", "D3", "G3"], ["A2", "C#3", "E3", "A3"]], 100, pulse, pad_from_bar=0)
