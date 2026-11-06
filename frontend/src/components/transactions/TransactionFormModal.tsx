import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { centsToInputValue, parseMoneyInputToCents } from '../../lib/money'
import type { Category, Transaction } from '../../lib/graphql/types'
import { Button } from '../ui/Button'
import { Feedback } from '../ui/Feedback'
import { DateField } from '../ui/DateField'
import { Field, TextInput, TextSelect } from '../ui/Field'
import { Icon } from '../ui/Icon'
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
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${date.getUTCFullYear()}-${month}-${day}`
}

function todayInputValue(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      type: 'EXPENSE',
      date: todayInputValue(),
      categoryId: '',
    },
  })

  useEffect(() => {
    const empty = {
      description: '',
      amount: '',
      type: 'EXPENSE' as const,
      date: todayInputValue(),
      categoryId: '',
    }

    if (!open) {
      reset(empty)
      return
    }

    reset(
      transaction
        ? {
            description: transaction.description,
            amount: centsToInputValue(transaction.amount),
            type: transaction.type,
            date: toDateInputValue(transaction.date),
            categoryId: transaction.categoryId,
          }
        : empty,
    )
  }, [open, transaction, categories, reset])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? 'Editar transação' : 'Nova transação'}
      description={transaction ? 'Atualize os dados desta transação' : 'Registre sua despesa ou receita'}
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
        <div className="segmented" role="radiogroup" aria-label="Tipo">
          <label className="segment segment-expense">
            <input type="radio" value="EXPENSE" {...register('type')} />
            <Icon name="circle-arrow-down" />
            Despesa
          </label>
          <label className="segment segment-income">
            <input type="radio" value="INCOME" {...register('type')} />
            <Icon name="circle-arrow-up" />
            Receita
          </label>
        </div>
        <Field label="Descrição" htmlFor="tx-description" error={errors.description?.message}>
          <TextInput
            id="tx-description"
            placeholder="Ex. Algo no restaurante"
            {...register('description')}
          />
        </Field>
        <div className="form-row">
          <Field label="Data" htmlFor="tx-date" error={errors.date?.message}>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DateField id="tx-date" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Valor" htmlFor="tx-amount" error={errors.amount?.message}>
            <span className="input-shell has-prefix">
              <span className="input-prefix">R$</span>
              <TextInput id="tx-amount" inputMode="decimal" placeholder="0,00" {...register('amount')} />
            </span>
          </Field>
        </div>
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
          <Button type="submit" disabled={submitting || categories.length === 0}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
