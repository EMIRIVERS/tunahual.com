-- Canon de los cuatro maíces (Azul Anaité, 2026-10-03).
-- Rojo=Agua, Blanco=Aire, Negro=Tierra, Amarillo=Fuego. Los colores giran de
-- cuatro en cuatro desde Imox. La app ya aplica este canon en el cliente
-- (src/data/maices.ts); esta migración alinea la base de datos con él.
-- Direcciones: Este/Norte/Oeste/Sur. Solo cambia elemento y color_maiz;
-- punto_cardinal ya coincide con el canon en los 20 nahuales.
UPDATE public.nahuales SET elemento = 'Agua',   color_maiz = 'Rojo'     WHERE nombre IN ('Imox','Kan','Toj','Aj','No''j');
UPDATE public.nahuales SET elemento = 'Aire',   color_maiz = 'Blanco'   WHERE nombre IN ('Iq''','Kame','Tz''i''','I''x','Tijax');
UPDATE public.nahuales SET elemento = 'Tierra', color_maiz = 'Negro'    WHERE nombre IN ('Aq''ab''al','Kej','B''atz''','Tz''ikin','Kawoq');
UPDATE public.nahuales SET elemento = 'Fuego',  color_maiz = 'Amarillo' WHERE nombre IN ('K''at','Q''anil','E','Ajmaq','Ajpu');
