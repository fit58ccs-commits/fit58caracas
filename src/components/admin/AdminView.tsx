"use client";
import { useState } from "react";
import { AdminShell, type AdminSection } from "./AdminShell";
import { Dashboard }        from "./Dashboard";
import { BannerManager }    from "./BannerManager";
import { InventoryManager } from "./InventoryManager";
import { OrdersManager }    from "./OrdersManager";
import { RatesSection, DesignSection } from "./RatesDesign";
import { BIModule }         from "./BIModule";
import { SAMPLE_PRODUCTS, DEFAULT_BANNERS } from "@/lib/data";
import type { Banner }      from "@/lib/types";
import type { useAppStore } from "@/lib/store";

type Store = ReturnType<typeof useAppStore>;

export function AdminView({ store, userEmail, onSignOut }: {
  store:      Store;
  userEmail:  string;
  onSignOut:  () => void;
}) {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [search,  setSearch]  = useState("");

  const pendingOrders = store.orders.filter(o => o.status === "pending").length;

  return (
    <AdminShell
      section={section} onSection={setSection}
      pendingOrders={pendingOrders}
      search={search}   onSearch={setSearch}
      design={store.design}
      userEmail={userEmail}
      onSignOut={onSignOut}>

      {section === "dashboard" && (
        <Dashboard products={store.products} orders={store.orders}/>
      )}
      {section === "banners" && (
        <BannerManager
          banners={store.banners}
          onUpdate={(id, data) => store.updateBanner(id, data)}
          onAdd={(b: Banner) => store.setBanners(prev => [...prev, b])}
          onDelete={(id: string) => store.setBanners(prev => prev.filter(b => b.id !== id))}
          onReset={() => store.setBanners(() => DEFAULT_BANNERS)}/>
      )}
      {section === "inventory" && (
        <InventoryManager products={store.products} rate={store.rate}
          onAdd={p => store.addProduct(p)}
          onUpdate={(id, data) => store.updateProduct(id, data)}
          onDelete={store.deleteProduct}
          onReset={() => store.setProducts(() => SAMPLE_PRODUCTS)}/>
      )}
      {section === "orders" && (
        <OrdersManager orders={store.orders} search={search}
          onToggleStatus={id => {
            const o = store.orders.find(x => x.id === id);
            if (o) store.updateOrderStatus(id, o.status === "pending" ? "processed" : "pending");
          }}/>
      )}
      {section === "rates" && (
        <RatesSection rate={store.rate} onSaveRate={store.setRate}
          rateBCV={store.rateBCV} onSaveRateBCV={store.setRateBCV}
          products={store.products}/>
      )}
      {section === "design" && (
        <DesignSection design={store.design} onSave={store.setDesign}/>
      )}
      {section === "bi" && (
        <BIModule orders={store.orders} products={store.products} rate={store.rate.value}/>
      )}
    </AdminShell>
  );
}
