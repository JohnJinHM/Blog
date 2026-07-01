import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export const MAX_WIDTH = 2400
export const JPEG_QUALITY = 80
export const DERIVATIVE_WIDTHS = [400, 800, 1200, 1600]

export function stripExt(p) {
  return p.replace(/\.(jpe?g|png|webp|avif)$/i, '')
}

const encode = (pipeline) => pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })

// Sharp drops EXIF/GPS by default (we never call .withMetadata()); .rotate() bakes in
// orientation first so stripping the tag doesn't visually flip the image.
export async function compressToCanonical(srcAbs, destAbs) {
  await mkdir(path.dirname(destAbs), { recursive: true })
  const info = await encode(
    sharp(srcAbs).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true })
  ).toFile(destAbs)
  return { width: info.width, height: info.height, size: info.size }
}

// Re-optimize an existing canonical in place (q80, capped width, metadata stripped). Reads the
// file into a buffer first so sharp holds no handle on the path we're about to overwrite (a
// memory-mapped input otherwise fails the write on Windows).
export async function recompressInPlace(canonicalAbs) {
  const input = await readFile(canonicalAbs)
  const buf = await encode(
    sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true })
  ).toBuffer()
  await writeFile(canonicalAbs, buf)
}

// Smaller-width JPEGs alongside the canonical file (`<base>-<w>w.jpg`), only for widths
// below the canonical width — the canonical serves everything at or above its own width.
export async function generateDerivatives(canonicalAbs, canonicalWidth) {
  const base = stripExt(canonicalAbs)
  const made = []
  for (const w of DERIVATIVE_WIDTHS) {
    if (w >= canonicalWidth) continue
    await encode(sharp(canonicalAbs).resize({ width: w })).toFile(`${base}-${w}w.jpg`)
    made.push(w)
  }
  return made
}

export async function computeBlurDataURL(canonicalAbs) {
  const buf = await sharp(canonicalAbs).resize({ width: 20 }).blur().jpeg({ quality: 40 }).toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// Full responsive treatment for an existing canonical file: real dimensions, derivative
// ladder, and an inline LQIP data URI.
export async function processCanonical(canonicalAbs) {
  const { width, height } = await sharp(canonicalAbs).metadata()
  const widths = await generateDerivatives(canonicalAbs, width)
  const blur = await computeBlurDataURL(canonicalAbs)
  return { width, height, widths, blur }
}
