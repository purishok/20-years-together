import { expect, test } from '@playwright/test'

test('real photos load and the page fits the viewport', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Одна любов.')
  await page.locator('#memories').scrollIntoViewIfNeeded()
  await expect(page.locator('.memory')).toHaveCount(5)
  for (const image of await page.locator('.memory img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('gallery filters, photo navigation, escape and focus restoration work', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Наша сім’я', exact: true }).click()
  await expect(page.locator('.memory')).toHaveCount(2)
  const opener = page.getByRole('button', { name: 'Переглянути: Наша маленька велика любов' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Перегляд фотографій' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.lightbox-title')).toHaveText('Наша маленька велика любов')
  await page.getByRole('button', { name: 'Наступне фото' }).click()
  await expect(dialog.locator('.lightbox-title')).toHaveText('Посмішки, які зігрівають')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.locator('.lightbox-title')).toHaveText('Наша маленька велика любов')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(opener).toBeFocused()
  await page.getByRole('button', { name: 'Усі спогади', exact: true }).click()
  await expect(page.locator('.memory')).toHaveCount(5)
})

test('letter opens and wishes wrap through all twenty messages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Відкрити лист', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Лист для мами й тата' })
  await expect(dialog.getByRole('heading')).toHaveText('Дорогі мамо й тату!')
  await expect(dialog.locator('.letter-paragraph')).toHaveCount(4)
  await page.getByRole('button', { name: 'Закрити', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Попереднє побажання' }).click()
  await expect(page.locator('.wish-number')).toHaveText('20 / 20')
  await page.getByRole('button', { name: 'Наступне побажання' }).click()
  await expect(page.locator('.wish-number')).toHaveText('01 / 20')
  await page.getByRole('button', { name: 'З річницею, мої рідні!' }).click()
  await expect(page.locator('.celebration-message')).toContainText('Нехай ця любов триває вічно')
})

test('failed API requests can be retried', async ({ page }) => {
  await page.route('**/api/celebration', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Спробувати ще раз' })).toBeVisible()
  await page.unroute('**/api/celebration')
  await page.getByRole('button', { name: 'Спробувати ще раз' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Одна любов.')
})

test('navigation and mobile menu reach the album', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Одна любов.')
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Відкрити меню' }).click()
  await page.getByRole('link', { name: 'Щасливі миті', exact: true }).click()
  await expect(page).toHaveURL(/#memories$/)
  if (testInfo.project.name === 'mobile') await expect(page.getByRole('button', { name: 'Відкрити меню' })).toHaveAttribute('aria-expanded', 'false')
})
