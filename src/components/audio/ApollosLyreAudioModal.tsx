"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Music,
  Radio,
  Sliders,
  Activity,
  Waves,
} from "lucide-react";

interface ApollosLyreAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeContextText?: string;
}

// 7 Classical Lyre strings (Heptachord of Apollo)
const LYRE_STRINGS = [
  { name: "Hypate", note: "D4", freq: 293.66, label: "Lowest" },
  { name: "Parhypate", note: "E4", freq: 329.63, label: "Near-Low" },
  { name: "Lichanos", note: "F4", freq: 349.23, label: "Forefinger" },
  { name: "Mese", note: "G4", freq: 392.0, label: "Central Pitch" },
  { name: "Paramese", note: "A4", freq: 432.0, label: "Veritas Drone" },
  { name: "Paranete", note: "C5", freq: 523.25, label: "Near-High" },
  { name: "Nete", note: "D5", freq: 587.33, label: "Highest" },
];

export function ApollosLyreAudioModal({
  isOpen,
  onClose,
  activeContextText = "",
}: ApollosLyreAudioModalProps) {
  const [isPlayingDrone, setIsPlayingDrone] = useState(false);
  const [isSonifying, setIsSonifying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [droneBaseFreq, setDroneBaseFreq] = useState(432); // 432 Hz Pythagorean A
  const [tempo, setTempo] = useState(140); // ms per data point
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const droneOsc1Ref = useRef<OscillatorNode | null>(null);
  const droneOsc2Ref = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sonifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 256;
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [volume]);

  // Handle master volume adjustments
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  // Pluck an individual Lyre string
  const pluckString = useCallback((freq: number, index: number) => {
    const ctx = getAudioContext();
    if (!masterGainRef.current) return;

    setActiveStringIndex(index);
    setTimeout(() => setActiveStringIndex(null), 300);

    const osc = ctx.createOscillator();
    const stringGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Physical pluck envelope: instantaneous strike + exponential decay
    stringGain.gain.setValueAtTime(0.001, ctx.currentTime);
    stringGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.015);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);

    osc.connect(stringGain);
    stringGain.connect(masterGainRef.current);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);
  }, [getAudioContext]);

  // Start / Stop Celestial Drone (432Hz dual oscillator with binaural detune)
  const toggleDrone = useCallback(() => {
    const ctx = getAudioContext();
    if (!masterGainRef.current) return;

    if (isPlayingDrone) {
      if (droneGainRef.current) {
        droneGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        setTimeout(() => {
          droneOsc1Ref.current?.stop();
          droneOsc2Ref.current?.stop();
          droneOsc1Ref.current?.disconnect();
          droneOsc2Ref.current?.disconnect();
          droneOsc1Ref.current = null;
          droneOsc2Ref.current = null;
        }, 300);
      }
      setIsPlayingDrone(false);
    } else {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(droneBaseFreq, ctx.currentTime);

      osc2.type = "triangle";
      // 1.5 Hz binaural detune for meditative calm
      osc2.frequency.setValueAtTime(droneBaseFreq + 1.5, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.8);

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(masterGainRef.current);

      osc1.start();
      osc2.start();

      droneOsc1Ref.current = osc1;
      droneOsc2Ref.current = osc2;
      droneGainRef.current = droneGain;
      setIsPlayingDrone(true);
    }
  }, [getAudioContext, isPlayingDrone, droneBaseFreq]);

  // Data Sonification: Parse numbers from active context or generate harmonic telemetry series
  const startSonification = useCallback(() => {
    if (isSonifying) {
      if (sonifyTimeoutRef.current) clearTimeout(sonifyTimeoutRef.current);
      setIsSonifying(false);
      return;
    }

    // Extract numbers from document or default to golden ratio sequence
    const numberMatches = activeContextText.match(/-?\d+(\.\d+)?/g);
    let dataPoints: number[] = [];
    if (numberMatches && numberMatches.length >= 4) {
      dataPoints = numberMatches.slice(0, 32).map((n) => Math.abs(parseFloat(n)));
    } else {
      // Default harmonic fibonacci / golden series
      dataPoints = [1, 2, 3, 5, 8, 13, 21, 34, 55, 34, 21, 13, 8, 5, 3, 2, 1];
    }

    const minVal = Math.min(...dataPoints);
    const maxVal = Math.max(...dataPoints);
    const range = maxVal - minVal || 1;

    setIsSonifying(true);
    let step = 0;

    const playNextStep = () => {
      if (step >= dataPoints.length) {
        setIsSonifying(false);
        return;
      }

      const val = dataPoints[step];
      const norm = (val - minVal) / range; // 0..1
      const stringIdx = Math.min(
        LYRE_STRINGS.length - 1,
        Math.floor(norm * LYRE_STRINGS.length)
      );

      pluckString(LYRE_STRINGS[stringIdx].freq, stringIdx);
      step++;

      sonifyTimeoutRef.current = setTimeout(playNextStep, tempo);
    };

    playNextStep();
  }, [isSonifying, activeContextText, tempo, pluckString]);

  // Waveform oscilloscope drawing loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const renderWave = () => {
      if (!running) return;

      const analyser = analyserRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep celestial grid background
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idling harmonic sine wave
        const time = Date.now() * 0.003;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.03 + time) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen]);

  // Cleanup on modal close or unmount
  useEffect(() => {
    return () => {
      if (sonifyTimeoutRef.current) clearTimeout(sonifyTimeoutRef.current);
      if (droneOsc1Ref.current) {
        try {
          droneOsc1Ref.current.stop();
          droneOsc2Ref.current?.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-inner">
              🎵
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-wide font-sans">
                  Apollo&apos;s Lyre & Data Sonifier
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  Harmonic Audio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pythagorean 432 Hz resonance & real-time telemetry soundscapes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingDrone) toggleDrone();
              if (isSonifying) startSonification();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Oscilloscope Waveform Monitor */}
          <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                CELESTIAL HARMONIC OSCILLOSCOPE
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {isPlayingDrone ? `${droneBaseFreq} Hz PURE DRONE ACTIVE` : isSonifying ? "SONIFYING RUNNING" : "STANDBY"}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={560}
              height={90}
              className="w-full h-24 rounded bg-slate-950/80"
            />
          </div>

          {/* Heptachord Lyre Strings (Interactive Plucking) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                The Seven Sacred Strings (Heptachord)
              </label>
              <span className="text-[11px] text-slate-400">Tap or click strings to strike</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {LYRE_STRINGS.map((str, idx) => {
                const isActive = activeStringIndex === idx;
                return (
                  <button
                    key={str.name}
                    onClick={() => pluckString(str.freq, idx)}
                    className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                      isActive
                        ? "bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/40"
                    }`}
                  >
                    <div
                      className={`w-1 rounded-full mb-2 transition-all ${
                        isActive ? "h-12 bg-amber-400 shadow-md shadow-amber-400" : "h-10 bg-slate-600"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-200 font-mono">{str.note}</span>
                    <span className="text-[9px] text-slate-400 truncate w-full text-center">{str.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine Modes: Sonifier & 432 Hz Drone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Data Sonifier */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-slate-200">Data Sonification Scan</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Translates numbers and numerical points in your active document into an acoustic melody.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={startSonification}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                    isSonifying
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                  }`}
                >
                  {isSonifying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Scan
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Sonify Document
                    </>
                  )}
                </button>
                <button
                  onClick={() => setTempo((t) => (t === 140 ? 80 : t === 80 ? 220 : 140))}
                  className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono hover:text-white border border-slate-700/60"
                  title="Toggle sonification tempo: Fast (80ms), Balanced (140ms), Adagio (220ms)"
                >
                  {tempo}ms
                </button>
              </div>
            </div>

            {/* Mode 2: 432 Hz Focus Drone */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-slate-200">Pythagorean Veritas Drone</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Continuous dual binaural oscillation tuned to {droneBaseFreq} Hz for deep concentration.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDrone}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                    isPlayingDrone
                      ? "bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  }`}
                >
                  {isPlayingDrone ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Drone
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Start {droneBaseFreq}Hz Drone
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDroneBaseFreq((f) => (f === 432 ? 528 : 432))}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white"
                  title="Switch between 432Hz (Veritas) and 528Hz (Solfeggio Transformation)"
                >
                  {droneBaseFreq}Hz
                </button>
              </div>
            </div>
          </div>

          {/* Volume and Audio Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(parseFloat(e.target.value));
                  }}
                  className="w-24 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                {isMuted ? "MUTED" : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Web Audio Engine • Zero Latency
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
