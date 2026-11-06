export const CATEGORY_ICONS = [
  'tag',
  'wallet',
  'utensils',
  'shopping-cart',
  'house',
  'gift',
  'book-open',
  'briefcase-business',
  'piggy-bank',
  'car-front',
  'heart-pulse',
  'dumbbell',
  'ticket',
  'receipt-text',
  'tool-case',
  'paw-print',
  'mailbox',
  'baggage-claim',
] as const

export const CATEGORY_COLORS = [
  'green',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
] as const

export const DEFAULT_CATEGORY_ICON = 'tag'
export const DEFAULT_CATEGORY_COLOR = 'green'
export const CATEGORY_DESCRIPTION_MAX = 160

export type CategoryIcon = (typeof CATEGORY_ICONS)[number]
export type CategoryColor = (typeof CATEGORY_COLORS)[number]
