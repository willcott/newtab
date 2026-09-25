export const STORAGE_VERSION = 3

export const LAYOUT_LIMITS = {
  minColumns: 1,
  maxColumns: 6,
} as const

export const BOOKMARK_SCALE_OPTIONS = [
  {
    value: 'Extra small',
    label: 'Extra small',
    height: 40,
    titleSize: 12,
    faviconSize: 21,
    faviconIconSize: 13,
    arrowSize: 14,
  },
  {
    value: 'Small',
    label: 'Small',
    height: 48,
    titleSize: 13,
    faviconSize: 24,
    faviconIconSize: 15,
    arrowSize: 15,
  },
  {
    value: 'Medium',
    label: 'Medium',
    height: 56,
    titleSize: 14,
    faviconSize: 27,
    faviconIconSize: 17,
    arrowSize: 16,
  },
  {
    value: 'Large',
    label: 'Large',
    height: 72,
    titleSize: 16,
    faviconSize: 31,
    faviconIconSize: 20,
    arrowSize: 18,
  },
  {
    value: 'Extra large',
    label: 'Extra large',
    height: 88,
    titleSize: 18,
    faviconSize: 36,
    faviconIconSize: 23,
    arrowSize: 20,
  },
] as const

export type BookmarkScale = (typeof BOOKMARK_SCALE_OPTIONS)[number]['value']

export type Section = {
  id: string
  name: string
  collapsed: boolean
  bookmarkIds: string[]
}

export type Bookmark = {
  id: string
  sectionId: string | null
  title: string
  url: string
  faviconUrl: string
}

export type LayoutItem = {
  type: 'section' | 'bookmark'
  id: string
}

export type LayoutSettings = {
  columns: number
  bookmarkScale: BookmarkScale
}

export type AppState = {
  version: typeof STORAGE_VERSION
  sections: Section[]
  bookmarks: Bookmark[]
  layout: LayoutItem[][]
  settings: LayoutSettings
}

export type BookmarkDraft = {
  title: string
  url: string
  sectionId: string | null
}

export function getBookmarkMetrics(scale: BookmarkScale) {
  return BOOKMARK_SCALE_OPTIONS.find((option) => option.value === scale) ?? BOOKMARK_SCALE_OPTIONS[2]
}

export function getBookmarkHeight(scale: BookmarkScale): number {
  return getBookmarkMetrics(scale).height
}
