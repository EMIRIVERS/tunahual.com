-- Corrige animal_guia de 7 nahuales para que coincidan con el PDF oficial
-- "NAHUALES" de Azul Anaité (fuente de verdad de la clienta).
-- Cotejo previo: los otros 13 nahuales ya coincidían.
-- Nota: en Toj, Tijax y Ajpu el PDF usa una figura/elemento (no un animal);
-- por eso en la UI la tarjeta se renombró de "Animal Guía" a "Glifo".

UPDATE public.nahuales SET animal_guia = 'Lagarto'              WHERE index_num = 1;  -- Imox  (antes: Cocodrilo)
UPDATE public.nahuales SET animal_guia = 'Quétzal'             WHERE index_num = 5;  -- Kan   (antes: Serpiente Emplumada)
UPDATE public.nahuales SET animal_guia = 'Lechuza'             WHERE index_num = 6;  -- Kame  (antes: Búho)
UPDATE public.nahuales SET animal_guia = 'Fuego'               WHERE index_num = 9;  -- Toj   (antes: Tiburón)
UPDATE public.nahuales SET animal_guia = 'Gato Montés'         WHERE index_num = 12; -- E     (antes: Gato/Puma)
UPDATE public.nahuales SET animal_guia = 'Cuchillo de Obsidiana' WHERE index_num = 18; -- Tijax (antes: Pez Espada)
UPDATE public.nahuales SET animal_guia = 'Guardián del Sol'    WHERE index_num = 20; -- Ajpu  (antes: Guacamaya)
