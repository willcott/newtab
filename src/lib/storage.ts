import {
  BOOKMARK_SCALE_OPTIONS,
  LAYOUT_LIMITS,
  STORAGE_VERSION,
  type AppState,
  type Bookmark,
  type BookmarkDraft,
  type BookmarkScale,
  type LayoutSettings,
  type LayoutItem,
  type Section,
} from '@/types/bookmarks'

const STORAGE_KEY = 'newtab.bookmarks.v3'
const LEGACY_STORAGE_KEY = 'newtab.bookmarks.v2'
const LEGACY_CATEGORY_STORAGE_KEY = 'newtab.bookmarks.v1'

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'section-work',
    name: 'Work',
    collapsed: false,
    bookmarkIds: ['bookmark-jira', 'bookmark-outlook', 'bookmark-outlook-calendar'],
  },
  {
    id: 'section-dev',
    name: 'Dev',
    collapsed: false,
    bookmarkIds: ['bookmark-github', 'bookmark-aws'],
  },
  {
    id: 'section-personal',
    name: 'Personal',
    collapsed: false,
    bookmarkIds: ['bookmark-gmail'],
  },
]

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bookmark-jira',
    sectionId: 'section-work',
    title: 'Jira',
    url: 'https://www.atlassian.com/software/jira',
    faviconUrl: getFaviconUrl('https://www.atlassian.com/software/jira'),
  },
  {
    id: 'bookmark-outlook',
    sectionId: 'section-work',
    title: 'Outlook',
    url: 'https://outlook.office.com/mail/',
    faviconUrl: getFaviconUrl('https://outlook.office.com/mail/'),
  },
  {
    id: 'bookmark-outlook-calendar',
    sectionId: 'section-work',
    title: 'Outlook Calendar',
    url: 'https://outlook.office.com/calendar/',
    faviconUrl: getFaviconUrl('https://outlook.office.com/calendar/'),
  },
  {
    id: 'bookmark-github',
    sectionId: 'section-dev',
    title: 'GitHub',
    url: 'https://github.com/',
    faviconUrl: getFaviconUrl('https://github.com/'),
  },
  {
    id: 'bookmark-aws',
    sectionId: 'section-dev',
    title: 'AWS',
    url: 'https://console.aws.amazon.com/',
    faviconUrl: getFaviconUrl('https://console.aws.amazon.com/'),
  },
  {
    id: 'bookmark-gmail',
    sectionId: 'section-personal',
    title: 'Gmail',
    url: 'https://mail.google.com/',
    faviconUrl: getFaviconUrl('https://mail.google.com/'),
  },
  {
    id: 'bookmark-figma',
    sectionId: null,
    title: 'Figma',
    url: 'https://www.figma.com/',
    faviconUrl: getFaviconUrl('https://www.figma.com/'),
  },
]

const DEFAULT_LAYOUT: LayoutItem[][] = [
  [
    { type: 'section', id: 'section-work' },
    { type: 'bookmark', id: 'bookmark-figma' },
  ],
  [{ type: 'section', id: 'section-dev' }],
  [{ type: 'section', id: 'section-personal' }],
]

export function createDefaultState(): AppState {
  return {
    version: STORAGE_VERSION,
    sections: DEFAULT_SECTIONS.map((section) => ({
      ...section,
      bookmarkIds: [...section.bookmarkIds],
    })),
    bookmarks: DEFAULT_BOOKMARKS.map((bookmark) => ({ ...bookmark })),
    layout: DEFAULT_LAYOUT.map((column) => column.map((item) => ({ ...item }))),
    settings: {
      columns: 3,
      bookmarkScale: 'Medium',
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

export function getBookmarksForSection(state: AppState, sectionId: string): Bookmark[] {
  const section = state.sections.find((candidate) => candidate.id === sectionId)
  if (!section) {
    return []
  }

  const bookmarksById = new Map(state.bookmarks.map((bookmark) => [bookmark.id, bookmark]))
  return section.bookmarkIds.flatMap((bookmarkId) => {
    const bookmark = bookmarksById.get(bookmarkId)
    return bookmark ? [bookmark] : []
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getScaleForHeight(height: number): BookmarkScale {
  return BOOKMARK_SCALE_OPTIONS.reduce((closest, option) =>
    Math.abs(option.height - height) < Math.abs(closest.height - height) ? option : closest,
  ).value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBookmarkScale(value: unknown): value is BookmarkScale {
  return (
    typeof value === 'string' &&
    BOOKMARK_SCALE_OPTIONS.some((option) => option.value === value)
  )
}

function isSection(value: unknown): value is Section {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    (value.collapsed === undefined || typeof value.collapsed === 'boolean') &&
    Array.isArray(value.bookmarkIds) &&
    value.bookmarkIds.every((bookmarkId) => typeof bookmarkId === 'string')
  )
}

function isLayoutItem(value: unknown): value is LayoutItem {
  return (
    isRecord(value) &&
    (value.type === 'section' || value.type === 'bookmark') &&
    typeof value.id === 'string'
  )
}

function isBookmark(value: unknown): value is Bookmark {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.sectionId === null || typeof value.sectionId === 'string') &&
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    typeof value.faviconUrl === 'string' &&
    normalizeBookmarkUrl(value.url) !== null
  )
}

function isLayoutSettings(value: unknown): value is LayoutSettings {
  return (
    isRecord(value) &&
    typeof value.columns === 'number' &&
    isBookmarkScale(value.bookmarkScale)
  )
}

function isAppState(value: unknown): value is AppState {
  return (
    isRecord(value) &&
    value.version === STORAGE_VERSION &&
    Array.isArray(value.sections) &&
    value.sections.length > 0 &&
    value.sections.every(isSection) &&
    Array.isArray(value.bookmarks) &&
    value.bookmarks.every(isBookmark) &&
    Array.isArray(value.layout) &&
    value.layout.every(
      (column) => Array.isArray(column) && column.every(isLayoutItem),
    ) &&
    isLayoutSettings(value.settings)
  )
}

function normalizeState(state: AppState): AppState {
  const sections = state.sections.map((section) => ({
    id: section.id,
    name: section.name.trim(),
    collapsed: section.collapsed ?? false,
    bookmarkIds: [...new Set(section.bookmarkIds)],
  }))
  const sectionIds = new Set(sections.map((section) => section.id))
  const bookmarks = state.bookmarks
    .map((bookmark) => ({
      ...bookmark,
      sectionId:
        bookmark.sectionId && sectionIds.has(bookmark.sectionId)
          ? bookmark.sectionId
          : null,
      title: bookmark.title.trim(),
      url: normalizeBookmarkUrl(bookmark.url) ?? bookmark.url,
      faviconUrl: bookmark.faviconUrl || getFaviconUrl(bookmark.url),
    }))
    .filter((bookmark) => bookmark.title.length > 0)
  const bookmarksById = new Map(bookmarks.map((bookmark) => [bookmark.id, bookmark]))
  const assignedBookmarkIds = new Set<string>()
  const normalizedSections = sections.map((section) => ({
    ...section,
    bookmarkIds: section.bookmarkIds.filter((bookmarkId) => {
      const bookmark = bookmarksById.get(bookmarkId)
      if (
        !bookmark ||
        bookmark.sectionId !== section.id ||
        assignedBookmarkIds.has(bookmarkId)
      ) {
        return false
      }
      assignedBookmarkIds.add(bookmarkId)
      return true
    }),
  }))

  for (const bookmark of bookmarks) {
    if (bookmark.sectionId && !assignedBookmarkIds.has(bookmark.id)) {
      normalizedSections
        .find((section) => section.id === bookmark.sectionId)
        ?.bookmarkIds.push(bookmark.id)
      assignedBookmarkIds.add(bookmark.id)
    }
  }

  return {
    version: STORAGE_VERSION,
    sections: normalizedSections,
    bookmarks,
    layout: normalizeLayout(
      state.layout,
      clamp(
        Math.round(state.settings.columns),
        LAYOUT_LIMITS.minColumns,
        LAYOUT_LIMITS.maxColumns,
      ),
      normalizedSections,
      bookmarks,
    ),
    settings: {
      columns: clamp(
        Math.round(state.settings.columns),
        LAYOUT_LIMITS.minColumns,
        LAYOUT_LIMITS.maxColumns,
      ),
      bookmarkScale: state.settings.bookmarkScale,
    },
  }
}

function normalizeLayout(
  layout: LayoutItem[][],
  columnCount: number,
  sections: Section[],
  bookmarks: Bookmark[],
): LayoutItem[][] {
  const sectionIds = new Set(sections.map((section) => section.id))
  const topLevelBookmarkIds = new Set(
    bookmarks
      .filter((bookmark) => bookmark.sectionId === null)
      .map((bookmark) => bookmark.id),
  )
  const usedItemIds = new Set<string>()
  const normalizedLayout = Array.from({ length: columnCount }, () => [] as LayoutItem[])

  function addItem(item: LayoutItem, columnIndex: number): void {
    const isValidItem =
      (item.type === 'section' && sectionIds.has(item.id)) ||
      (item.type === 'bookmark' && topLevelBookmarkIds.has(item.id))
    if (!isValidItem || usedItemIds.has(item.id)) {
      return
    }

    normalizedLayout[Math.min(columnIndex, columnCount - 1)].push({ ...item })
    usedItemIds.add(item.id)
  }

  layout.forEach((column, columnIndex) => {
    column.forEach((item) => addItem(item, columnIndex))
  })

  const missingItems: LayoutItem[] = [
    ...sections.map((section) => ({ type: 'section' as const, id: section.id })),
    ...bookmarks
      .filter((bookmark) => bookmark.sectionId === null)
      .map((bookmark) => ({ type: 'bookmark' as const, id: bookmark.id })),
  ]
  missingItems.forEach((item, index) => {
    if (!usedItemIds.has(item.id)) {
      addItem(item, index % columnCount)
    }
  })

  return normalizedLayout
}

function isLegacyV2Section(value: unknown): value is {
  id: string
  name: string
  parentId: string | null
} {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    (value.parentId === null || typeof value.parentId === 'string')
  )
}

function isLegacyV2Bookmark(value: unknown): value is {
  id: string
  sectionId: string
  title: string
  url: string
  faviconUrl: string
} {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.sectionId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    typeof value.faviconUrl === 'string' &&
    normalizeBookmarkUrl(value.url) !== null
  )
}

function migrateV2State(value: unknown): AppState | null {
  if (!isRecord(value) || value.version !== 2) {
    return null
  }

  const legacySections = Array.isArray(value.sections)
    ? value.sections.filter(isLegacyV2Section)
    : []
  const sectionIds = new Set(legacySections.map((section) => section.id))
  const legacyBookmarks = Array.isArray(value.bookmarks)
    ? value.bookmarks
        .filter(isLegacyV2Bookmark)
        .filter((bookmark) => sectionIds.has(bookmark.sectionId))
    : []
  const settings = isRecord(value.settings) ? value.settings : null

  if (legacySections.length === 0 || !settings || typeof settings.columns !== 'number') {
    return null
  }

  const columnCount = clamp(
    Math.round(settings.columns),
    LAYOUT_LIMITS.minColumns,
    LAYOUT_LIMITS.maxColumns,
  )
  const bookmarks: Bookmark[] = legacyBookmarks.map((bookmark) => ({
    id: bookmark.id,
    sectionId: bookmark.sectionId,
    title: bookmark.title,
    url: bookmark.url,
    faviconUrl: bookmark.faviconUrl,
  }))
  const sections: Section[] = legacySections.map((section) => ({
    id: section.id,
    name: section.name,
    collapsed: false,
    bookmarkIds: bookmarks
      .filter((bookmark) => bookmark.sectionId === section.id)
      .map((bookmark) => bookmark.id),
  }))
  const sectionById = new Map(legacySections.map((section) => [section.id, section]))
  const rootColumnById = new Map<string, number>()
  let rootIndex = 0

  for (const section of legacySections) {
    if (section.parentId === null || !sectionIds.has(section.parentId)) {
      rootColumnById.set(section.id, rootIndex % columnCount)
      rootIndex += 1
    }
  }

  const layout = Array.from({ length: columnCount }, () => [] as LayoutItem[])
  for (const section of legacySections) {
    let rootSection = section
    const visitedIds = new Set<string>()
    while (rootSection.parentId && sectionById.has(rootSection.parentId)) {
      if (visitedIds.has(rootSection.id)) {
        break
      }
      visitedIds.add(rootSection.id)
      rootSection = sectionById.get(rootSection.parentId) ?? rootSection
    }
    const columnIndex = rootColumnById.get(rootSection.id) ?? 0
    layout[columnIndex].push({ type: 'section', id: section.id })
  }

  return normalizeState({
    version: STORAGE_VERSION,
    sections,
    bookmarks,
    layout,
    settings: {
      columns: columnCount,
      bookmarkScale: isBookmarkScale(settings.bookmarkScale)
        ? settings.bookmarkScale
        : 'Medium',
    },
  })
}

function isLegacyCategory(value: unknown): value is { id: string; name: string } {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  )
}

function isLegacyBookmark(value: unknown): value is {
  id: string
  categoryId: string
  title: string
  url: string
  faviconUrl?: string
} {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    normalizeBookmarkUrl(value.url) !== null
  )
}

function migrateLegacyState(value: unknown): AppState | null {
  if (!isRecord(value) || value.version !== 1) {
    return null
  }

  const categories = Array.isArray(value.categories)
    ? value.categories.filter(isLegacyCategory)
    : []
  const categoryIds = new Set(categories.map((category) => category.id))
  const bookmarks = Array.isArray(value.bookmarks)
    ? value.bookmarks
        .filter(isLegacyBookmark)
        .filter((bookmark) => categoryIds.has(bookmark.categoryId))
        .map((bookmark) => ({
          id: bookmark.id,
          sectionId: bookmark.categoryId,
          title: bookmark.title,
          url: bookmark.url,
          faviconUrl: bookmark.faviconUrl ?? getFaviconUrl(bookmark.url),
        }))
    : []
  const settings = isRecord(value.settings) ? value.settings : null

  if (categories.length === 0 || !settings || typeof settings.columns !== 'number') {
    return null
  }

  const columnCount = clamp(
    Math.round(settings.columns),
    LAYOUT_LIMITS.minColumns,
    LAYOUT_LIMITS.maxColumns,
  )
  const sections: Section[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    collapsed: false,
    bookmarkIds: bookmarks
      .filter((bookmark) => bookmark.sectionId === category.id)
      .map((bookmark) => bookmark.id),
  }))
  const layout = Array.from({ length: columnCount }, () => [] as LayoutItem[])
  sections.forEach((section, index) => {
    layout[index % columnCount].push({ type: 'section', id: section.id })
  })

  return normalizeState({
    version: STORAGE_VERSION,
    sections,
    bookmarks,
    layout,
    settings: {
      columns: columnCount,
      bookmarkScale: getScaleForHeight(
        typeof settings.bookmarkHeight === 'number' ? settings.bookmarkHeight : 56,
      ),
    },
  })
}

function parseStoredState(storedValue: string): AppState | null {
  const parsedValue: unknown = JSON.parse(storedValue)
  if (isAppState(parsedValue)) {
    return normalizeState(parsedValue)
  }
  return migrateV2State(parsedValue) ?? migrateLegacyState(parsedValue)
}

export function loadState(): AppState {
  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_CATEGORY_STORAGE_KEY)
    if (!storedValue) {
      return createDefaultState()
    }

    return parseStoredState(storedValue) ?? createDefaultState()
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
    sectionId: draft.sectionId,
    title,
    url: normalizedUrl,
    faviconUrl: getFaviconUrl(normalizedUrl),
  }
}
