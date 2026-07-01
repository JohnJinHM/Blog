import { access, readdir, readFile, writeFile } from 'fs/promises'
import { constants, existsSync } from 'fs'
import { pathToFileURL } from 'url'
import path from 'path'
import { slug } from 'github-slugger'
import matter from 'gray-matter'
import prompts from 'prompts'
import { compressToCanonical, processCanonical } from './lib/images.mjs'

const ROOT = process.cwd()
const CONTENT_DIRS = { blog: 'data/blog', photo: 'data/photos' }
const IMAGES_DIR = 'public/static/images'

class Cancelled extends Error {}

function ask(question) {
  return prompts(question, {
    onCancel: () => {
      throw new Cancelled()
    },
  })
}

async function exists(p) {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function cleanPath(value) {
  return value.trim().replace(/^["']|["']$/g, '')
}

async function collectExistingTags() {
  const tags = new Set()
  for (const dir of Object.values(CONTENT_DIRS)) {
    const abs = path.join(ROOT, dir)
    if (!(await exists(abs))) continue
    for (const file of await readdir(abs)) {
      if (!file.endsWith('.mdx')) continue
      const { data } = matter(await readFile(path.join(abs, file), 'utf8'))
      for (const tag of data.tags ?? []) tags.add(tag)
    }
  }
  return [...tags].sort()
}

function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function yamlList(values) {
  return `[${values.map(yamlString).join(', ')}]`
}

function yamlNumberList(values) {
  return `[${values.join(', ')}]`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function relImagePath(folder, name) {
  return `/static/images/${folder}/${name}.jpg`
}

async function askText(message, initial) {
  const { value } = await ask({ type: 'text', name: 'value', message, initial })
  return (value ?? '').trim()
}

async function askImagePath(message) {
  const { value } = await ask({
    type: 'text',
    name: 'value',
    message,
    validate: (v) => {
      const p = cleanPath(v)
      if (!p) return 'Path is required'
      if (!existsSync(path.resolve(p))) return `No file at ${p}`
      return true
    },
  })
  return path.resolve(cleanPath(value))
}

async function askTags(existing) {
  let chosen = []
  if (existing.length > 0) {
    const res = await ask({
      type: 'multiselect',
      name: 'value',
      message: 'Tags (space to select existing, enter to confirm)',
      choices: existing.map((t) => ({ title: t, value: t })),
      instructions: false,
    })
    chosen = res.value ?? []
  }
  const extra = await askText('New tags (comma-separated, optional)')
  const added = extra
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  return [...new Set([...chosen, ...added])]
}

async function guardOverwrite(target, label) {
  if (!existsSync(target)) return true
  const { ok } = await ask({
    type: 'confirm',
    name: 'ok',
    message: `${label} already exists — overwrite?`,
    initial: false,
  })
  return ok
}

async function askFolder(defaultFolder) {
  const value = await askText('Album folder under static/images', defaultFolder)
  return (value || defaultFolder).replace(/^\/+|\/+$/g, '')
}

async function run() {
  const flagType = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1]
  let type = flagType === 'blog' || flagType === 'photo' ? flagType : undefined
  if (!type) {
    const res = await ask({
      type: 'select',
      name: 'value',
      message: 'Post type',
      choices: [
        { title: 'Article (data/blog)', value: 'blog' },
        { title: 'Image post (data/photos)', value: 'photo' },
      ],
    })
    type = res.value
  }

  const title = await askText('Title')
  if (!title) {
    console.log('Title is required. Aborted.')
    return
  }
  const postSlug = slug(title)
  const date = await askText('Date (YYYY-MM-DD)', today())
  const { value: route } = await ask({
    type: 'select',
    name: 'value',
    message: 'Route',
    choices: [
      { title: 'official', value: 'official' },
      { title: 'casual', value: 'casual' },
      { title: 'shared (both)', value: 'shared' },
    ],
  })
  const summary = await askText('Summary')
  const tags = await askTags(await collectExistingTags())
  const { draft } = await ask({ type: 'confirm', name: 'draft', message: 'Draft?', initial: false })

  const mdxTarget = path.join(ROOT, CONTENT_DIRS[type], `${postSlug}.mdx`)
  if (!(await guardOverwrite(mdxTarget, path.relative(ROOT, mdxTarget)))) {
    console.log('Aborted.')
    return
  }

  const lines = ['---', `title: ${yamlString(title)}`, `date: ${yamlString(date)}`]
  let body = ''

  if (type === 'photo') {
    console.log('Note: HEIC input may not be supported by the prebuilt sharp binary.')
    const src = await askImagePath('Source image path')
    const folder = await askFolder(postSlug)
    const dest = path.join(ROOT, IMAGES_DIR, folder, `${postSlug}.jpg`)
    if (!(await guardOverwrite(dest, path.relative(ROOT, dest)))) {
      console.log('Aborted.')
      return
    }
    const out = await compressToCanonical(src, dest)
    const meta = await processCanonical(dest)
    console.log(
      `  → ${path.relative(ROOT, dest)} (${out.width}×${out.height}, ${Math.round(out.size / 1024)} KB, +${meta.widths.length} derivatives)`
    )
    lines.push(`image: ${yamlString(relImagePath(folder, postSlug))}`)
    lines.push(`imageWidth: ${meta.width}`, `imageHeight: ${meta.height}`)
    lines.push(`imageWidths: ${yamlNumberList(meta.widths)}`, `imageBlur: ${yamlString(meta.blur)}`)
    lines.push(`tags: ${yamlList(tags)}`, `draft: ${draft}`, `summary: ${yamlString(summary)}`, `route: ${route}`, '---', '')
    body = 'Write the post message here.\n'
  } else {
    const folder = await askFolder(postSlug)
    const embeds = []
    let index = 0
    for (;;) {
      const { more } = await ask({
        type: 'confirm',
        name: 'more',
        message: index === 0 ? 'Add an image?' : 'Add another image?',
        initial: index === 0,
      })
      if (!more) break
      index += 1
      const src = await askImagePath(`Source image #${index} path`)
      const name = index === 1 ? postSlug : `${postSlug}-${index}`
      const dest = path.join(ROOT, IMAGES_DIR, folder, `${name}.jpg`)
      if (!(await guardOverwrite(dest, path.relative(ROOT, dest)))) {
        index -= 1
        continue
      }
      const out = await compressToCanonical(src, dest)
      console.log(`  → ${path.relative(ROOT, dest)} (${out.width}×${out.height}, ${Math.round(out.size / 1024)} KB)`)
      const alt = (await askText('Alt text', title)) || title
      embeds.push({ src: relImagePath(folder, name), alt, width: out.width, height: out.height })
    }
    lines.push(`tags: ${yamlList(tags)}`, `draft: ${draft}`, `summary: ${yamlString(summary)}`, `route: ${route}`)
    if (embeds.length > 0) lines.push(`images: ${yamlList(embeds.map((e) => e.src))}`)
    lines.push('---', '')
    const imageTags = embeds
      .map((e) => `<Image src="${e.src}" alt="${e.alt.replace(/"/g, '&quot;')}" width={${e.width}} height={${e.height}} />`)
      .join('\n\n')
    body = (imageTags ? `${imageTags}\n\n` : '') + 'Write your post here.\n'
  }

  await writeFile(mdxTarget, `${lines.join('\n')}${body}`, 'utf8')
  console.log(`Created ${path.relative(ROOT, mdxTarget)}`)
  console.log('Run `yarn dev` to preview.')
}

export { run, yamlString, yamlList, relImagePath }

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((err) => {
    if (err instanceof Cancelled) {
      console.log('\nCancelled.')
      return
    }
    console.error(err)
    process.exit(1)
  })
}
