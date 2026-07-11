-- Añadir columnas nuevas a la tabla banners (ejecutar en Supabase SQL Editor)
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS active       boolean  NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS title_size   integer  NOT NULL DEFAULT 72;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle_size integer NOT NULL DEFAULT 14;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_size     integer  NOT NULL DEFAULT 11;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_padding_x integer NOT NULL DEFAULT 28;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_padding_y integer NOT NULL DEFAULT 12;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS btn_radius   integer  NOT NULL DEFAULT 10;

-- Activar todos los banners existentes
UPDATE public.banners SET active = true WHERE active IS NULL;
