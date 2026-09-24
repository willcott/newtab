import { useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { SortableBookmark } from '@/components/sortable-bookmark'
import type { Bookmark, Category } from '@/types/bookmarks'

type SortableCategoryProps = {
  category: Category
  bookmarks: Bookmark[]
  bookmarkHeight: number
  editMode: boolean
  onAddBookmark: (categoryId: string) => void
  onEditBookmark: (bookmarkId: string) => void
  onEditCategory: (categoryId: string) => void
}

export function SortableCategory({
  category,
  bookmarks,
  bookmarkHeight,
  editMode,
  onAddBookmark,
  onEditBookmark,
  onEditCategory,
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    disabled: !editMode,
    data: { type: 'category', categoryId: category.id },
  })
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `category-drop-${category.id}`,
    data: { type: 'category-drop', categoryId: category.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as CSSProperties

  return (
    <section
      ref={setNodeRef}
      className={`bookmark-column${isDragging ? ' is-dragging' : ''}`}
      style={style}
      aria-labelledby={`category-${category.id}`}
    >
      <div className="category-heading">
        {editMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="category-drag-handle"
            aria-label={`Reorder ${category.name}`}
            title={`Reorder ${category.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>
        )}
        <h2 id={`category-${category.id}`}>{category.name}</h2>
        <span className="category-count">{bookmarks.length}</span>
        {editMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="category-edit-button"
            aria-label={`Edit ${category.name}`}
            title={`Edit ${category.name}`}
            onClick={() => onEditCategory(category.id)}
          >
            <Pencil />
          </Button>
        )}
      </div>
      <div
        ref={setDropNodeRef}
        className={`category-bookmarks${isOver ? ' is-drop-target' : ''}`}
      >
        <SortableContext
          items={bookmarks.map((bookmark) => bookmark.id)}
          strategy={verticalListSortingStrategy}
        >
          {bookmarks.map((bookmark) => (
            <SortableBookmark
              key={bookmark.id}
              bookmark={bookmark}
              bookmarkHeight={bookmarkHeight}
              editMode={editMode}
              onEdit={onEditBookmark}
            />
          ))}
        </SortableContext>
        {bookmarks.length === 0 && (
          <div className="category-empty">
            {editMode ? 'Drop bookmarks here' : 'No bookmarks yet'}
          </div>
        )}
      </div>
      {editMode && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="add-bookmark-button"
          onClick={() => onAddBookmark(category.id)}
        >
          <Plus />
          Add bookmark
        </Button>
      )}
    </section>
  )
}
