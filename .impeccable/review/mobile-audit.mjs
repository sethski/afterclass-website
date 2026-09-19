import { launch } from 'puppeteer-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const edge =
  process.env['PROGRAMFILES(X86)'] +
  '\\Microsoft\\Edge\\Application\\msedge.exe'
const outDir = path.resolve('.impeccable/review/mobile')
await mkdir(outDir, { recursive: true })

const origin = process.env.AUDIT_ORIGIN ?? 'http://localhost:3000'

const views = [
  { name: 'iphone14', width: 390, height: 844, hasTouch: true },
  { name: 'iphone16promax', width: 430, height: 932, hasTouch: true },
  { name: 'android360', width: 360, height: 800, hasTouch: true },
]

const screens = ['welcome', 'fullName', 'facePhoto', 'schedule']

const browser = await launch({
  executablePath: edge,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
})

async function seed(page, screen) {
  await page.evaluate(async (nextScreen) => {
    sessionStorage.setItem(
      'afterclass:testrun-draft:v1',
      JSON.stringify({ v: 1, screen: nextScreen, values: {} })
    )
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('afterclass-testrun-draft', 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('files')) {
          req.result.createObjectStore('files')
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    const tx = db.transaction('files', 'readwrite')
    tx.objectStore('files').put(
      {
        name: 'face.jpg',
        type: 'image/jpeg',
        lastModified: Date.now(),
        buffer: new ArrayBuffer(16),
      },
      'facePhoto'
    )
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  }, screen)
  await page.reload({ waitUntil: 'networkidle0' })
}

function measureScript() {
  const doc = document.documentElement
  const overflowX = Math.max(0, doc.scrollWidth - doc.clientWidth)
  const buttons = [...document.querySelectorAll('button, [role="button"]')].map(
    (el) => {
      const r = el.getBoundingClientRect()
      const label =
        el.getAttribute('aria-label') ||
        el.textContent?.trim().slice(0, 40) ||
        el.className
      return {
        label,
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.x),
        y: Math.round(r.y),
        tiny: r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44),
      }
    }
  )
  const inputs = [...document.querySelectorAll('input, textarea, select')].map(
    (el) => {
      const cs = getComputedStyle(el)
      return {
        id: el.id || el.getAttribute('type') || el.tagName,
        fontSize: cs.fontSize,
      }
    }
  )
  const viewport = document.querySelector('meta[name="viewport"]')?.content ?? ''
  const chevrons = [...document.querySelectorAll('button[aria-label]')]
    .map((el) => ({
      label: el.getAttribute('aria-label'),
      box: el.getBoundingClientRect().toJSON(),
    }))
    .filter((item) => /back|OK|Continue|Submit/i.test(item.label || ''))
  const ok = [...document.querySelectorAll('button')].find((el) =>
    /^(OK|Continue|Submit|Start)$/i.test(el.textContent?.trim() || '')
  )
  const okBox = ok?.getBoundingClientRect().toJSON() ?? null
  let overlap = false
  if (okBox) {
    for (const chev of chevrons) {
      const a = okBox
      const b = chev.box
      overlap =
        overlap ||
        (a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top)
    }
  }
  const sheet = document.querySelector('.test-run [class*="overflow-y-auto"]')
  const clippedOk = Boolean(okBox && okBox.bottom > window.innerHeight - 2)
  const photoBtns = [...document.querySelectorAll('button')].filter((el) =>
    /Take photo|Choose file|Replace photo/i.test(el.textContent || '')
  ).map((el) => {
    const r = el.getBoundingClientRect()
    return { label: el.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) }
  })
  const timeChips = [...document.querySelectorAll('button')].filter((el) =>
    / to /i.test(el.textContent || '')
  ).map((el) => {
    const r = el.getBoundingClientRect()
    return { label: el.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) }
  })
  return {
    overflowX,
    viewport,
    clippedOk,
    photoBtns,
    timeChips,
    sheetScroll: Boolean(sheet),
    bodyFont: getComputedStyle(document.body).fontSize,
    peek: getComputedStyle(document.querySelector('.test-run') || document.body)
      .getPropertyValue('--q-image-peek')
      .trim(),
    chevron: getComputedStyle(document.querySelector('.test-run') || document.body)
      .getPropertyValue('--q-chevron')
      .trim(),
    tiny: buttons.filter((b) => b.tiny),
    inputs,
    overlapOkChevrons: overlap,
    okBox,
    chevrons,
    hiddenOverflow: Boolean(sheet),
    scrollHeight: doc.scrollHeight,
    clientHeight: doc.clientHeight,
  }
}

const report = []

for (const view of views) {
  for (const screen of screens) {
    const page = await browser.newPage()
    await page.setViewport({
      width: view.width,
      height: view.height,
      deviceScaleFactor: 2,
      hasTouch: view.hasTouch,
      isMobile: true,
    })
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ])
    await page.goto(`${origin}/enlistment`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    })
    if (screen !== 'welcome') {
      await seed(page, screen)
    }
    if (screen === 'schedule') {
      await page.evaluate(() => {
        const day = [...document.querySelectorAll('button')].find(
          (el) =>
            /^\d+$/.test(el.textContent?.trim() || '') &&
            !el.disabled &&
            el.getClientRects().length > 0 &&
            el.getBoundingClientRect().x < window.innerWidth
        )
        day?.click()
      })
      await new Promise((r) => setTimeout(r, 250))
    }
    await page.addStyleTag({
      content:
        '#__next-build-watcher, nextjs-portal, [data-next-badge] { display: none !important; }',
    })
    const metrics = await page.evaluate(measureScript)
    const shot = `${view.name}-${screen}.png`
    await page.screenshot({
      path: path.join(outDir, shot),
      fullPage: false,
      type: 'png',
    })
    report.push({ view: view.name, screen, shot, ...metrics })
    if (metrics.clippedOk) {
      await page.evaluate(() => {
        const sheet = document.querySelector('.test-run [class*="overflow-y-auto"]')
        if (sheet) sheet.scrollTop = sheet.scrollHeight
        else window.scrollTo(0, document.documentElement.scrollHeight)
      })
      await new Promise((r) => setTimeout(r, 200))
      const endMetrics = await page.evaluate(measureScript)
      const endShot = `${view.name}-${screen}-end.png`
      await page.screenshot({
        path: path.join(outDir, endShot),
        fullPage: false,
        type: 'png',
      })
      report.push({
        view: view.name,
        screen: `${screen}-end`,
        shot: endShot,
        ...endMetrics,
      })
    }
    await page.close()
  }
}

await writeFile(
  path.join(outDir, 'metrics.json'),
  JSON.stringify(report, null, 2)
)
console.log(JSON.stringify(report, null, 2))
await browser.close()
