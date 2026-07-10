"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
interface ToastItem { id:number; msg:string; icon?:string; leaving?:boolean; }
type ToastFn = (msg:string, icon?:string, duration?:number) => void;
const ToastCtx = createContext<ToastFn>(()=>{});
export function useToast() { return useContext(ToastCtx); }
export function ToastProvider({ children }:{ children:React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const toast = useCallback((msg:string, icon="✓", duration=2200) => {
    const id = ++idRef.current;
    setToasts(p=>[...p,{id,msg,icon,leaving:false}]);
    setTimeout(()=>setToasts(p=>p.map(t=>t.id===id?{...t,leaving:true}:t)), duration-350);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), duration);
  },[]);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9000] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t=>(
          <div key={t.id} className={`${t.leaving?"animate-toast-out":"animate-toast-in"} glass-dark text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap shadow-2xl pointer-events-auto`}>
            {t.icon&&<span>{t.icon}</span>}{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
