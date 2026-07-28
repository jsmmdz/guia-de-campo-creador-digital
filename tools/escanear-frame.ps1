# escanear-frame.ps1 -- mide un frame exportado de Figma sin abrir Figma.
#
# Escanea el PNG fila por fila y reporta las BANDAS (filas con tinta) y los
# GAPS (filas vacias) con sus coordenadas exactas. Como los frames se
# exportan a 1440 de ancho, la escala es 1:1 -- 1px del PNG es 1px a 1440
# de viewport, sin factor de conversion.
#
# De cada banda salen: alto de la caja de tinta, extremo izquierdo y
# derecho, ancho y centro. Con eso se deducen margenes, ancho de columna,
# alineacion (centro ~719 = centrada) e interlineado (delta entre inicios
# de bandas consecutivas dentro de un parrafo).
#
# Ver DESIGN.md seccion 7 para el protocolo completo.
#
# Uso:
#   powershell -File tools/escanear-frame.ps1 -Path "..\..\IMAGENES\frames figma\nodo 3 metodo.png"
#   powershell -File tools/escanear-frame.ps1 -Path "...\nodo 4 voces.png" -Threshold 40
#
# -Threshold es la luminancia (0-255) sobre la cual un pixel cuenta como
# tinta. 24 sirve para los frames de fondo negro. Subilo si el frame tiene
# un fondo texturado o ruido de compresion; bajalo si hay texto muy tenue.

param(
  [Parameter(Mandatory = $true)][string]$Path,
  [int]$Threshold = 24
)

if (-not (Test-Path $Path)) { Write-Error "No existe: $Path"; exit 1 }

$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;

public class FrameScan {
  public static string Scan(string path, int thresh) {
    Bitmap bmp = new Bitmap(path);
    int w = bmp.Width, h = bmp.Height;
    BitmapData d = bmp.LockBits(new Rectangle(0, 0, w, h),
      ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = d.Stride;
    byte[] buf = new byte[stride * h];
    Marshal.Copy(d.Scan0, buf, 0, buf.Length);
    bmp.UnlockBits(d);
    bmp.Dispose();

    StringBuilder sb = new StringBuilder();
    sb.AppendLine(String.Format("FRAME {0} x {1}   (escala 1:1 si el ancho es 1440)", w, h));
    sb.AppendLine();

    int bandStart = -1, bandMinX = 99999, bandMaxX = -1, gapStart = -1;

    for (int y = 0; y <= h; y++) {
      bool has = false; int minX = 99999, maxX = -1;
      if (y < h) {
        int off = y * stride;
        for (int x = 0; x < w; x++) {
          int i = off + x * 4;
          int lum = (buf[i + 2] * 30 + buf[i + 1] * 59 + buf[i] * 11) / 100;
          if (lum > thresh) { has = true; if (x < minX) minX = x; if (x > maxX) maxX = x; }
        }
      }
      if (has) {
        if (bandStart < 0) {
          bandStart = y; bandMinX = minX; bandMaxX = maxX;
          if (gapStart >= 0)
            sb.AppendLine(String.Format("  GAP  {0,5} -> {1,5}   alto {2}", gapStart, y, y - gapStart));
          gapStart = -1;
        } else {
          if (minX < bandMinX) bandMinX = minX;
          if (maxX > bandMaxX) bandMaxX = maxX;
        }
      } else if (bandStart >= 0) {
        sb.AppendLine(String.Format(
          "BANDA  y {0,5} -> {1,5}   alto {2,4}   x {3} .. {4}   ancho {5}   centro {6}",
          bandStart, y, y - bandStart, bandMinX, bandMaxX, bandMaxX - bandMinX + 1,
          (bandMinX + bandMaxX) / 2));
        bandStart = -1; bandMinX = 99999; bandMaxX = -1; gapStart = y;
      }
    }
    return sb.ToString();
  }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[FrameScan]::Scan((Resolve-Path $Path).Path, $Threshold)
