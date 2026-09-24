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
} from '@/types/bookmarks'

export function useBookmarkStore() {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  function addCategory(name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      categories: [
        ...currentState.categories,
        { id: createId('category'), name: trimmedName },
      ],
    }))
  }

  function updateCategory(categoryId: string, name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      categories: currentState.categories.map((category) =>
        category.id === categoryId ? { ...category, name: trimmedName } : category,
      ),
    }))
  }

  function deleteCategory(categoryId: string, destinationCategoryId?: string): void {
    setState((currentState) => {
      if (currentState.categories.length <= 1) {
        return currentState
      }

      const destinationCategory = currentState.categories.find(
        (category) =>
          category.id !== categoryId &&
          (!destinationCategoryId || category.id === destinationCategoryId),
      )
      if (!destinationCategory) {
        return currentState
      }

      return {
        ...currentState,
        categories: currentState.categories.filter((category) => category.id !== categoryId),
        bookmarks: currentState.bookmarks.map((bookmark) =>
          bookmark.categoryId === categoryId
            ? { ...bookmark, categoryId: destinationCategory.id }
            : bookmark,
        ),
      }
    })
  }

  function addBookmark(draft: BookmarkDraft): void {
    const bookmark = createBookmark(draft)
    if (!bookmark) {
      return
    }

    setState((currentState) => {
      const categoryExists = currentState.categories.some(
        (category) => category.id === bookmark.categoryId,
      )
      const categoryId = categoryExists
        ? bookmark.categoryId
        : currentState.categories[0]?.id
      if (!categoryId) {
        return currentState
      }

      return {
        ...currentState,
        bookmarks: [...currentState.bookmarks, { ...bookmark, categoryId }],
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
      const categoryExists = currentState.categories.some(
        (category) => category.id === draft.categoryId,
      )
      const categoryId = categoryExists
        ? draft.categoryId
        : currentState.categories[0]?.id
      if (!categoryId) {
        return currentState
      }

      return {
        ...currentState,
        bookmarks: currentState.bookmarks.map((bookmark) =>
          bookmark.id === bookmarkId
            ? {
                ...bookmark,
                title,
                url: normalizedUrl,
                categoryId,
                faviconUrl: getFaviconUrl(normalizedUrl),
              }
            : bookmark,
        ),
      }
    })
  }

  function deleteBookmark(bookmarkId: string): void {
    setState((currentState) => ({
      ...currentState,
      bookmarks: currentState.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
    }))
  }

  function updateSettings(settings: Partial<AppState['settings']>): void {
    setState((currentState) => ({
      ...currentState,
      settings: {
        columns: settings.columns === undefined
          ? currentState.settings.columns
          : Math.min(
              Math.max(settings.columns, LAYOUT_LIMITS.minColumns),
              LAYOUT_LIMITS.maxColumns,
            ),
        bookmarkHeight: settings.bookmarkHeight === undefined
          ? currentState.settings.bookmarkHeight
          : Math.min(
              Math.max(settings.bookmarkHeight, LAYOUT_LIMITS.minBookmarkHeight),
              LAYOUT_LIMITS.maxBookmarkHeight,
            ),
      },
    }))
  }

  function reorderCategories(activeCategoryId: string, overCategoryId: string): void {
    setState((currentState) => {
      const activeIndex = currentState.categories.findIndex(
        (category) => category.id === activeCategoryId,
      )
      const overIndex = currentState.categories.findIndex(
        (category) => category.id === overCategoryId,
      )
      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return currentState
      }

      const categories = [...currentState.categories]
      const [activeCategory] = categories.splice(activeIndex, 1)
      categories.splice(overIndex, 0, activeCategory)
      return { ...currentState, categories }
    })
  }

  function moveBookmark(
    bookmarkId: string,
    destinationCategoryId: string,
    overBookmarkId?: string,
  ): void {
    setState((currentState) => {
      const activeBookmark = currentState.bookmarks.find(
        (bookmark) => bookmark.id === bookmarkId,
      )
      const destinationExists = currentState.categories.some(
        (category) => category.id === destinationCategoryId,
      )
      if (!activeBookmark || !destinationExists) {
        return currentState
      }

      const remainingBookmarks = currentState.bookmarks.filter(
        (bookmark) => bookmark.id !== bookmarkId,
      )
      const destinationBookmarks = remainingBookmarks.filter(
        (bookmark) => bookmark.categoryId === destinationCategoryId,
      )
      const overIndex = overBookmarkId
        ? destinationBookmarks.findIndex((bookmark) => bookmark.id === overBookmarkId)
        : -1
      const insertionIndex = overIndex < 0 ? destinationBookmarks.length : overIndex
      destinationBookmarks.splice(insertionIndex, 0, {
        ...activeBookmark,
        categoryId: destinationCategoryId,
      })

      const bookmarks = currentState.categories.flatMap((category) =>
        category.id === destinationCategoryId
          ? destinationBookmarks
          : remainingBookmarks.filter((bookmark) => bookmark.categoryId === category.id),
      )

      return { ...currentState, bookmarks }
    })
  }

  function resetState(): void {
    setState(loadState())
  }

  return {
    state,
    addCategory,
    updateCategory,
    deleteCategory,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    updateSettings,
    reorderCategories,
    moveBookmark,
    resetState,
  }
}
