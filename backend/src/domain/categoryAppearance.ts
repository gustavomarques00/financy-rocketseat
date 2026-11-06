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
