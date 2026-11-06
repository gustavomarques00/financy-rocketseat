import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Category } from '../../lib/graphql/types'
import { Button } from '../ui/Button'
import { Feedback } from '../ui/Feedback'
import { Field, TextInput } from '../ui/Field'
import { Modal } from '../ui/Modal'

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da categoria.').max(60),
})

type FormValues = z.infer<typeof schema>

type CategoryFormModalProps = {
  open: boolean
  category?: Category | null
  submitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: FormValues) => Promise<void>
}

export function CategoryFormModal({
  open,
  category,
  submitting,
  error,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? '' })
    }
  }, [open, category, reset])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Editar categoria' : 'Nova categoria'}
      description="Organize suas transações com categorias"
    >
      <form
        className="form-stack"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
        })}
      >
        <Field label="Título" htmlFor="category-name" error={errors.name?.message}>
          <TextInput
            id="category-name"
            autoComplete="off"
            placeholder="Ex. Alimentação"
            {...register('name')}
          />
        </Field>
        {error ? <Feedback tone="error">{error}</Feedback> : null}
        <div className="form-actions">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
