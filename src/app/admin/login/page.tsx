"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, User, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("Denish@Lab2026!");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your admin username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data?.token) {
          try {
            localStorage.setItem("denish_admin_token", data.data.token);
          } catch {}
        }
        window.location.href = "/admin";
      } else {
        setError(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setError("Connection failed. Please ensure the server is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Monogram */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            D
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
            DENISH REPAIR LAB
          </h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">
            Internal Staff &amp; Management Portal
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Gandhinagar Technical Center Custody
          </p>
        </div>

        {/* Quick Credentials Info Card */}
        <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-blue-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Workshop Admin Access
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-300 shadow-2xs transition flex items-center gap-1 active:scale-95"
            >
              <KeyRound className="w-3 h-3 text-blue-600" />
              Auto Fill
            </button>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-blue-950">
            <div className="flex justify-between">
              <span className="text-blue-700 font-sans">Username:</span>
              <span className="font-bold bg-white/80 px-1.5 py-0.5 rounded border border-blue-200/60">admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 font-sans">Password:</span>
              <span className="font-bold bg-white/80 px-1.5 py-0.5 rounded border border-blue-200/60">Denish@Lab2026!</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="admin-username" 
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Username or Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or denish_admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="admin-password" 
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Master Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Denish@Lab2026!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-blue-600 transition inline-flex items-center gap-1 font-semibold"
          >
            <span>← Return to Public Customer Website</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
