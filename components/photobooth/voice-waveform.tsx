"use client";

import React, { useEffect, useRef } from "react";

interface VoiceWaveformVisualizerProps {
  stream?: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

function drawRoundedPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  }
}

export function VoiceWaveformVisualizer({
  stream,
  isRecording,
  className = "w-full h-8",
}: VoiceWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;

    // Initialize Web Audio API for real microphone frequency capture
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioContextClass && stream && stream.active) {
        audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") {
          audioContext.resume().catch(() => {});
        }
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // 32 frequency buckets
        analyser.smoothingTimeConstant = 0.76;
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (err) {
      console.warn("AudioContext not accessible, using fallback waveform:", err);
    }

    const barCount = 18;
    const currentHeights: number[] = new Array(barCount).fill(4);
    const startTime = performance.now();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
      const targetHeight = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      let hasRealAudio = false;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        if (sum > 10) hasRealAudio = true;
      }

      const elapsed = (performance.now() - startTime) * 0.001;

      const barWidth = 3;
      const totalBarWidth = barCount * barWidth;
      const gap = Math.max(2, (width - totalBarWidth) / (barCount + 1));

      // Crimson / Rose gradient matching recording theme
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#fca5a5"); // rose-300
      gradient.addColorStop(0.5, "#ef4444"); // red-500
      gradient.addColorStop(1, "#b91c1c"); // red-700

      ctx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        let targetRatio = 0.14;

        if (hasRealAudio && dataArray) {
          const binIndex = Math.floor((i / barCount) * (dataArray.length * 0.7));
          const freqValue = (dataArray[binIndex] || 0) / 255;
          const centerBoost = Math.sin((i / barCount) * Math.PI) * 0.3;
          targetRatio = Math.max(0.12, freqValue * 1.25 + centerBoost * freqValue);
        } else {
          // Dynamic procedural voice simulation when idle or speaking softly
          const w1 = Math.sin(elapsed * 5.2 + i * 0.55) * 0.35 + 0.45;
          const w2 = Math.cos(elapsed * 3.1 - i * 0.35) * 0.22;
          const centerWeight = Math.sin((i / barCount) * Math.PI);
          targetRatio = Math.max(0.14, (w1 + w2) * centerWeight * 0.9);
        }

        const targetPx = Math.max(4, targetRatio * (height - 6));
        currentHeights[i] += (targetPx - currentHeights[i]) * 0.38;

        const barH = currentHeights[i];
        const x = gap + i * (barWidth + gap);
        const y = (height - barH) / 2;

        drawRoundedPill(ctx, x, y, barWidth, barH, barWidth / 2);
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (source) {
        try {
          source.disconnect();
        } catch {}
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, [isRecording, stream]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label="Grafik Frekuensi Voice Note"
    />
  );
}
