export const STORAGE_VERSION = 1

export const LAYOUT_LIMITS = {
  minColumns: 1,
  maxColumns: 6,
  minBookmarkHeight: 40,
  maxBookmarkHeight: 96,
} as const

export type Category = {
  id: string
  name: string
}

export type Bookmark = {
  id: string
  categoryId: string
  title: string
  url: string
  faviconUrl: string
}

export type LayoutSettings = {
  columns: number
  bookmarkHeight: number
}

export type AppState = {
  version: typeof STORAGE_VERSION
  categories: Category[]
  bookmarks: Bookmark[]
  settings: LayoutSettings
}

export type BookmarkDraft = {
  title: string
  url: string
  categoryId: string
}
