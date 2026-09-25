import { useEffect, useState } from 'react'
import {
  createBookmark,
  createId,
  getFaviconUrl,
  loadState,
  normalizeBookmarkUrl,
  saveState,
} from '@/lib/storage'
import {
  LAYOUT_LIMITS,
  type AppState,
  type BookmarkDraft,
  type LayoutItem,
  type Section,
} from '@/types/bookmarks'

export type BookmarkDestination =
  | {
      type: 'column'
      columnIndex: number
      overItemId?: string
    }
  | {
      type: 'section'
      sectionId: string
      overBookmarkId?: string
    }

export function useBookmarkStore() {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  function addSection(name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setState((currentState) => {
      const section: Section = {
        id: createId('section'),
        name: trimmedName,
        collapsed: false,
        bookmarkIds: [],
      }

      return {
        ...currentState,
        sections: [...currentState.sections, section],
        layout: appendLayoutItem(currentState.layout, 0, {
          type: 'section',
          id: section.id,
        }),
      }
    })
  }

  function updateSection(sectionId: string, name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      sections: currentState.sections.map((section) =>
        section.id === sectionId ? { ...section, name: trimmedName } : section,
      ),
    }))
  }

  function toggleSectionCollapsed(sectionId: string): void {
    setState((currentState) => ({
      ...currentState,
      sections: currentState.sections.map((section) =>
        section.id === sectionId
          ? { ...section, collapsed: !section.collapsed }
          : section,
      ),
    }))
  }

  function deleteSection(sectionId: string, destinationSectionId?: string): void {
    setState((currentState) => {
      if (currentState.sections.length <= 1) {
        return currentState
      }

      const section = currentState.sections.find((candidate) => candidate.id === sectionId)
      if (!section) {
        return currentState
      }

      const destinationSection = destinationSectionId
        ? currentState.sections.find(
            (candidate) => candidate.id === destinationSectionId && candidate.id !== sectionId,
          )
        : undefined
      if (section.bookmarkIds.length > 0 && !destinationSection) {
        return currentState
      }

      const sections = currentState.sections
        .filter((candidate) => candidate.id !== sectionId)
        .map((candidate) =>
          candidate.id === destinationSection?.id
            ? {
                ...candidate,
                bookmarkIds: [...candidate.bookmarkIds, ...section.bookmarkIds],
              }
            : candidate,
        )
      const bookmarks = destinationSection
        ? currentState.bookmarks.map((bookmark) =>
            bookmark.sectionId === sectionId
              ? { ...bookmark, sectionId: destinationSection.id }
              : bookmark,
          )
        : currentState.bookmarks

      return {
        ...currentState,
        sections,
        bookmarks,
        layout: removeLayoutItem(currentState.layout, 'section', sectionId),
      }
    })
  }

  function addBookmark(draft: BookmarkDraft): void {
    const bookmark = createBookmark(draft)
    if (!bookmark) {
      return
    }

    setState((currentState) => {
      const sectionId = isValidSectionId(currentState.sections, draft.sectionId)
        ? draft.sectionId
        : null
      const nextBookmark = { ...bookmark, sectionId }
      const sections = sectionId
        ? currentState.sections.map((section) =>
            section.id === sectionId
              ? { ...section, bookmarkIds: [...section.bookmarkIds, nextBookmark.id] }
              : section,
          )
        : currentState.sections

      return {
        ...currentState,
        sections,
        bookmarks: [...currentState.bookmarks, nextBookmark],
        layout: sectionId
          ? currentState.layout
          : appendLayoutItem(currentState.layout, 0, {
              type: 'bookmark',
              id: nextBookmark.id,
            }),
      }
    })
  }

  function updateBookmark(bookmarkId: string, draft: BookmarkDraft): void {
    const normalizedUrl = normalizeBookmarkUrl(draft.url)
    const title = draft.title.trim()
    if (!normalizedUrl || !title) {
      return
    }

    setState((currentState) => {
      const currentBookmark = currentState.bookmarks.find(
        (bookmark) => bookmark.id === bookmarkId,
      )
      if (!currentBookmark) {
        return currentState
      }

      const sectionId = isValidSectionId(currentState.sections, draft.sectionId)
        ? draft.sectionId
        : null
      const sectionChanged = currentBookmark.sectionId !== sectionId
      const bookmarks = currentState.bookmarks.map((bookmark) =>
        bookmark.id === bookmarkId
          ? {
              ...bookmark,
              title,
              url: normalizedUrl,
              sectionId,
              faviconUrl: getFaviconUrl(normalizedUrl),
            }
          : bookmark,
      )
      const sections = sectionChanged
        ? currentState.sections.map((section) => ({
            ...section,
            bookmarkIds:
              section.id === sectionId
                ? [...section.bookmarkIds.filter((id) => id !== bookmarkId), bookmarkId]
                : section.bookmarkIds.filter((id) => id !== bookmarkId),
          }))
        : currentState.sections
      let layout = currentState.layout
      if (sectionChanged && currentBookmark.sectionId === null && sectionId !== null) {
        layout = removeLayoutItem(layout, 'bookmark', bookmarkId)
      } else if (sectionChanged && currentBookmark.sectionId !== null && sectionId === null) {
        layout = appendLayoutItem(layout, 0, { type: 'bookmark', id: bookmarkId })
      }

      return { ...currentState, bookmarks, sections, layout }
    })
  }

  function deleteBookmark(bookmarkId: string): void {
    setState((currentState) => ({
      ...currentState,
      sections: currentState.sections.map((section) => ({
        ...section,
        bookmarkIds: section.bookmarkIds.filter((id) => id !== bookmarkId),
      })),
      bookmarks: currentState.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
      layout: removeLayoutItem(currentState.layout, 'bookmark', bookmarkId),
    }))
  }

  function updateSettings(settings: Partial<AppState['settings']>): void {
    setState((currentState) => {
      const columns = clamp(
        settings.columns ?? currentState.settings.columns,
        LAYOUT_LIMITS.minColumns,
        LAYOUT_LIMITS.maxColumns,
      )

      return {
        ...currentState,
        layout: resizeLayout(currentState.layout, columns),
        settings: {
          columns,
          bookmarkScale: settings.bookmarkScale ?? currentState.settings.bookmarkScale,
        },
      }
    })
  }

  function moveSection(sectionId: string, columnIndex: number, overItemId?: string): void {
    setState((currentState) =>
      moveLayoutItem(currentState, { type: 'section', id: sectionId }, columnIndex, overItemId),
    )
  }

  function moveBookmark(bookmarkId: string, destination: BookmarkDestination): void {
    setState((currentState) => {
      const activeBookmark = currentState.bookmarks.find(
        (bookmark) => bookmark.id === bookmarkId,
      )
      if (!activeBookmark) {
        return currentState
      }

      if (destination.type === 'section') {
        const destinationSection = currentState.sections.find(
          (section) => section.id === destination.sectionId,
        )
        if (!destinationSection) {
          return currentState
        }

        const destinationBookmarkIds = destinationSection.bookmarkIds.filter(
          (id) => id !== bookmarkId,
        )
        const overIndex = destination.overBookmarkId
          ? destinationBookmarkIds.indexOf(destination.overBookmarkId)
          : -1
        destinationBookmarkIds.splice(
          overIndex < 0 ? destinationBookmarkIds.length : overIndex,
          0,
          bookmarkId,
        )
        const sections = currentState.sections.map((section) => ({
          ...section,
          bookmarkIds:
            section.id === destination.sectionId
              ? destinationBookmarkIds
              : section.bookmarkIds.filter((id) => id !== bookmarkId),
        }))

        return {
          ...currentState,
          sections,
          bookmarks: currentState.bookmarks.map((bookmark) =>
            bookmark.id === bookmarkId
              ? { ...bookmark, sectionId: destination.sectionId }
              : bookmark,
          ),
          layout:
            activeBookmark.sectionId === null
              ? removeLayoutItem(currentState.layout, 'bookmark', bookmarkId)
              : currentState.layout,
        }
      }

      if (
        destination.columnIndex < 0 ||
        destination.columnIndex >= currentState.layout.length
      ) {
        return currentState
      }

      let nextState = currentState
      if (activeBookmark.sectionId !== null) {
        nextState = {
          ...currentState,
          sections: currentState.sections.map((section) => ({
            ...section,
            bookmarkIds: section.bookmarkIds.filter((id) => id !== bookmarkId),
          })),
          bookmarks: currentState.bookmarks.map((bookmark) =>
            bookmark.id === bookmarkId ? { ...bookmark, sectionId: null } : bookmark,
          ),
          layout: appendLayoutItem(currentState.layout, 0, {
            type: 'bookmark',
            id: bookmarkId,
          }),
        }
      }

      return moveLayoutItem(
        nextState,
        { type: 'bookmark', id: bookmarkId },
        destination.columnIndex,
        destination.overItemId,
      )
    })
  }

  function resetState(): void {
    setState(loadState())
  }

  return {
    state,
    addSection,
    updateSection,
    toggleSectionCollapsed,
    deleteSection,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    updateSettings,
    moveSection,
    moveBookmark,
    resetState,
  }
}

function isValidSectionId(sections: Section[], sectionId: string | null): sectionId is string {
  return sectionId !== null && sections.some((section) => section.id === sectionId)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max)
}

function appendLayoutItem(
  layout: LayoutItem[][],
  columnIndex: number,
  item: LayoutItem,
): LayoutItem[][] {
  const nextLayout = layout.map((column) => [...column])
  const safeColumnIndex = Math.min(Math.max(columnIndex, 0), nextLayout.length - 1)
  if (safeColumnIndex < 0) {
    return nextLayout
  }

  nextLayout[safeColumnIndex].push(item)
  return nextLayout
}

function removeLayoutItem(
  layout: LayoutItem[][],
  type: LayoutItem['type'],
  id: string,
): LayoutItem[][] {
  return layout.map((column) =>
    column.filter((item) => item.type !== type || item.id !== id),
  )
}

function resizeLayout(layout: LayoutItem[][], columnCount: number): LayoutItem[][] {
  const nextLayout = Array.from({ length: columnCount }, (_, index) => [
    ...(layout[index] ?? []),
  ])
  if (layout.length > columnCount) {
    for (let index = columnCount; index < layout.length; index += 1) {
      nextLayout[columnCount - 1].push(...layout[index])
    }
  }
  return nextLayout
}

function moveLayoutItem(
  state: AppState,
  activeItem: LayoutItem,
  destinationColumnIndex: number,
  overItemId?: string,
): AppState {
  if (
    destinationColumnIndex < 0 ||
    destinationColumnIndex >= state.layout.length
  ) {
    return state
  }

  const activeColumnIndex = state.layout.findIndex((column) =>
    column.some((item) => item.type === activeItem.type && item.id === activeItem.id),
  )
  if (activeColumnIndex < 0 || overItemId === activeItem.id) {
    return state
  }

  const nextLayout = state.layout.map((column) => [...column])
  const activeIndex = nextLayout[activeColumnIndex].findIndex(
    (item) => item.type === activeItem.type && item.id === activeItem.id,
  )
  const [movedItem] = nextLayout[activeColumnIndex].splice(activeIndex, 1)
  const destinationItems = nextLayout[destinationColumnIndex]
  const overIndex = overItemId
    ? destinationItems.findIndex((item) => item.id === overItemId)
    : -1
  destinationItems.splice(overIndex < 0 ? destinationItems.length : overIndex, 0, movedItem)

  return { ...state, layout: nextLayout }
}
