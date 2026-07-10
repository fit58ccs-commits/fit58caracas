"use client";
import { useState } from "react";
import { createClient } from "@/app/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setError("Email o contrasena incorrectos"); setLoading(false); return; }
    window.location.href = "/admin";
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f0f2f5,#e8eaed)", fontFamily:"Inter,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:380, padding:"0 16px" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:"#111", textTransform:"uppercase", margin:"0 0 4px" }}>Delice Gourmet</h1>
          <p style={{ fontSize:11, color:"#aaa", margin:0, textTransform:"uppercase", letterSpacing:"2px" }}>Panel de Administracion</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.85)", borderRadius:20, padding:32, boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:9, fontWeight:800, color:"#888", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@tudominio.com" required style={{ width:"100%", border:"1px solid rgba(220,220,220,0.8)", padding:"12px 16px", fontSize:13, color:"#111", background:"rgba(255,255,255,0.72)", borderRadius:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:9, fontWeight:800, color:"#888", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:6 }}>Contrasena</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required style={{ width:"100%", border:"1px solid rgba(220,220,220,0.8)", padding:"12px 16px", fontSize:13, color:"#111", background:"rgba(255,255,255,0.72)", borderRadius:10, fontFamily:"inherit", boxSizing:"border-box" }}/>
            </div>
            {error && <div style={{ background:"#fff1f1", border:"1px solid #fca5a5", color:"#dc2626", fontSize:12, padding:"10px 14px", borderRadius:10 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"14px 0", fontSize:11, fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", cursor:"pointer", border:"none", borderRadius:10, background:"rgba(17,17,17,0.90)", color:"#fff" }}>
              {loading ? "ENTRANDO..." : "ENTRAR AL PANEL"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}