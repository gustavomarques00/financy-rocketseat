import { expect, test, type Page } from '@playwright/test'

function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}@example.com`
}

function visibleLink(page: Page, name: string) {
  return page.getByRole('link', { name }).filter({ visible: true }).first()
}

async function register(page: Page, name: string, email: string, password: string) {
  await page.goto('/register')
  await page.getByLabel('Nome').fill(name)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
}

async function logout(page: Page) {
  await visibleLink(page, 'Conta').click()
  await page.getByRole('button', { name: 'Encerrar sessão' }).click()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())
})

test('anonymous users are redirected away from private routes', async ({ page }) => {
  await page.goto('/transactions')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('registers, manages categories and transactions, then logs out', async ({ page }) => {
  const email = uniqueEmail('acceptance')
  await register(page, 'Acceptance User', email, 'password-1')

  await expect(page.getByText('R$ 0,00').first()).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByLabel('Nome').fill('Moradia')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Moradia')).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Nome').fill('Casa')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Casa')).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await page.getByRole('button', { name: 'Nova transação' }).click()
  await page.getByLabel('Descrição').fill('Salário')
  await page.getByLabel('Valor (R$)').fill('1.000,00')
  await page.getByLabel('Tipo').selectOption('INCOME')
  await page.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Salário')).toBeVisible()

  await page.getByRole('button', { name: 'Nova transação' }).click()
  await page.getByLabel('Descrição').fill('Aluguel')
  await page.getByLabel('Valor (R$)').fill('250,00')
  await page.getByLabel('Tipo').selectOption('EXPENSE')
  await page.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Aluguel')).toBeVisible()

  await visibleLink(page, 'Dashboard').click()
  await expect(page.getByText('R$ 750,00')).toBeVisible()
  await expect(page.getByText('R$ 1.000,00').first()).toBeVisible()
  await expect(page.getByText('R$ 250,00').first()).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await page.getByRole('listitem').filter({ hasText: 'Salário' }).getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Descrição').fill('Salário atualizado')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Salário atualizado')).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible()
  await page.getByRole('listitem').filter({ hasText: 'Casa' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText(/transações vinculadas/i)).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await expect(page.getByRole('heading', { name: 'Transações' })).toBeVisible()
  await page.getByRole('listitem').filter({ hasText: 'Aluguel' }).getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('listitem').filter({ hasText: 'Salário atualizado' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Nenhuma transação')).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await page.getByRole('listitem').filter({ hasText: 'Casa' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Nenhuma categoria')).toBeVisible()

  await logout(page)
  await page.goto('/categories')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('users do not see each other categories', async ({ page }) => {
  const password = 'password-1'
  await register(page, 'User A', uniqueEmail('user-a'), password)
  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByLabel('Nome').fill('Privada A')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Privada A')).toBeVisible()
  await logout(page)

  await page.goto('/register')
  await register(page, 'User B', uniqueEmail('user-b'), password)
  await visibleLink(page, 'Categorias').click()
  await expect(page.getByText('Nenhuma categoria')).toBeVisible()
  await expect(page.getByText('Privada A')).toHaveCount(0)
})
