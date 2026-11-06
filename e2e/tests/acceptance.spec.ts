import { expect, test, type Locator, type Page } from '@playwright/test'

function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}@example.com`
}

function visibleLink(page: Page, name: string) {
  return page.getByRole('link', { name }).filter({ visible: true }).first()
}

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

async function pickDate(dialog: Locator, isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  await dialog.getByRole('button', { name: /abrir calendário/i }).click()
  const calendar = dialog.getByRole('dialog', { name: 'Calendário' })
  const target = year * 12 + (month - 1)

  for (let index = 0; index < 24; index += 1) {
    const current = await calendar.locator('[data-calendar-month]').getAttribute('data-calendar-month')
    const [currentYear, currentMonth] = (current ?? '').split('-').map(Number)
    const key = currentYear * 12 + (currentMonth - 1)
    if (key === target) {
      break
    }
    await calendar.getByRole('button', { name: key < target ? 'Próximo mês' : 'Mês anterior' }).click()
  }

  const label = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  await calendar.getByRole('gridcell', { name: label, exact: true }).click()
}

async function register(page: Page, name: string, email: string, password: string) {
  await page.goto('/register')
  await page.getByLabel('Nome').fill(name)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
}

async function logout(page: Page, name: string, email: string) {
  await visibleLink(page, 'Conta').click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.getByText(email).first()).toBeVisible()
  await expect(page.getByText(/não pode ser alterado/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())
})

test('anonymous users are redirected away from private routes', async ({ page }) => {
  await page.goto('/transactions')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
})

test('registers, manages categories and transactions, then logs out', async ({ page }) => {
  const email = uniqueEmail('acceptance')
  await register(page, 'Acceptance User', email, 'password-1')

  await expect(page.getByText('R$ 0,00').first()).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  const categoryDialog = page.getByRole('dialog')
  await categoryDialog.getByLabel('Título').fill('Moradia')
  await categoryDialog.getByLabel('Descrição').fill('Contas da casa')
  await categoryDialog.locator('label').filter({ hasText: 'Casa' }).click()
  await categoryDialog.locator('label').filter({ hasText: 'Azul' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Moradia').first()).toBeVisible()
  await expect(page.getByText('Contas da casa')).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByRole('dialog').getByLabel('Título').fill('Casa')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Casa').first()).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await page.getByRole('button', { name: 'Nova transação' }).click()
  const salaryDialog = page.getByRole('dialog', { name: 'Nova transação' })
  await salaryDialog.getByLabel('Descrição').fill('Salário')
  await salaryDialog.getByLabel('Valor').fill('1.000,00')
  await salaryDialog.getByRole('radio', { name: 'Receita' }).check()
  await salaryDialog.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await pickDate(salaryDialog, localIso(new Date()))
  await salaryDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Salário')).toBeVisible()

  await page.getByRole('button', { name: 'Nova transação' }).click()
  const rentDialog = page.getByRole('dialog', { name: 'Nova transação' })
  await rentDialog.getByLabel('Descrição').fill('Aluguel')
  await rentDialog.getByLabel('Valor').fill('250,00')
  await rentDialog.getByRole('radio', { name: 'Despesa' }).check()
  await rentDialog.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await rentDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Aluguel')).toBeVisible()

  const previousMonth = new Date()
  previousMonth.setDate(15)
  previousMonth.setMonth(previousMonth.getMonth() - 1)
  await page.getByRole('button', { name: 'Nova transação' }).click()
  const bonusDialog = page.getByRole('dialog', { name: 'Nova transação' })
  await bonusDialog.getByLabel('Descrição').fill('Bônus antigo')
  await bonusDialog.getByLabel('Valor').fill('500,00')
  await bonusDialog.getByRole('radio', { name: 'Receita' }).check()
  await bonusDialog.getByLabel('Categoria').selectOption({ label: 'Casa' })
  await pickDate(bonusDialog, localIso(previousMonth))
  await bonusDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Bônus antigo')).toBeVisible()

  await visibleLink(page, 'Dashboard').click()
  await expect(page.getByText('R$ 1.250,00')).toBeVisible()
  await expect(page.getByText('R$ 1.000,00').first()).toBeVisible()
  await expect(page.getByText('R$ 250,00').first()).toBeVisible()
  await expect(page.getByText('R$ 750,00')).toHaveCount(0)

  await visibleLink(page, 'Transações').click()
  await page.getByRole('listitem').filter({ hasText: 'Salário' }).getByRole('button', { name: 'Editar' }).click()
  const editDialog = page.getByRole('dialog', { name: 'Editar transação' })
  await editDialog.getByLabel('Descrição').fill('Salário atualizado')
  await editDialog.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Salário atualizado')).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible()
  await page.getByRole('listitem').filter({ hasText: 'Casa' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText(/transações vinculadas/i)).toBeVisible()

  await visibleLink(page, 'Transações').click()
  await expect(page.getByRole('heading', { name: 'Transações' })).toBeVisible()
  await page.getByRole('listitem').filter({ hasText: 'Bônus antigo' }).getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('listitem').filter({ hasText: 'Aluguel' }).getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('listitem').filter({ hasText: 'Salário atualizado' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Nenhuma transação')).toBeVisible()

  await visibleLink(page, 'Categorias').click()
  await page.getByRole('listitem').filter({ hasText: 'Casa' }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByText('Nenhuma categoria')).toBeVisible()

  await visibleLink(page, 'Conta').click()
  await page.getByLabel('Nome completo').fill('Acceptance Atualizado')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('heading', { name: 'Acceptance Atualizado' })).toBeVisible()
  await expect(page.getByText(/alterações salvas/i)).toBeVisible()
  await logout(page, 'Acceptance Atualizado', email)
  await page.goto('/categories')
  await expect(page.getByRole('heading', { name: 'Fazer login' })).toBeVisible()
})

test('users do not see each other categories', async ({ page }) => {
  const password = 'password-1'
  const email = uniqueEmail('user-a')
  await register(page, 'User A', email, password)
  await visibleLink(page, 'Categorias').click()
  await page.getByRole('button', { name: 'Nova categoria' }).click()
  await page.getByRole('dialog').getByLabel('Título').fill('Privada A')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Privada A').first()).toBeVisible()
  await logout(page, 'User A', email)

  await page.goto('/register')
  await register(page, 'User B', uniqueEmail('user-b'), password)
  await visibleLink(page, 'Categorias').click()
  await expect(page.getByText('Nenhuma categoria')).toBeVisible()
  await expect(page.getByText('Privada A')).toHaveCount(0)
})
