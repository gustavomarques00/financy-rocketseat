import type { IconName } from '../components/ui/Icon'
import { categoryTone } from './categoryTone'

export const CATEGORY_ICONS = [
  'tag',
  'wallet',
  'utensils',
  'heart',
  'car',
  'shopping-cart',
  'clapperboard',
  'gift',
  'house',
  'lightbulb',
  'book',
  'briefcase',
  'plane',
  'gamepad',
  'shirt',
  'bus',
] as const satisfies readonly IconName[]

export const CATEGORY_COLORS = [
  'green',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
] as const

export const CATEGORY_ICON_LABELS: Record<CategoryIcon, string> = {
  tag: 'Etiqueta',
  wallet: 'Carteira',
  utensils: 'Alimentação',
  heart: 'Saúde',
  car: 'Carro',
  'shopping-cart': 'Mercado',
  clapperboard: 'Cinema',
  gift: 'Presente',
  house: 'Casa',
  lightbulb: 'Utilidades',
  book: 'Estudos',
  briefcase: 'Trabalho',
  plane: 'Viagem',
  gamepad: 'Lazer',
  shirt: 'Roupas',
  bus: 'Transporte',
}

export const CATEGORY_COLOR_LABELS: Record<CategoryColor, string> = {
  green: 'Verde',
  blue: 'Azul',
  purple: 'Roxo',
  pink: 'Rosa',
  red: 'Vermelho',
  orange: 'Laranja',
  yellow: 'Amarelo',
}

export type CategoryIcon = (typeof CATEGORY_ICONS)[number]
export type CategoryColor = (typeof CATEGORY_COLORS)[number]

export function isCategoryIcon(value: string): value is CategoryIcon {
  return (CATEGORY_ICONS as readonly string[]).includes(value)
}

export function isCategoryColor(value: string): value is CategoryColor {
  return (CATEGORY_COLORS as readonly string[]).includes(value)
}

export function categoryAppearance(category: {
  name: string
  icon?: string
  color?: string
}): { icon: CategoryIcon; color: CategoryColor } {
  const fallback = categoryTone(category.name)
  return {
    icon: category.icon && isCategoryIcon(category.icon) ? category.icon : 'tag',
    color: category.color && isCategoryColor(category.color)
      ? category.color
      : isCategoryColor(fallback)
        ? fallback
        : 'green',
  }
}
