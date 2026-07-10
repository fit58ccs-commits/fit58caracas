# Guía de configuración de Supabase para Délice Gourmet

## PASO 1 — Crear las tablas

Ve a tu proyecto en https://supabase.com → SQL Editor → New Query
Pega y ejecuta este SQL completo:

```sql
-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
create table if not exists public.products (
  id          text primary key default gen_random_uuid()::text,
  name        text        not null,
  category    text        not null default '',
  desc        text        not null default '',
  price       numeric     not null default 0,
  stock       integer     not null default 0,
  badge       text,
  images      text[]      not null default '{}',
  img         text        not null default '',
  created_at  timestamptz not null default now()
);

-- ─── ORDERS ────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id         text primary key,
  date       timestamptz not null default now(),
  status     text        not null default 'pending' check (status in ('pending','processed')),
  total      numeric     not null default 0,
  cart       jsonb       not null default '[]',
  form       jsonb       not null default '{}',
  maps_link  text
);

-- ─── BANNERS ───────────────────────────────────────────────────────────────
create table if not exists public.banners (
  id             text primary key default gen_random_uuid()::text,
  tag            text not null default '',
  title          text not null default '',
  subtitle       text not null default '',
  cta            text not null default '',
  bg_color       text not null default '#f0f4e8',
  accent_color   text not null default '#5a8a00',
  text_color     text not null default '#111111',
  btn_color      text not null default '#111111',
  btn_text_color text not null default '#ffffff',
  img            text not null default '',
  img_base64     text,
  order_index    integer not null default 0
);

-- ─── SETTINGS (tasas + diseño) ─────────────────────────────────────────────
create table if not exists public.settings (
  key   text primary key,
  value text not null default ''
);

-- ─── RLS: desactivar para desarrollo (activar en producción) ───────────────
alter table public.products disable row level security;
alter table public.orders   disable row level security;
alter table public.banners  disable row level security;
alter table public.settings disable row level security;
```

## PASO 2 — Crear el bucket de imágenes

1. En Supabase → Storage → New Bucket
2. Nombre: **images**
3. Marcar "Public bucket" ✓
4. Guardar

## PASO 3 — Insertar banners iniciales

En SQL Editor ejecuta:

```sql
insert into public.banners (id, tag, title, subtitle, cta, bg_color, accent_color, text_color, btn_color, btn_text_color, img, order_index) values
  ('b1','NUEVO INGRESO','Aceite\nde Oliva','Extra Virgen · Prensado en frío · Cosecha selecta','COMPRAR AHORA','#f0f4e8','#5a8a00','#111111','#111111','#ffffff','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&q=90',0),
  ('b2','CAFÉ PREMIUM','Gourmet\nMolido','Tostado artesanal · Origen único · 250g','VER PRODUCTO','#f5ede6','#7a3a00','#111111','#7a3a00','#ffffff','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=700&q=90',1),
  ('b3','100% NATURAL','Miel\nde Abeja','Recolección directa · Sin conservantes · Cruda','DESCUBRIR','#fdf5e0','#a07000','#111111','#a07000','#ffffff','https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&q=90',2);
```

## PASO 4 — Insertar tasas iniciales

```sql
insert into public.settings (key, value) values
  ('rate',    '{"value":36.5,"mode":"custom"}'),
  ('rateBCV', '{"value":46.20,"mode":"bcv"}')
on conflict (key) do nothing;
```

## PASO 5 — Insertar productos demo (opcional)

```sql
insert into public.products (id, name, category, desc, price, stock, badge, images, img) values
  ('p1','Aceite de Oliva Extra Virgen','Aceites','500ml · Prensado en frío · Cosecha selecta · DO Jaén',8.50,48,'BESTSELLER',
   ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90'],
   'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90'),
  ('p2','Café Gourmet Molido','Bebidas','250g · Tueste artesanal · Origen único · Aroma intenso',6.00,30,'NUEVO',
   ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90'],
   'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90'),
  ('p3','Miel Pura de Abeja','Dulces','350g · Recolección natural · Sin conservantes · Cruda',7.25,5,'BAJO STOCK',
   ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=90'],
   'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=90'),
  ('p4','Almendras Premium','Frutos','200g · Tostadas lentamente · Sin sal · Importadas de España',9.00,15,'PREMIUM',
   ARRAY['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=600&q=90'],
   'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=600&q=90'),
  ('p5','Pasta Artesanal Italiana','Pastas','500g · Sémola de trigo duro · Secado lento · Bronce',4.50,60,null,
   ARRAY['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=90'],
   'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=90'),
  ('p6','Chocolate Belga 70%','Dulces','100g · Cacao fino · Edición limitada · Sin azúcar añadida',5.75,35,'EDICIÓN LTD',
   ARRAY['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=90'],
   'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=90');
```

## PASO 6 — Verificar

En Supabase → Table Editor deberías ver:
- ✅ products   → 6 filas
- ✅ orders     → 0 filas (vacía)
- ✅ banners    → 3 filas
- ✅ settings   → 2 filas (rate, rateBCV)
- ✅ Storage → bucket "images" creado

¡Listo! La app ya puede leer y escribir en Supabase.
