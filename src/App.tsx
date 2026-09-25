import {
  closestCenter,
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Check, GripVertical, Pencil } from 'lucide-react'
import { useState } from 'react'
import { BookmarkEditor } from '@/components/bookmark-editor'
import { BookmarkGrid } from '@/components/bookmark-grid'
import { SectionEditor } from '@/components/category-editor'
import { EditToolbar } from '@/components/edit-toolbar'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useBookmarkStore } from '@/hooks/use-bookmark-store'
import type { BookmarkDraft } from '@/types/bookmarks'

type DragData = {
  type: 'column' | 'section' | 'section-bookmark-drop' | 'bookmark'
  sectionId?: string | null
  columnIndex?: number
  containerId?: string | null
  overItemId?: string
  dropPosition?: 'top' | 'bottom'
}

function collisionDetectionStrategy(...args: Parameters<typeof closestCenter>) {
  const pointerCollisions = pointerWithin(...args)
  return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(...args)
}

function App() {
  const store = useBookmarkStore()
  const [editMode, setEditMode] = useState(false)
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null)
  const [newBookmarkSectionId, setNewBookmarkSectionId] = useState<string | undefined>()
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const editingBookmark = store.state.bookmarks.find(
    (bookmark) => bookmark.id === editingBookmarkId,
  )
  const editingSection = store.state.sections.find(
    (section) => section.id === editingSectionId,
  )
  const activeBookmark = store.state.bookmarks.find((bookmark) => bookmark.id === activeDragId)
  const activeSection = store.state.sections.find((section) => section.id === activeDragId)

  function openNewBookmark(sectionId?: string): void {
    setEditingBookmarkId(null)
    setNewBookmarkSectionId(sectionId)
    setBookmarkDialogOpen(true)
  }

  function openBookmarkEditor(bookmarkId: string): void {
    setEditingBookmarkId(bookmarkId)
    setNewBookmarkSectionId(undefined)
    setBookmarkDialogOpen(true)
  }

  function openNewSection(): void {
    setEditingSectionId(null)
    setSectionDialogOpen(true)
  }

  function openSectionEditor(sectionId: string): void {
    setEditingSectionId(sectionId)
    setSectionDialogOpen(true)
  }

  function handleBookmarkSave(draft: BookmarkDraft): void {
    if (editingBookmarkId) {
      store.updateBookmark(editingBookmarkId, draft)
    } else {
      store.addBookmark(draft)
    }
  }

  function handleSectionSave(name: string): void {
    if (editingSectionId) {
      store.updateSection(editingSectionId, name)
    } else {
      store.addSection(name)
    }
  }

  function handleDragStart(event: DragStartEvent): void {
    setActiveDragId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    setActiveDragId(null)
    if (!over) {
      return
    }

    const activeData = active.data.current as DragData | undefined
    const overData = over.data.current as DragData | undefined
    const topColumnItemId =
      overData?.type === 'column' &&
      (overData.dropPosition === 'top' || String(over.id).startsWith('column-drop-top-'))
        ? overData.overItemId ??
          (overData.columnIndex === undefined
            ? undefined
            : store.state.layout[overData.columnIndex]?.[0]?.id)
        : undefined
    if (activeData?.type === 'section') {
      const destinationColumnIndex = overData?.columnIndex
      if (destinationColumnIndex === undefined) {
        return
      }
      const overItemId =
        overData?.type === 'section'
          ? String(over.id)
          : overData?.type === 'bookmark'
            ? overData.containerId ?? String(over.id)
            : overData?.type === 'section-bookmark-drop'
              ? overData.containerId ?? overData.sectionId ?? undefined
              : topColumnItemId
      store.moveSection(String(active.id), destinationColumnIndex, overItemId)
      return
    }

    if (activeData?.type !== 'bookmark') {
      return
    }

    if (
      (overData?.type === 'section' || overData?.type === 'section-bookmark-drop') &&
      overData.sectionId
    ) {
      store.moveBookmark(String(active.id), {
        type: 'section',
        sectionId: overData.sectionId,
        overBookmarkId: undefined,
      })
      return
    }

    if (overData?.type === 'bookmark' && overData.sectionId) {
      store.moveBookmark(String(active.id), {
        type: 'section',
        sectionId: overData.sectionId,
        overBookmarkId: String(over.id),
      })
      return
    }

    const destinationColumnIndex = overData?.columnIndex ?? activeData.columnIndex
    if (destinationColumnIndex === undefined) {
      return
    }
    store.moveBookmark(String(active.id), {
      type: 'column',
      columnIndex: destinationColumnIndex,
      overItemId:
        topColumnItemId ??
        (overData?.type === 'bookmark' ? String(over.id) : undefined),
    })
  }

  function handleDragCancel(): void {
    setActiveDragId(null)
  }

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="app-shell">
          {editMode && (
            <EditToolbar
              settings={store.state.settings}
              onSettingsChange={store.updateSettings}
              onAddBookmark={() => openNewBookmark()}
              onAddSection={openNewSection}
            />
          )}

          <main className="page-content">
            <BookmarkGrid
              state={store.state}
              editMode={editMode}
              onAddBookmark={openNewBookmark}
              onEditBookmark={openBookmarkEditor}
              onEditSection={openSectionEditor}
              onToggleSection={store.toggleSectionCollapsed}
            />
          </main>

          <Button
            type="button"
            variant={editMode ? 'default' : 'outline'}
            size="icon-sm"
            className="edit-mode-button"
            aria-label={editMode ? 'Done' : 'Edit'}
            title={editMode ? 'Done' : 'Edit'}
            onClick={() => setEditMode((current) => !current)}
          >
            {editMode ? <Check /> : <Pencil />}
          </Button>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBookmark && (
            <div className="drag-preview">
              <GripVertical aria-hidden="true" />
              <span>{activeBookmark.title}</span>
            </div>
          )}
          {!activeBookmark && activeSection && (
            <div className="drag-preview">
              <GripVertical aria-hidden="true" />
              <span>{activeSection.name}</span>
            </div>
          )}
        </DragOverlay>

        <BookmarkEditor
          key={`bookmark-editor-${bookmarkDialogOpen}-${editingBookmarkId ?? 'new'}`}
          open={bookmarkDialogOpen}
          bookmark={editingBookmark}
          sections={store.state.sections}
          defaultSectionId={newBookmarkSectionId}
          onOpenChange={setBookmarkDialogOpen}
          onSave={handleBookmarkSave}
          onDelete={store.deleteBookmark}
        />
        <SectionEditor
          key={`section-editor-${sectionDialogOpen}-${editingSectionId ?? 'new'}`}
          open={sectionDialogOpen}
          section={editingSection}
          sections={store.state.sections}
          bookmarkCount={editingSection ? store.state.bookmarks.filter((bookmark) => bookmark.sectionId === editingSection.id).length : 0}
          onOpenChange={setSectionDialogOpen}
          onSave={handleSectionSave}
          onDelete={store.deleteSection}
        />
      </DndContext>
    </TooltipProvider>
  )
}

export default App
