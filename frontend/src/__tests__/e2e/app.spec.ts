import { test, expect } from '@playwright/test'

test.describe('FlowTodo Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads login page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('FlowTodo')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('can navigate to register page', async ({ page }) => {
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/.*register/)
    await expect(page.locator('h1')).toContainText('Create Account')
  })

  test('shows validation error for empty login', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Username is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('registers a new user and logs in', async ({ page }) => {
    const username = `testuser_${Date.now()}`
    const password = 'testpass123'

    await page.click('text=Sign up')
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="email"]', `${username}@example.com`)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    // Should redirect to main app
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Today')).toBeVisible()
  })

  test('creates a task', async ({ page }) => {
    const username = `testuser_${Date.now()}`
    const password = 'testpass123'

    // Register and login
    await page.click('text=Sign up')
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="email"]', `${username}@example.com`)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    // Create task
    await page.click('button:has-text("New Task")')
    await page.fill('input[name="title"]', 'E2E Test Task')
    await page.fill('textarea[name="description"]', 'Created by Playwright')
    await page.selectOption('select[name="priority"]', 'high')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=E2E Test Task')).toBeVisible()
  })

  test('navigates between views', async ({ page }) => {
    const username = `testuser_${Date.now()}`
    const password = 'testpass123'

    await page.click('text=Sign up')
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="email"]', `${username}@example.com`)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    // Navigate to different views
    await page.click('text=Calendar')
    await expect(page).toHaveURL(/.*calendar/)
    await expect(page.locator('text=Calendar')).toBeVisible()

    await page.click('text=Upcoming')
    await expect(page).toHaveURL(/.*upcoming/)

    await page.click('text=Tasks')
    await expect(page).toHaveURL(/.*tasks/)

    await page.click('text=Stats')
    await expect(page).toHaveURL(/.*stats/)

    await page.click('text=Completed')
    await expect(page).toHaveURL(/.*completed/)

    await page.click('text=Settings')
    await expect(page).toHaveURL(/.*settings/)
  })

  test('toggles dark mode', async ({ page }) => {
    const username = `testuser_${Date.now()}`
    const password = 'testpass123'

    await page.click('text=Sign up')
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="email"]', `${username}@example.com`)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    await page.click('text=Settings')
    await page.click('button:has-text("Dark")')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})