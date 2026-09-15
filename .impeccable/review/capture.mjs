import { launch } from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const edge =
  process.env['PROGRAMFILES(X86)'] +
  '\\Microsoft\\Edge\\Application\\msedge.exe'
const outDir = path.resolve('.impeccable/review')
await mkdir(outDir, { recursive: true })

const browser = await launch({
  executablePath: edge,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
})

async function shot(name, width, height) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto('http://localhost:3000/TestRun', {
    waitUntil: 'networkidle0',
    timeout: 30000,
  })
  await page.addStyleTag({
    content: '#__next-build-watcher, nextjs-portal, [data-next-badge] { display: none !important; }',
  })
  await page.screenshot({
    path: path.join(outDir, name),
    fullPage: true,
    type: 'png',
  })
  await page.close()
}

await shot('desktop.png', 1440, 900)
await shot('mobile.png', 390, 844)
await browser.close()
