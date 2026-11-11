"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Battery,
  Zap,
  Cpu,
  Droplets,
  Volume2,
  Camera,
  Terminal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface SimulationProps {
  serviceId: string;
}


// ─── SPEAKER BARS — truly animated ────────────────────────────────────────────
function AnimatedEqBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NUM = 20;
    // Each bar has its own phase and speed
    const phases = Array.from({ length: NUM }, () => Math.random() * Math.PI * 2);
    const speeds = Array.from({ length: NUM }, () => 1.5 + Math.random() * 2.5);

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW = Math.floor(W / NUM) - 2;
      for (let i = 0; i < NUM; i++) {
        const pct = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(elapsed * speeds[i] + phases[i]));
        const barH = Math.max(4, pct * H);
        const x = i * (barW + 2);
        const y = H - barH;

        // Gradient per bar: cyan base → gold peak
        const grad = ctx.createLinearGradient(x, H, x, y);
        grad.addColorStop(0, "rgba(56,189,248,0.9)"); // cyan
        grad.addColorStop(0.5, "rgba(245,158,11,0.9)"); // amber
        grad.addColorStop(1, "rgba(254,240,138,1)"); // gold
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barW, barH, 2);
        } else {
          ctx.rect(x, y, barW, barH);
        }
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={56}
      className="w-full h-14 rounded-lg"
    />
  );
}

// ─── SOFTWARE TERMINAL — scrolling live lines ─────────────────────────────────
const TERMINAL_LINES = [
  { text: "> fastboot flash boot boot.img", color: "text-emerald-400" },
  { text: "  Sending 'boot' (65536 KB)...  OKAY", color: "text-slate-300" },
  { text: "> verifying RSA signatures...", color: "text-sky-300" },
  { text: "  verified partition 'boot' OK", color: "text-emerald-300" },
  { text: "> fastboot reboot-bootloader", color: "text-amber-300" },
  { text: "  OKAY [  0.012s]", color: "text-slate-300" },
  { text: "> rebuilding userdata & dalvik-cache", color: "text-purple-300" },
  { text: "  Wiping data... OKAY", color: "text-slate-300" },
  { text: "> BOOTLOADER RECOVERY: 100% COMPLETE", color: "text-emerald-400 font-bold" },
  { text: "  Device healthy. Handover safe.", color: "text-slate-300" },
];

function TerminalLines() {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setLineCount((prev) => (prev >= TERMINAL_LINES.length ? 1 : prev + 1));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const linesToRender = TERMINAL_LINES.slice(0, Math.max(1, Math.min(lineCount, TERMINAL_LINES.length)));

  return (
    <div className="bg-black/90 rounded-lg p-2 text-[9px] space-y-0.5 border border-white/5 h-16 overflow-hidden font-mono">
      {linesToRender.map((line, idx) => (
        <div
          key={idx}
          className={`${line?.color || "text-slate-300"} leading-tight`}
          style={{ animation: "fadeIn 0.3s ease-in" }}
        >
          {line?.text || ""}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ServiceSimulations({ serviceId }: SimulationProps) {
  // Screen scan progress
  const [screenProgress, setScreenProgress] = useState(0);
  useEffect(() => {
    if (serviceId !== "screen-replacement") return;
    const t = setInterval(() => setScreenProgress((p) => (p >= 100 ? 0 : p + 1.8)), 50);
    return () => clearInterval(t);
  }, [serviceId]);

  // Battery step cycle
  const [batteryStep, setBatteryStep] = useState<"degraded" | "extracting" | "replacing" | "restored">("restored");
  useEffect(() => {
    if (serviceId !== "battery-replacement") return;
    const steps: typeof batteryStep[] = ["restored", "degraded", "extracting", "replacing"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % steps.length; setBatteryStep(steps[i]); }, 2600);
    return () => clearInterval(t);
  }, [serviceId]);

  // Charging toggle
  const [charged, setCharged] = useState(true);
  const [chargeWatts, setChargeWatts] = useState(65);
  useEffect(() => {
    if (serviceId !== "charging-problem") return;
    const t = setInterval(() => {
      setCharged((c) => !c);
      setChargeWatts(55 + Math.floor(Math.random() * 15));
    }, 2800);
    return () => clearInterval(t);
  }, [serviceId]);

  // IC chip highlight
  const [activeChip, setActiveChip] = useState(0);
  useEffect(() => {
    if (serviceId !== "ic-pcb-repair") return;
    const t = setInterval(() => {
      setActiveChip((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(t);
  }, [serviceId]);

  // Water cleaning progress
  const [cleanPct, setCleanPct] = useState(0);
  useEffect(() => {
    if (serviceId !== "water-damage-repair") return;
    const t = setInterval(() => setCleanPct((p) => (p >= 100 ? 0 : p + 2.5)), 60);
    return () => clearInterval(t);
  }, [serviceId]);

  // Camera shutter animation
  const [aperture, setAperture] = useState(100);
  const [oisX, setOisX] = useState(0);
  const [oisY, setOisY] = useState(0);
  useEffect(() => {
    if (serviceId !== "camera-replacement") return;
    const t = setInterval(() => {
      setAperture((a) => (a <= 20 ? 100 : a - 10));
      setOisX(Math.sin(Date.now() / 500) * 4);
      setOisY(Math.cos(Date.now() / 700) * 3);
    }, 120);
    return () => clearInterval(t);
  }, [serviceId]);

  // ─── 1. SCREEN REPLACEMENT ───────────────────────────────────────────────
  if (serviceId === "screen-replacement") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 select-none">
        {/* New screen behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 flex items-center justify-center">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-white tracking-wider">120Hz AMOLED · Flawless</p>
            <p className="text-[9px] text-emerald-400 font-mono">0 Dead Pixels · Full Touch Response</p>
          </div>
        </div>

        {/* Cracked overlay, clipped by progress */}
        <div
          className="absolute inset-y-0 left-0 bg-slate-900 border-r-2 border-amber-400 overflow-hidden"
          style={{ width: `${100 - screenProgress}%`, transition: "width 0.05s linear" }}
        >
          <svg className="w-full h-full opacity-70" viewBox="0 0 200 100" preserveAspectRatio="none">
            <line x1="10" y1="20" x2="80" y2="70" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="80" y1="70" x2="160" y2="30" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="80" y1="70" x2="110" y2="95" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="30" y1="50" x2="80" y2="70" stroke="#ef4444" strokeWidth="1" />
            <line x1="130" y1="10" x2="160" y2="30" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="80" cy="70" r="14" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-[9px] text-red-300 font-mono">
            Cracked Display
          </div>
        </div>

        {/* Laser scan beam */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-400 via-white to-amber-400 shadow-gold-glow pointer-events-none"
          style={{ left: `${100 - screenProgress}%` }}
        />

        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/10 text-[9px] text-amber-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Precision Replacement Beam</span>
        </div>
      </div>
    );
  }

  // ─── 2. BATTERY REPLACEMENT ──────────────────────────────────────────────
  if (serviceId === "battery-replacement") {
    const pctMap = { degraded: 20, extracting: 20, replacing: 60, restored: 100 };
    const pct = pctMap[batteryStep];
    const colorMap = {
      degraded: "bg-red-500 animate-pulse",
      extracting: "bg-red-400",
      replacing: "bg-amber-500",
      restored: "bg-gradient-to-r from-emerald-500 to-green-400 shadow-sm shadow-emerald-400/30",
    };

    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-amber-400" />
            Li-ion Cell Health
          </span>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${batteryStep === "restored" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
            {batteryStep === "restored" ? "100% Zero-Cycle OEM" : batteryStep === "replacing" ? "INSTALLING..." : "54% — Needs Service"}
          </span>
        </div>

        {/* Battery bar */}
        <div className="relative h-14 w-full max-w-[200px] mx-auto rounded-xl border-2 border-slate-700 p-1 flex items-center bg-slate-900">
          <div
            className={`h-full rounded-lg transition-all duration-700 flex items-center justify-center ${colorMap[batteryStep]}`}
            style={{ width: `${pct}%` }}
          >
            <span className="text-[10px] font-black text-slate-950 px-1">
              {batteryStep === "restored" ? "100%" : batteryStep === "replacing" ? "INSTALL" : "CRITICAL"}
            </span>
          </div>
          {/* Positive terminal nub */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-slate-600 rounded-r-sm" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Capacity: {batteryStep === "restored" ? "4850 mAh" : "2100 mAh"}</span>
          <span className={batteryStep === "restored" ? "text-emerald-400" : "text-red-400"}>
            {batteryStep === "restored" ? "Thermal: Safe" : "Drain: Critical"}
          </span>
        </div>
      </div>
    );
  }

  // ─── 3. CHARGING PROBLEM ─────────────────────────────────────────────────
  if (serviceId === "charging-problem") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            USB-C Port Docking
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${charged ? "bg-sky-500/20 text-sky-400 border-sky-500/30" : "bg-slate-800 text-slate-400 border-white/10"}`}>
            {charged ? `${chargeWatts}W · Active` : "Aligning Pins..."}
          </span>
        </div>

        {/* Port + cable animation */}
        <div className="flex items-center justify-center gap-3 py-2">
          {/* Phone port */}
          <div className="w-20 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center relative">
            <div className="w-12 h-3.5 rounded-full bg-black border border-amber-500/40 flex items-center justify-center">
              <div className="w-8 h-1 bg-amber-400 rounded-full" />
            </div>
            <span className="absolute -bottom-3.5 text-[8px] text-slate-500 font-mono">USB-C PORT</span>
          </div>

          {/* Cable */}
          <div
            className="flex items-center transition-transform duration-500"
            style={{ transform: charged ? "translateX(0)" : "translateX(28px)", opacity: charged ? 1 : 0.5 }}
          >
            <div className="w-8 h-4 rounded-l bg-gradient-to-r from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
            </div>
            <div className="w-14 h-2.5 bg-slate-700 rounded-r" />
          </div>
        </div>

        {/* Power meter */}
        {charged && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-amber-400 rounded-full animate-pulse" style={{ width: `${(chargeWatts / 80) * 100}%` }} />
            </div>
            <span className="text-[9px] font-mono text-sky-400 shrink-0">{chargeWatts}W</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Voltage: {charged ? "9.1V / 3.3A" : "0.0V (Idle)"}</span>
          <span className={charged ? "text-emerald-400" : "text-amber-400"}>{charged ? "Pins: Clean" : "Debris Clear"}</span>
        </div>
      </div>
    );
  }

  // ─── 4. IC / PCB REPAIR ──────────────────────────────────────────────────
  if (serviceId === "ic-pcb-repair") {
    const chips = ["POWER IC", "BASEBAND", "AUDIO CODEC", "NAND FLASH"];
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            Microscope BGA Reball
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            380°C Active
          </span>
        </div>

        {/* PCB grid background */}
        <div
          className="relative h-16 rounded-lg border border-slate-800 p-2 flex items-center justify-around overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 50%, #0a2540 0%, #05070e 100%)" }}
        >
          {/* Trace lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 60" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="200" y2="30" stroke="#38bdf8" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="60" stroke="#f59e0b" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="100" y2="60" stroke="#38bdf8" strokeWidth="0.5" />
            <line x1="150" y1="0" x2="150" y2="60" stroke="#f59e0b" strokeWidth="0.5" />
          </svg>

          {chips.map((chip, idx) => (
            <div
              key={chip}
              className={`px-2 py-1.5 rounded border text-[8px] font-mono font-bold transition-all duration-400 relative ${activeChip === idx
                  ? "bg-amber-500 text-slate-950 border-amber-300 scale-110 z-10"
                  : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
            >
              {chip}
              {activeChip === idx && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Heat Bed: 380°C Precision</span>
          <span className="text-sky-400">Copper: 100% Conductivity</span>
        </div>
      </div>
    );
  }

  // ─── 5. CAMERA REPLACEMENT ───────────────────────────────────────────────
  if (serviceId === "camera-replacement") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            OIS Gyro Alignment
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            48MP Calibrated
          </span>
        </div>

        {/* Triple lens with OIS motion */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[{ size: 56, label: "WIDE" }, { size: 44, label: "ULTRA" }, { size: 36, label: "TELE" }].map(({ size, label }, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="relative rounded-full border-2 border-amber-400 flex items-center justify-center bg-slate-900"
                style={{
                  width: size,
                  height: size,
                  transform: i === 0 ? `translate(${oisX}px,${oisY}px)` : "none",
                  transition: "transform 0.1s ease-out",
                  boxShadow: "0 0 10px rgba(245,158,11,0.3)",
                }}
              >
                <div
                  className="rounded-full border border-sky-400 bg-sky-950/60 flex items-center justify-center transition-all duration-150"
                  style={{ width: `${aperture * 0.6}%`, height: `${aperture * 0.6}%` }}
                >
                  <div className="rounded-full bg-cyan-400" style={{ width: "35%", height: "35%" }} />
                </div>
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-amber-400/20" />
                  <div className="h-full w-px bg-amber-400/20 absolute" />
                </div>
              </div>
              <span className="text-[8px] font-mono text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>OIS: ±5° Correction Active</span>
          <span className="text-emerald-400">Autofocus: 0.03s</span>
        </div>
      </div>
    );
  }

  // ─── 6. SPEAKER REPLACEMENT ──────────────────────────────────────────────
  if (serviceId === "speaker-replacement") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            Acoustic Resonance Test
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
            98 dB Clean
          </span>
        </div>

        {/* Truly animated canvas EQ bars */}
        <AnimatedEqBars />

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Distortion: 0.00%</span>
          <span className="text-emerald-400">Stereo Earpiece: Clear</span>
        </div>
      </div>
    );
  }

  // ─── 7. WATER DAMAGE REPAIR ──────────────────────────────────────────────
  if (serviceId === "water-damage-repair") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            Ultrasonic Oxidation Removal
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            Corrosion: {Math.max(0, 100 - Math.round(cleanPct))}%
          </span>
        </div>

        {/* Cleaning sweep */}
        <div className="relative h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Corrosion dots (behind) */}
          <div className="absolute inset-0 flex items-center justify-around opacity-30" style={{ clipPath: `inset(0 ${cleanPct}% 0 0)` }}>
            {[1, 2, 3, 4, 5].map((d) => (
              <div key={d} className="w-3 h-3 rounded-full bg-orange-400 animate-ping" style={{ animationDelay: `${d * 0.15}s` }} />
            ))}
          </div>

          {/* Clean sweep overlay */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/50 border-r-2 border-cyan-300 transition-all duration-100"
            style={{ width: `${cleanPct}%` }}
          />

          {/* Bubble particles in cleaned zone */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none" style={{ clipPath: `inset(0 0 0 ${Math.max(0, cleanPct - 20)}%)` }}>
            {[1, 2, 3].map((d) => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: `${d * 0.2}s` }} />
            ))}
          </div>

          <span className="relative z-10 text-[10px] font-bold text-white font-mono">
            {cleanPct >= 99 ? "✓ RESIDUE NEUTRALIZED" : `ULTRASONIC SWEEP: ${Math.round(cleanPct)}%`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Moisture: 0.00%</span>
          <span className="text-emerald-400">Short-Circuit Risk: Cleared</span>
        </div>
      </div>
    );
  }

  // ─── 8. SOFTWARE SOLUTIONS ───────────────────────────────────────────────
  if (serviceId === "software-solutions") {
    return (
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-white/10 p-3 flex flex-col justify-between font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            OS Kernel Recovery
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Fastboot v34.0.5
          </span>
        </div>

        {/* Animated terminal lines */}
        <TerminalLines />

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Data Safe Mode: Preserved</span>
          <span className="text-emerald-400 font-bold">Unbricked OK</span>
        </div>
      </div>
    );
  }

  return null;
}
