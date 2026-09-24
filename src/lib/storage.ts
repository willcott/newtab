import {
  LAYOUT_LIMITS,
  STORAGE_VERSION,
  type AppState,
  type Bookmark,
  type BookmarkDraft,
  type Category,
  type LayoutSettings,
} from '@/types/bookmarks'

const STORAGE_KEY = 'newtab.bookmarks.v1'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'category-everyday', name: 'Everyday' },
  { id: 'category-build', name: 'Build' },
  { id: 'category-read', name: 'Read later' },
]

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bookmark-github',
    categoryId: 'category-everyday',
    title: 'GitHub',
    url: 'https://github.com/',
    faviconUrl: getFaviconUrl('https://github.com/'),
  },
  {
    id: 'bookmark-gmail',
    categoryId: 'category-everyday',
    title: 'Gmail',
    url: 'https://mail.google.com/',
    faviconUrl: getFaviconUrl('https://mail.google.com/'),
  },
  {
    id: 'bookmark-react',
    categoryId: 'category-build',
    title: 'React',
    url: 'https://react.dev/',
    faviconUrl: getFaviconUrl('https://react.dev/'),
  },
  {
    id: 'bookmark-vite',
    categoryId: 'category-build',
    title: 'Vite',
    url: 'https://vite.dev/',
    faviconUrl: getFaviconUrl('https://vite.dev/'),
  },
  {
    id: 'bookmark-mdn',
    categoryId: 'category-read',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    faviconUrl: getFaviconUrl('https://developer.mozilla.org/'),
  },
  {
    id: 'bookmark-smashing',
    categoryId: 'category-read',
    title: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/',
    faviconUrl: getFaviconUrl('https://www.smashingmagazine.com/'),
  },
]

export function createDefaultState(): AppState {
  return {
    version: STORAGE_VERSION,
    categories: DEFAULT_CATEGORIES,
    bookmarks: DEFAULT_BOOKMARKS,
    settings: {
      columns: 3,
      bookmarkHeight: 56,
    },
  }
}

export function createId(prefix: string): string {
  const randomUuid = globalThis.crypto?.randomUUID?.()
  return randomUuid ? `${prefix}-${randomUuid}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function normalizeBookmarkUrl(value: string): string | null {
  const candidate = value.trim()
  if (!candidate) {
    return null
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(candidate)
    ? candidate
    : `https://${candidate}`

  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

export function getFaviconUrl(value: string): string {
  const normalizedUrl = normalizeBookmarkUrl(value)
  if (!normalizedUrl) {
    return ''
  }

  const hostname = new URL(normalizedUrl).hostname
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`
}

export function getBookmarksForCategory(state: AppState, categoryId: string): Bookmark[] {
  return state.bookmarks.filter((bookmark) => bookmark.categoryId === categoryId)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  )
}

function isBookmark(value: unknown): value is Bookmark {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    normalizeBookmarkUrl(value.url) !== null
  )
}

function isLayoutSettings(value: unknown): value is LayoutSettings {
  return (
    isRecord(value) &&
    typeof value.columns === 'number' &&
    typeof value.bookmarkHeight === 'number'
  )
}

function isAppState(value: unknown): value is AppState {
  return (
    isRecord(value) &&
    value.version === STORAGE_VERSION &&
    Array.isArray(value.categories) &&
    value.categories.length > 0 &&
    value.categories.every(isCategory) &&
    Array.isArray(value.bookmarks) &&
    value.bookmarks.every(isBookmark) &&
    isLayoutSettings(value.settings)
  )
}

function normalizeState(state: AppState): AppState {
  const categoryIds = new Set(state.categories.map((category) => category.id))
  const bookmarks = state.bookmarks
    .filter((bookmark) => categoryIds.has(bookmark.categoryId))
    .map((bookmark) => ({
      ...bookmark,
      title: bookmark.title.trim(),
      url: normalizeBookmarkUrl(bookmark.url) ?? bookmark.url,
      faviconUrl: bookmark.faviconUrl || getFaviconUrl(bookmark.url),
    }))
    .filter((bookmark) => bookmark.title.length > 0)

  return {
    version: STORAGE_VERSION,
    categories: state.categories.map((category) => ({
      id: category.id,
      name: category.name.trim(),
    })),
    bookmarks,
    settings: {
      columns: clamp(
        Math.round(state.settings.columns),
        LAYOUT_LIMITS.minColumns,
        LAYOUT_LIMITS.maxColumns,
      ),
      bookmarkHeight: clamp(
        Math.round(state.settings.bookmarkHeight),
        LAYOUT_LIMITS.minBookmarkHeight,
        LAYOUT_LIMITS.maxBookmarkHeight,
      ),
    },
  }
}

export function loadState(): AppState {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return createDefaultState()
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    return isAppState(parsedValue) ? normalizeState(parsedValue) : createDefaultState()
  } catch {
    return createDefaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function createBookmark(draft: BookmarkDraft): Bookmark | null {
  const normalizedUrl = normalizeBookmarkUrl(draft.url)
  const title = draft.title.trim()
  if (!normalizedUrl || !title) {
    return null
  }

  return {
    id: createId('bookmark'),
    categoryId: draft.categoryId,
    title,
    url: normalizedUrl,
    faviconUrl: getFaviconUrl(normalizedUrl),
  }
}
