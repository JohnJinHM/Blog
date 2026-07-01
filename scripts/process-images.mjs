import { readdir, readFile, writeFile } from 'fs/promises'
import { existsSync, statSync } from 'fs'
import path from 'path'
import { processCanonical, recompressInPlace } from './lib/images.mjs'

const ROOT = process.cwd()
const PHOTOS_DIR = path.join(ROOT, 'data/photos')
const PUBLIC_DIR = path.join(ROOT, 'public')
const META_KEYS = /^(imageWidth|imageHeight|imageWidths|imageBlur):/

function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function upsertMeta(raw, meta) {
  const lines = raw.split('\n')
  const open = lines.indexOf('---')
  const close = lines.indexOf('---', open + 1)
  if (open !== 0 || close === -1) throw new Error('no frontmatter block')

  const body = lines.slice(open + 1, close).filter((l) => !META_KEYS.test(l))
  const imageIdx = body.findIndex((l) => /^image:/.test(l))
  if (imageIdx === -1) throw new Error('no image field')

  body.splice(
    imageIdx + 1,
    0,
    `imageWidth: ${meta.width}`,
    `imageHeight: ${meta.height}`,
    `imageWidths: [${meta.widths.join(', ')}]`,
    `imageBlur: ${yamlString(meta.blur)}`
  )
  return ['---', ...body, ...lines.slice(close)].join('\n')
}

async function run() {
  const files = (await readdir(PHOTOS_DIR)).filter((f) => f.endsWith('.mdx'))
  let processed = 0
  for (const file of files) {
    const abs = path.join(PHOTOS_DIR, file)
    const raw = await readFile(abs, 'utf8')
    const imageMatch = raw.match(/^image:\s*['"]?(\/static\/[^'"\n]+)['"]?/m)
    if (!imageMatch) {
      console.log(`skip ${file}: no image field`)
      continue
    }
    const canonical = path.join(PUBLIC_DIR, imageMatch[1])
    if (!existsSync(canonical)) {
      console.log(`skip ${file}: missing ${imageMatch[1]}`)
      continue
    }
    const before = Math.round(statSync(canonical).size / 1024)
    await recompressInPlace(canonical)
    const after = Math.round(statSync(canonical).size / 1024)
    const meta = await processCanonical(canonical)
    await writeFile(abs, upsertMeta(raw, meta), 'utf8')
    console.log(
      `${file}: ${meta.width}×${meta.height}, ${before}→${after} KB, +${meta.widths.length} derivatives`
    )
    processed += 1
  }
  console.log(`Processed ${processed}/${files.length} photo posts.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
