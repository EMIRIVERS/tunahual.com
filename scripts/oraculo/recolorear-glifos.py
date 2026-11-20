"""
Recolorea los 20 glifos (JPG grises, trazo negro sobre blanco) a PNG con
transparencia, para el PDF del Oráculo: bronce sobre papel crema y oro claro
sobre páginas oscuras. También tiñe el logo de Azul Anaité a marfil.

    python3 scripts/oraculo/recolorear-glifos.py

El alfa sale de la oscuridad del píxel; el color es plano. Se reescalan a
600 px, como el original. Los PNG resultantes se commitean: el generador no
necesita Python.
"""
from pathlib import Path
from PIL import Image
import numpy as np

RAIZ = Path(__file__).resolve().parents[2]
ORIGEN = RAIZ / "src/assets/glifos"
DESTINO = RAIZ / "assets/oraculo/glifos"
TINTAS = {"bronce": (139, 111, 42), "oro": (245, 211, 108)}
MARFIL = (242, 227, 189)


def teñir_desde_gris(gris: Image.Image, color, lado: int) -> Image.Image:
    g = gris.convert("L").resize((lado, lado), Image.LANCZOS)
    alfa = 255 - np.array(g)  # trazo negro -> opaco
    plano = np.zeros((lado, lado, 4), dtype=np.uint8)
    plano[..., 0], plano[..., 1], plano[..., 2] = color
    plano[..., 3] = alfa
    return Image.fromarray(plano, "RGBA")


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    n = 0
    for jpg in sorted(ORIGEN.glob("*.jpg")):
        with Image.open(jpg) as im:
            for nombre, color in TINTAS.items():
                teñir_desde_gris(im, color, 600).save(DESTINO / f"{jpg.stem}-{nombre}.png", optimize=True)
                n += 1
    # Logo: conserva el alfa y reemplaza el color por marfil.
    with Image.open(RAIZ / "src/assets/logo-azul-anaite.png") as logo:
        rgba = np.array(logo.convert("RGBA"))
        rgba[..., 0], rgba[..., 1], rgba[..., 2] = MARFIL
        Image.fromarray(rgba, "RGBA").resize((1400, round(1400 * logo.height / logo.width)), Image.LANCZOS).save(
            RAIZ / "assets/oraculo/logo-azul-anaite-marfil.png", optimize=True
        )
    print(f"{n} glifos + logo")


if __name__ == "__main__":
    main()
