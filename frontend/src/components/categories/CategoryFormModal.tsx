import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  CATEGORY_COLORS,
  CATEGORY_COLOR_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ICON_LABELS,
  type CategoryColor,
  type CategoryIcon,
} from '../../lib/categoryAppearance'
import type { Category } from '../../lib/graphql/types'
import { Button } from '../ui/Button'
import { Feedback } from '../ui/Feedback'
import { Field, TextInput } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da categoria.').max(60),
  description: z.string().trim().max(160, 'A descrição deve ter no máximo 160 caracteres.'),
  icon: z.enum(CATEGORY_ICONS),
  color: z.enum(CATEGORY_COLORS),
})

type FormValues = z.infer<typeof schema>

export type CategoryFormPayload = {
  name: string
  description: string | null
  icon: CategoryIcon
  color: CategoryColor
}

type CategoryFormModalProps = {
  open: boolean
  category?: Category | null
  submitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: CategoryFormPayload) => Promise<void>
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
    defaultValues: { name: '', description: '', icon: 'tag', color: 'green' },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const icon = CATEGORY_ICONS.find((item) => item === category?.icon) ?? 'tag'
    const color = CATEGORY_COLORS.find((item) => item === category?.color) ?? 'green'
    reset({
      name: category?.name ?? '',
      description: category?.description ?? '',
      icon,
      color,
    })
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
          await onSubmit({
            name: values.name,
            description: values.description.trim() ? values.description.trim() : null,
            icon: values.icon,
            color: values.color,
          })
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
        <Field label="Descrição" htmlFor="category-description" error={errors.description?.message}>
          <TextInput
            id="category-description"
            autoComplete="off"
            placeholder="Descrição da categoria"
            {...register('description')}
          />
          <p className="field-hint">Opcional</p>
        </Field>
        <fieldset className="choice-fieldset">
          <legend>Ícone</legend>
          <div className="choice-grid" role="radiogroup" aria-label="Ícone">
            {CATEGORY_ICONS.map((icon) => (
              <label key={icon} className="choice-option" title={CATEGORY_ICON_LABELS[icon]}>
                <input type="radio" value={icon} {...register('icon')} />
                <Icon name={icon} />
                <span className="sr-only">{CATEGORY_ICON_LABELS[icon]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="choice-fieldset">
          <legend>Cor</legend>
          <div className="color-grid" role="radiogroup" aria-label="Cor">
            {CATEGORY_COLORS.map((color) => (
              <label key={color} className={`color-option tag-${color}`} title={CATEGORY_COLOR_LABELS[color]}>
                <input type="radio" value={color} {...register('color')} />
                <span className="sr-only">{CATEGORY_COLOR_LABELS[color]}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
