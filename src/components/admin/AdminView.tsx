"use client";
import { useState } from "react";
import { AdminShell, type AdminSection } from "./AdminShell";
import { BannerManager }    from "./BannerManager";
import { InventoryManager } from "./InventoryManager";
import { OrdersManager }    from "./OrdersManager";
import { ReviewsManager }   from "./ReviewsManager";
import { PurchasesManager } from "./PurchasesManager";
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
  const [section, setSection] = useState<AdminSection>("bi");
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

      {section === "bi" && (
        <BIModule orders={store.orders} products={store.products} rate={store.rate.value}/>
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
          categories={store.design.categories}
          onAdd={p => store.addProduct(p)}
          onUpdate={(id, data) => store.updateProduct(id, data)}
          onDelete={store.deleteProduct}
          onReset={() => store.setProducts(() => SAMPLE_PRODUCTS)}/>
      )}
      {section === "purchases" && (
        <PurchasesManager
          purchases={store.purchases}
          products={store.products}
          onAdd={store.addPurchase}
          onDelete={store.deletePurchase}
          onAddStock={(productId, qty) => store.updateProduct(productId, {
            stock: (store.products.find(p=>p.id===productId)?.stock||0) + qty
          })}/>
      )}
      {section === "orders" && (
        <OrdersManager orders={store.orders} search={search} rate={store.rate.value}
          onToggleStatus={id => {
            const o = store.orders.find(x => x.id === id);
            if (o && o.status !== "cancelled") store.updateOrderStatus(id, o.status === "pending" ? "processed" : "pending");
          }}
          onCancel={(id, reason) => store.updateOrderStatus(id, "cancelled", reason)}
          onDelete={id => store.deleteOrder(id)}
        />
      )}
      {section === "rates" && (
        <RatesSection rate={store.rate} onSaveRate={store.setRate}
          rateBCV={store.rateBCV} onSaveRateBCV={store.setRateBCV}
          products={store.products}/>
      )}
      {section === "design" && (
        <DesignSection design={store.design} onSave={store.setDesign}/>
      )}
      {section === "reviews" && (
        <ReviewsManager reviews={store.reviews} products={store.products}
          onApprove={store.approveReview}
          onReject={store.rejectReview}
          onDelete={store.deleteReview}/>
      )}
    </AdminShell>
  );
}
