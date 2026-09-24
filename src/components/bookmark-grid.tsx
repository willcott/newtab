import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { SortableCategory } from '@/components/sortable-category'
import { getBookmarksForCategory } from '@/lib/storage'
import type { AppState } from '@/types/bookmarks'

type BookmarkGridProps = {
  state: AppState
  editMode: boolean
  onAddBookmark: (categoryId?: string) => void
  onEditBookmark: (bookmarkId: string) => void
  onEditCategory: (categoryId: string) => void
}

export function BookmarkGrid({
  state,
  editMode,
  onAddBookmark,
  onEditBookmark,
  onEditCategory,
}: BookmarkGridProps) {
  const gridStyle = {
    '--column-count': state.settings.columns,
  } as CSSProperties
  const hasBookmarks = state.bookmarks.length > 0

  return (
    <section className="bookmark-grid-wrap" aria-label="Bookmark categories">
      {!hasBookmarks && (
        <div className="bookmark-empty-state">
          <span className="empty-kicker">A clear start</span>
          <h2>Your shortcuts belong here.</h2>
          <p>Add a bookmark and shape this page around the places you visit most.</p>
          {editMode && (
            <Button type="button" onClick={() => onAddBookmark()}>
              Add your first bookmark
            </Button>
          )}
        </div>
      )}
      <div className="bookmark-grid" style={gridStyle}>
        {state.categories.map((category) => (
          <SortableCategory
            key={category.id}
            category={category}
            bookmarks={getBookmarksForCategory(state, category.id)}
            bookmarkHeight={state.settings.bookmarkHeight}
            editMode={editMode}
            onAddBookmark={onAddBookmark}
            onEditBookmark={onEditBookmark}
            onEditCategory={onEditCategory}
          />
        ))}
      </div>
    </section>
  )
}
