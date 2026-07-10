"use client";
import { X } from "lucide-react";
import { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export function Btn({ variant="primary", className="", children, ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?:"primary"|"ghost"|"green"|"danger" }) {
  const base = "flex items-center gap-1.5 font-extrabold text-[10px] tracking-widest uppercase cursor-pointer rounded-xl border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary:"bg-[rgba(17,17,17,0.90)] backdrop-blur-sm text-white border-white/10 hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)] hover:-translate-y-px active:scale-95 px-6 py-3",
    ghost:  "bg-white/65 backdrop-blur-sm text-neutral-600 border-neutral-200/80 hover:bg-white/85 hover:-translate-y-px active:scale-95 px-5 py-3",
    green:  "bg-[rgba(34,168,90,0.88)] backdrop-blur-sm text-white border-green-600/30 hover:shadow-[0_8px_24px_rgba(34,168,90,0.4)] hover:-translate-y-px active:scale-95 px-6 py-3",
    danger: "bg-transparent text-red-500 border-red-200/80 hover:bg-[rgba(229,62,62,0.88)] hover:text-white active:scale-95 px-4 py-2",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, hint, className="", inputClassName="", ...props }:
  InputHTMLAttributes<HTMLInputElement> & { label?:string; hint?:string; inputClassName?:string }) {
  return (
    <div className={className}>
      {label && <label className="block text-[9px] font-bold text-neutral-400 tracking-[1.5px] uppercase mb-1.5">{label}{hint&&<span className="ml-1 text-neutral-300 normal-case tracking-normal font-normal">{hint}</span>}</label>}
      <input className={`field-input w-full border border-neutral-200/80 px-3.5 py-2.5 text-sm text-neutral-800 bg-white/72 backdrop-blur-sm rounded-lg font-[inherit] ${inputClassName}`} {...props}/>
    </div>
  );
}

export function Select({ label, children, className="", ...props }:
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?:string }) {
  return (
    <div className={className}>
      {label && <label className="block text-[9px] font-bold text-neutral-400 tracking-[1.5px] uppercase mb-1.5">{label}</label>}
      <div className="relative">
        <select className="field-input w-full appearance-none border border-neutral-200/80 px-3.5 py-2.5 text-sm text-neutral-800 bg-white/72 backdrop-blur-sm rounded-lg font-[inherit] cursor-pointer pr-9" {...props}>{children}</select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  );
}

export function ColorRow({ label, hint, value, onChange }:
  { label:string; hint?:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="neumorph p-1 rounded-[10px] shrink-0">
        <input type="color" value={value} onChange={e=>onChange(e.target.value)} className="w-9 h-9 border-none rounded-[7px] cursor-pointer block"/>
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-bold text-neutral-800 mb-0.5">{label}</p>
        {hint && <p className="text-[9px] text-neutral-400">{hint}</p>}
        <code className="text-[9px] text-neutral-500 bg-neutral-100/80 px-1.5 py-0.5 rounded">{value}</code>
      </div>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, width="min(820px,96vw)", footer }:
  { title:string; subtitle?:string; onClose:()=>void; children:React.ReactNode; width?:string; footer?:React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[400] flex">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-lg animate-overlay-in" onClick={onClose}/>
      <div className="glass relative m-auto rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.30)] flex flex-col max-h-[90vh]" style={{width}}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/40 sticky top-0 bg-white/90 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-base font-black text-black uppercase tracking-tight m-0">{title}</h2>
            {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="fluent-hover w-9 h-9 rounded-full bg-white/70 border border-neutral-200/80 flex items-center justify-center"><X size={15}/></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 px-7 py-4 border-t border-white/40 bg-white/70 sticky bottom-0">{footer}</div>}
      </div>
    </div>
  );
}

export function SectionLabel({ children }:{ children:React.ReactNode }) {
  return <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4 flex items-center gap-1.5">{children}</p>;
}
