"use client";
import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("@/components/ClientApp"), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: "100vh",
      background: "#F5ECE4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: "3px solid rgba(41,41,41,0.10)",
        borderTop: "3px solid #292929",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  ),
});

export default function Page() { return <ClientApp />; }
