import dynamic from "next/dynamic";
const ClientApp = dynamic(() => import("@/components/ClientApp"), {
  ssr: false,
  loading: () => null,
});
export default function Page() { return <ClientApp />; }
