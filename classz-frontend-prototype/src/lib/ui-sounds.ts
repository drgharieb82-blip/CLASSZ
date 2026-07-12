import { useMemo } from "react";
import { Howl } from "howler";
import { useApp } from "@/lib/app-context";

export type UiSoundKind = "hover" | "click" | "success" | "error";

type SoundNote = {
  frequency: number;
  durationMs: number;
  amplitude?: number;
};

const SAMPLE_RATE = 22050;
const SOUND_SCORES: Record<UiSoundKind, SoundNote[]> = {
  hover: [{ frequency: 880, durationMs: 42, amplitude: 0.14 }],
  click: [{ frequency: 660, durationMs: 58, amplitude: 0.2 }],
  success: [
    { frequency: 523.25, durationMs: 72, amplitude: 0.16 },
    { frequency: 659.25, durationMs: 82, amplitude: 0.18 },
    { frequency: 783.99, durationMs: 110, amplitude: 0.2 },
  ],
  error: [
    { frequency: 440, durationMs: 100, amplitude: 0.16 },
    { frequency: 349.23, durationMs: 120, amplitude: 0.14 },
  ],
};

const soundCache = new Map<UiSoundKind, Howl>();

function clampAmplitude(value: number) {
  return Math.max(0, Math.min(1, value));
}

function buildToneDataUrl(notes: SoundNote[]) {
  const samples = notes.flatMap((note) => {
    const totalSamples = Math.max(1, Math.round((note.durationMs / 1000) * SAMPLE_RATE));
    const amplitude = clampAmplitude(note.amplitude ?? 0.16);
    const attackSamples = Math.max(1, Math.floor(totalSamples * 0.08));
    const releaseSamples = Math.max(1, Math.floor(totalSamples * 0.18));
    const values = new Float32Array(totalSamples);

    for (let index = 0; index < totalSamples; index += 1) {
      const time = index / SAMPLE_RATE;
      const envelope =
        index < attackSamples
          ? index / attackSamples
          : index > totalSamples - releaseSamples
            ? Math.max(0, (totalSamples - index) / releaseSamples)
            : 1;
      values[index] = Math.sin(2 * Math.PI * note.frequency * time) * amplitude * envelope;
    }

    return Array.from(values);
  });

  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;

  const writeString = (text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
    offset += text.length;
  };

  writeString("RIFF");
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, SAMPLE_RATE, true);
  offset += 4;
  view.setUint32(offset, SAMPLE_RATE * 2, true);
  offset += 4;
  view.setUint16(offset, 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString("data");
  view.setUint32(offset, dataSize, true);
  offset += 4;

  samples.forEach((sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  });

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  const base64 = typeof window === "undefined" ? Buffer.from(binary, "binary").toString("base64") : window.btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

function getSound(kind: UiSoundKind) {
  const cached = soundCache.get(kind);
  if (cached) return cached;

  const sound = new Howl({
    src: [buildToneDataUrl(SOUND_SCORES[kind])],
    volume: kind === "success" ? 0.18 : kind === "error" ? 0.16 : 0.12,
    preload: true,
    html5: false,
  });

  soundCache.set(kind, sound);
  return sound;
}

export function useUiSounds() {
  const { uiSoundsEnabled } = useApp();

  return useMemo(() => {
    const play = (kind: UiSoundKind) => {
      if (!uiSoundsEnabled || typeof window === "undefined") return;
      const sound = getSound(kind);
      if (sound.playing()) {
        sound.stop();
      }
      sound.play();
    };

    return {
      enabled: uiSoundsEnabled,
      playHover: () => play("hover"),
      playClick: () => play("click"),
      playSuccess: () => play("success"),
      playError: () => play("error"),
    };
  }, [uiSoundsEnabled]);
}
