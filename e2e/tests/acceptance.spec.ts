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
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())
})

test('anonymous users are redirected away from private routes', async ({ page }) => {
  await page.goto('/transactions')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
})

test('registers, manages categories and transactions, then logs out', async ({ page }) => {
  const email = uniqueEmail('acceptance')
  await register(page, 'Acceptance User', email, 'password-1')

  await expect(page.getByText('R$ 0,00').first()).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByRole('dialog').getByLabel('Nome').fill('Moradia')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Moradia').first()).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByRole('dialog').getByLabel('Nome').fill('Casa')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Casa').first()).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await page.getByRole('button', { name: 'Nova transação' }).click()
  const salaryDialog = page.getByRole('dialog')
  await salaryDialog.getByLabel('Descrição').fill('Salário')
  await salaryDialog.getByLabel('Valor (R$)').fill('1.000,00')
  await salaryDialog.getByLabel('Tipo').selectOption('INCOME')
  await salaryDialog.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await salaryDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Salário')).toBeVisible()

  await page.getByRole('button', { name: 'Nova transação' }).click()
  const rentDialog = page.getByRole('dialog')
  await rentDialog.getByLabel('Descrição').fill('Aluguel')
  await rentDialog.getByLabel('Valor (R$)').fill('250,00')
  await rentDialog.getByLabel('Tipo').selectOption('EXPENSE')
  await rentDialog.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await rentDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Aluguel')).toBeVisible()

  await visibleLink(page, 'Dashboard').click()
  await expect(page.getByText('R$ 750,00')).toBeVisible()
  await expect(page.getByText('R$ 1.000,00').first()).toBeVisible()
  await expect(page.getByText('R$ 250,00').first()).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await page.getByRole('listitem').filter({ hasText: 'Salário' }).getByRole('button', { name: 'Editar' }).click()
  const editDialog = page.getByRole('dialog')
  await editDialog.getByLabel('Descrição').fill('Salário atualizado')
  await editDialog.getByRole('button', { name: 'Salvar' }).click()
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
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
})

test('users do not see each other categories', async ({ page }) => {
  const password = 'password-1'
  await register(page, 'User A', uniqueEmail('user-a'), password)
  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByRole('dialog').getByLabel('Nome').fill('Privada A')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Privada A').first()).toBeVisible()
  await logout(page)

  await page.goto('/register')
  await register(page, 'User B', uniqueEmail('user-b'), password)
  await visibleLink(page, 'Categorias').click()
  await expect(page.getByText('Nenhuma categoria')).toBeVisible()
  await expect(page.getByText('Privada A')).toHaveCount(0)
})
