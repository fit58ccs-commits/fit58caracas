-- Ejecutar en Supabase SQL Editor
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS active        boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS show_tag      boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS show_title    boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS show_subtitle boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS show_cta      boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta_url       text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS title_size    integer NOT NULL DEFAULT 64;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle_size integer NOT NULL DEFAULT 14;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_size      integer NOT NULL DEFAULT 11;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_padding_x integer NOT NULL DEFAULT 24;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_padding_y integer NOT NULL DEFAULT 12;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_radius    integer NOT NULL DEFAULT 10;

UPDATE public.banners SET active = true, show_tag = true, show_title = true, show_subtitle = true, show_cta = true WHERE active IS NULL;
