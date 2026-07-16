"use client";
import { useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { Star, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    // Login exitoso → ir al panel admin
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:"linear-gradient(135deg,#f0f2f5 0%,#e8eaed 100%)" }}>
      <div className="w-full max-w-sm px-4">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="neumorph w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
            <Star size={24} className="text-black fill-black"/>
          </div>
          <h1 className="text-xl font-black text-black tracking-tight uppercase">Fit +58 Caracas</h1>
          <p className="text-xs text-neutral-400 mt-1 font-medium tracking-wide uppercase">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-sm font-black text-black uppercase tracking-tight mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tudominio.com"
                required
                autoComplete="email"
                className="field-input w-full border border-neutral-200/80 px-4 py-3 text-sm text-black bg-white/72 rounded-xl font-[inherit]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="field-input w-full border border-neutral-200/80 px-4 py-3 pr-11 text-sm text-black bg-white/72 rounded-xl font-[inherit]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 border-none bg-transparent cursor-pointer p-0">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 text-[11px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer border-none transition-all duration-200 disabled:opacity-60"
              style={{ background:"rgba(17,17,17,0.90)", color:"#fff" }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>ENTRANDO...</>
                : "ENTRAR AL PANEL"
              }
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-neutral-400 mt-6">
          Acceso restringido · Solo administradores
        </p>
      </div>
    </div>
  );
}
