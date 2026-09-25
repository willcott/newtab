import { useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { SortableBookmark } from '@/components/sortable-bookmark'
import { SortableSection } from '@/components/sortable-category'
import { getBookmarksForSection } from '@/lib/storage'
import type { AppState, LayoutItem } from '@/types/bookmarks'

type BookmarkGridProps = {
  state: AppState
  editMode: boolean
  onAddBookmark: (sectionId?: string) => void
  onEditBookmark: (bookmarkId: string) => void
  onEditSection: (sectionId: string) => void
  onToggleSection: (sectionId: string) => void
}

export function BookmarkGrid({
  state,
  editMode,
  onAddBookmark,
  onEditBookmark,
  onEditSection,
  onToggleSection,
}: BookmarkGridProps) {
  const gridStyle = {
    '--column-count': state.settings.columns,
  } as CSSProperties
  const hasBookmarks = state.bookmarks.length > 0

  return (
    <section className="bookmark-grid-wrap" aria-label="Bookmarks">
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
        {state.layout.map((items, columnIndex) => (
          <SortableColumn
            key={`column-${columnIndex}`}
            items={items}
            columnIndex={columnIndex}
            state={state}
            editMode={editMode}
            onAddBookmark={onAddBookmark}
            onEditBookmark={onEditBookmark}
            onEditSection={onEditSection}
            onToggleSection={onToggleSection}
          />
        ))}
      </div>
    </section>
  )
}

type SortableColumnProps = {
  items: LayoutItem[]
  columnIndex: number
  state: AppState
  editMode: boolean
  onAddBookmark: (sectionId?: string) => void
  onEditBookmark: (bookmarkId: string) => void
  onEditSection: (sectionId: string) => void
  onToggleSection: (sectionId: string) => void
}

function SortableColumn({
  items,
  columnIndex,
  state,
  editMode,
  onAddBookmark,
  onEditBookmark,
  onEditSection,
  onToggleSection,
}: SortableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnIndex}`,
    disabled: !editMode,
    data: { type: 'column', columnIndex },
  })
  const { setNodeRef: setTopDropZoneRef, isOver: isTopDropZoneOver } = useDroppable({
    id: `column-drop-top-${columnIndex}`,
    disabled: !editMode,
    data: {
      type: 'column',
      columnIndex,
      dropPosition: 'top',
      overItemId: items[0]?.id,
    },
  })
  const { setNodeRef: setBottomDropZoneRef, isOver: isBottomDropZoneOver } = useDroppable({
    id: `column-drop-bottom-${columnIndex}`,
    disabled: !editMode,
    data: { type: 'column', columnIndex, dropPosition: 'bottom' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`bookmark-column${isOver ? ' is-drop-target' : ''}`}
    >
      {editMode && (
        <div
          ref={setTopDropZoneRef}
          className={`column-drop-zone${isTopDropZoneOver ? ' is-drop-target' : ''}`}
          aria-label={`Drop items at the top of column ${columnIndex + 1}`}
          data-drop-position="top"
        />
      )}
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => {
          if (item.type === 'section') {
            const section = state.sections.find((candidate) => candidate.id === item.id)
            if (!section) {
              return null
            }

            return (
              <SortableSection
                key={section.id}
                section={section}
                bookmarks={getBookmarksForSection(state, section.id)}
                bookmarkScale={state.settings.bookmarkScale}
                columnIndex={columnIndex}
                editMode={editMode}
                onAddBookmark={onAddBookmark}
                onEditBookmark={onEditBookmark}
                onEditSection={onEditSection}
                onToggleSection={onToggleSection}
              />
            )
          }

          const bookmark = state.bookmarks.find(
            (candidate) => candidate.id === item.id && candidate.sectionId === null,
          )
          if (!bookmark) {
            return null
          }

          return (
            <SortableBookmark
              key={bookmark.id}
              bookmark={bookmark}
              bookmarkScale={state.settings.bookmarkScale}
              columnIndex={columnIndex}
              editMode={editMode}
              onEdit={onEditBookmark}
            />
          )
        })}
      </SortableContext>
      {editMode && (
        <div
          ref={setBottomDropZoneRef}
          className={`column-drop-zone${isBottomDropZoneOver ? ' is-drop-target' : ''}`}
          aria-label={`Drop items at the bottom of column ${columnIndex + 1}`}
          data-drop-position="bottom"
        />
      )}
    </div>
  )
}
