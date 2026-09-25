import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Globe2, Pencil } from 'lucide-react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { getBookmarkMetrics, type Bookmark, type BookmarkScale } from '@/types/bookmarks'

type SortableBookmarkProps = {
  bookmark: Bookmark
  bookmarkScale: BookmarkScale
  columnIndex: number
  editMode: boolean
  onEdit: (bookmarkId: string) => void
}

export function SortableBookmark({
  bookmark,
  bookmarkScale,
  columnIndex,
  editMode,
  onEdit,
}: SortableBookmarkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: bookmark.id,
      disabled: !editMode,
      data: {
        type: 'bookmark',
        sectionId: bookmark.sectionId,
        columnIndex,
        containerId: bookmark.sectionId,
      },
    })

  const metrics = getBookmarkMetrics(bookmarkScale)
  const style = {
    '--bookmark-height': `${metrics.height}px`,
    '--bookmark-title-size': `${metrics.titleSize}px`,
    '--bookmark-favicon-size': `${metrics.faviconSize}px`,
    '--bookmark-favicon-icon-size': `${metrics.faviconIconSize}px`,
    '--bookmark-arrow-size': `${metrics.arrowSize}px`,
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onEdit(bookmark.id)
    }
  }

  const bookmarkContent = (
    <>
      <span className="bookmark-favicon" aria-hidden="true">
        <Globe2 className="bookmark-fallback-icon" />
        <img
          className="bookmark-favicon-image"
          src={bookmark.faviconUrl}
          alt=""
          onError={(event) => event.currentTarget.classList.add('is-hidden')}
        />
      </span>
      <span className="bookmark-title">{bookmark.title}</span>
      {!editMode && <span className="bookmark-arrow" aria-hidden="true">↗</span>}
    </>
  )

  return (
    <div
      ref={setNodeRef}
      className={`bookmark-item${isDragging ? ' is-dragging' : ''}`}
      style={style}
    >
      {editMode ? (
        <div
          className="bookmark-link bookmark-link-edit"
          role="button"
          tabIndex={0}
          onClick={() => onEdit(bookmark.id)}
          onKeyDown={handleKeyDown}
        >
          {bookmarkContent}
          <span className="bookmark-actions">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="bookmark-action"
              aria-label={`Edit ${bookmark.title}`}
              title={`Edit ${bookmark.title}`}
              onClick={(event) => {
                event.stopPropagation()
                onEdit(bookmark.id)
              }}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="bookmark-drag-handle"
              aria-label={`Reorder ${bookmark.title}`}
              title={`Reorder ${bookmark.title}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
          </span>
        </div>
      ) : (
        <a className="bookmark-link" href={bookmark.url}>
          {bookmarkContent}
        </a>
      )}
    </div>
  )
}
