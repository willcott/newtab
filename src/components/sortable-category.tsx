import { useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { SortableBookmark } from '@/components/sortable-bookmark'
import {
  type Bookmark,
  type BookmarkScale,
  type Section,
} from '@/types/bookmarks'

type SortableSectionProps = {
  section: Section
  bookmarks: Bookmark[]
  bookmarkScale: BookmarkScale
  columnIndex: number
  editMode: boolean
  onAddBookmark: (sectionId: string) => void
  onEditBookmark: (bookmarkId: string) => void
  onEditSection: (sectionId: string) => void
  onToggleSection: (sectionId: string) => void
}

export function SortableSection({
  section,
  bookmarks,
  bookmarkScale,
  columnIndex,
  editMode,
  onAddBookmark,
  onEditBookmark,
  onEditSection,
  onToggleSection,
}: SortableSectionProps) {
  const isExpanded = !section.collapsed
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: !editMode,
    data: { type: 'section', sectionId: section.id, columnIndex },
  })
  const { setNodeRef: setDropNodeRef, isOver: isBookmarkOver } = useDroppable({
    id: `section-bookmarks-${section.id}`,
    data: {
      type: 'section-bookmark-drop',
      sectionId: section.id,
      columnIndex,
      containerId: section.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties
  const bookmarksId = `section-bookmarks-${section.id}`
  const collapseLabel = `${isExpanded ? 'Collapse' : 'Expand'} ${section.name}`

  return (
    <section
      className={`section-item${isDragging ? ' is-dragging' : ''}`}
      style={style}
      aria-labelledby={`section-${section.id}`}
    >
      <div
        ref={setNodeRef}
        className="section-heading"
      >
        {editMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="section-drag-handle"
            aria-label={`Reorder ${section.name}`}
            title={`Reorder ${section.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="section-collapse-button"
          aria-label={collapseLabel}
          aria-controls={bookmarksId}
          aria-expanded={isExpanded}
          title={collapseLabel}
          onClick={() => onToggleSection(section.id)}
        >
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </Button>
        <h2 id={`section-${section.id}`}>{section.name}</h2>
        {editMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="section-edit-button"
            aria-label={`Edit ${section.name}`}
            title={`Edit ${section.name}`}
            onClick={() => onEditSection(section.id)}
          >
            <Pencil />
          </Button>
        )}
      </div>
      <div
        ref={setDropNodeRef}
        id={bookmarksId}
        hidden={!isExpanded}
        className={`section-bookmarks${isBookmarkOver ? ' is-drop-target' : ''}`}
      >
        <SortableContext
          items={bookmarks.map((bookmark) => bookmark.id)}
          strategy={verticalListSortingStrategy}
        >
          {bookmarks.map((bookmark) => (
            <SortableBookmark
              key={bookmark.id}
              bookmark={bookmark}
              bookmarkScale={bookmarkScale}
              columnIndex={columnIndex}
              editMode={editMode}
              onEdit={onEditBookmark}
            />
          ))}
        </SortableContext>
        {bookmarks.length === 0 && (
          <div className="section-empty">
            {editMode ? 'Drop bookmarks here' : 'No bookmarks yet'}
          </div>
        )}
      </div>
      {editMode && isExpanded && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="add-bookmark-button"
          onClick={() => onAddBookmark(section.id)}
        >
          <Plus />
          Add bookmark
        </Button>
      )}
    </section>
  )
}
