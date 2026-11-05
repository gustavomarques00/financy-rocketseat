import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { centsToInputValue, parseMoneyInputToCents } from '../../lib/money'
import type { Category, Transaction } from '../../lib/graphql/types'
import { Button } from '../ui/Button'
import { Feedback } from '../ui/Feedback'
import { Field, TextInput, TextSelect } from '../ui/Field'
import { Modal } from '../ui/Modal'

const schema = z.object({
  description: z.string().trim().min(1, 'Informe a descrição.').max(200),
  amount: z
    .string()
    .trim()
    .refine((value) => parseMoneyInputToCents(value) !== null, {
      message: 'Informe um valor válido maior que zero (ex.: 12,50).',
    }),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'Informe a data.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
})

type FormValues = z.infer<typeof schema>

export type TransactionFormPayload = {
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryId: string
}

type TransactionFormModalProps = {
  open: boolean
  transaction?: Transaction | null
  categories: Category[]
  submitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: TransactionFormPayload) => Promise<void>
}

function toDateInputValue(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString().slice(0, 10)
}

export function TransactionFormModal({
  open,
  transaction,
  categories,
  submitting,
  error,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'EXPENSE',
      date: new Date().toISOString().slice(0, 10),
      categoryId: '',
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset({
      description: transaction?.description ?? '',
      amount: transaction ? centsToInputValue(transaction.amount) : '',
      type: transaction?.type ?? 'EXPENSE',
      date: transaction ? toDateInputValue(transaction.date) : new Date().toISOString().slice(0, 10),
      categoryId: transaction?.categoryId ?? categories[0]?.id ?? '',
    })
  }, [open, transaction, categories, reset])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? 'Editar transação' : 'Nova transação'}
    >
      <form
        className="form-stack"
        onSubmit={handleSubmit(async (values) => {
          const amount = parseMoneyInputToCents(values.amount)
          if (amount === null) {
            return
          }

          await onSubmit({
            description: values.description,
            amount,
            type: values.type,
            date: new Date(`${values.date}T12:00:00.000Z`).toISOString(),
            categoryId: values.categoryId,
          })
        })}
      >
        <Field label="Descrição" htmlFor="tx-description" error={errors.description?.message}>
          <TextInput id="tx-description" {...register('description')} />
        </Field>
        <Field label="Valor (R$)" htmlFor="tx-amount" error={errors.amount?.message}>
          <TextInput id="tx-amount" inputMode="decimal" placeholder="0,00" {...register('amount')} />
        </Field>
        <Field label="Tipo" htmlFor="tx-type" error={errors.type?.message}>
          <TextSelect id="tx-type" {...register('type')}>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </TextSelect>
        </Field>
        <Field label="Data" htmlFor="tx-date" error={errors.date?.message}>
          <TextInput id="tx-date" type="date" {...register('date')} />
        </Field>
        <Field label="Categoria" htmlFor="tx-category" error={errors.categoryId?.message}>
          <TextSelect id="tx-category" {...register('categoryId')}>
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </TextSelect>
        </Field>
        {categories.length === 0 ? (
          <Feedback tone="info">Crie uma categoria antes de registrar transações.</Feedback>
        ) : null}
        {error ? <Feedback tone="error">{error}</Feedback> : null}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || categories.length === 0}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
