import { chromium } from 'playwright'
const SP = process.argv[3]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))

await page.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)
await page.getByRole('button', { name: 'Enter the City →' }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${SP}/v2-01-plaza.png` })
console.log('parked at plaza, errors so far:', JSON.stringify(errors))

// Click Robotics Workshop and capture mid-drive + arrival
await page.getByRole('button', { name: /Fly to Robotics Workshop/i }).click({ force: true })
await page.waitForTimeout(400)
await page.screenshot({ path: `${SP}/v2-02-middrive.png` })
await page.waitForTimeout(2500)
await page.screenshot({ path: `${SP}/v2-03-arrived-robotics.png` })

// Drive further down Main Street to DECA (the tall one, tests the tilt)
await page.getByRole('button', { name: /Fly to DECA Business Center/i }).click({ force: true })
await page.waitForTimeout(3500)
await page.screenshot({ path: `${SP}/v2-04-arrived-deca.png` })

console.log('errors:', JSON.stringify(errors))
await browser.close()
