import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Check, GripVertical, Pencil, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { BookmarkEditor } from '@/components/bookmark-editor'
import { BookmarkGrid } from '@/components/bookmark-grid'
import { CategoryEditor } from '@/components/category-editor'
import { EditToolbar } from '@/components/edit-toolbar'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useBookmarkStore } from '@/hooks/use-bookmark-store'
import type { BookmarkDraft } from '@/types/bookmarks'

type DragData = {
  type: 'category' | 'bookmark' | 'category-drop'
  categoryId?: string
}

function App() {
  const store = useBookmarkStore()
  const [editMode, setEditMode] = useState(false)
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null)
  const [newBookmarkCategoryId, setNewBookmarkCategoryId] = useState<string | undefined>()
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const editingBookmark = store.state.bookmarks.find(
    (bookmark) => bookmark.id === editingBookmarkId,
  )
  const editingCategory = store.state.categories.find(
    (category) => category.id === editingCategoryId,
  )
  const activeBookmark = store.state.bookmarks.find(
    (bookmark) => bookmark.id === activeDragId,
  )
  const activeCategory = store.state.categories.find(
    (category) => category.id === activeDragId,
  )

  function openNewBookmark(categoryId?: string): void {
    setEditingBookmarkId(null)
    setNewBookmarkCategoryId(categoryId)
    setBookmarkDialogOpen(true)
  }

  function openBookmarkEditor(bookmarkId: string): void {
    setEditingBookmarkId(bookmarkId)
    setNewBookmarkCategoryId(undefined)
    setBookmarkDialogOpen(true)
  }

  function openNewCategory(): void {
    setEditingCategoryId(null)
    setCategoryDialogOpen(true)
  }

  function openCategoryEditor(categoryId: string): void {
    setEditingCategoryId(categoryId)
    setCategoryDialogOpen(true)
  }

  function handleBookmarkSave(draft: BookmarkDraft): void {
    if (editingBookmarkId) {
      store.updateBookmark(editingBookmarkId, draft)
    } else {
      store.addBookmark(draft)
    }
  }

  function handleCategorySave(name: string): void {
    if (editingCategoryId) {
      store.updateCategory(editingCategoryId, name)
    } else {
      store.addCategory(name)
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
    if (activeData?.type === 'category' && overData?.type === 'category') {
      store.reorderCategories(String(active.id), String(over.id))
      return
    }

    if (activeData?.type !== 'bookmark') {
      return
    }

    const destinationCategoryId =
      overData?.type === 'bookmark' || overData?.type === 'category' || overData?.type === 'category-drop'
        ? overData.categoryId
        : activeData.categoryId
    if (!destinationCategoryId) {
      return
    }

    const overBookmarkId = overData?.type === 'bookmark' ? String(over.id) : undefined
    store.moveBookmark(String(active.id), destinationCategoryId, overBookmarkId)
  }

  function handleDragCancel(): void {
    setActiveDragId(null)
  }

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="app-shell">
          <header className="app-header">
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden="true">
                <Sparkles />
              </span>
              <div>
                <p className="brand-name">New tab</p>
                <p className="brand-subtitle">
                  {editMode ? 'Shape your shortcuts' : 'A place for the things you return to'}
                </p>
              </div>
            </div>
            <div className="header-actions">
              {editMode && <span className="storage-note">Saved on this device</span>}
              <Button
                type="button"
                variant={editMode ? 'default' : 'outline'}
                onClick={() => setEditMode((current) => !current)}
              >
                {editMode ? <Check /> : <Pencil />}
                {editMode ? 'Done' : 'Edit layout'}
              </Button>
            </div>
          </header>

          {editMode && (
            <EditToolbar
              settings={store.state.settings}
              onSettingsChange={store.updateSettings}
              onAddBookmark={() => openNewBookmark()}
              onAddCategory={openNewCategory}
            />
          )}

          <main className="page-content">
            <BookmarkGrid
              state={store.state}
              editMode={editMode}
              onAddBookmark={openNewBookmark}
              onEditBookmark={openBookmarkEditor}
              onEditCategory={openCategoryEditor}
            />
          </main>

          <footer className="app-footer">
            <span>{store.state.categories.length} categories</span>
            <span className="footer-rule" aria-hidden="true" />
            <span>{store.state.bookmarks.length} bookmarks</span>
          </footer>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBookmark && (
            <div className="drag-preview">
              <GripVertical aria-hidden="true" />
              <span>{activeBookmark.title}</span>
            </div>
          )}
          {!activeBookmark && activeCategory && (
            <div className="drag-preview">
              <GripVertical aria-hidden="true" />
              <span>{activeCategory.name}</span>
            </div>
          )}
        </DragOverlay>

        <BookmarkEditor
          key={`bookmark-editor-${bookmarkDialogOpen}-${editingBookmarkId ?? 'new'}`}
          open={bookmarkDialogOpen}
          bookmark={editingBookmark}
          categories={store.state.categories}
          defaultCategoryId={newBookmarkCategoryId}
          onOpenChange={setBookmarkDialogOpen}
          onSave={handleBookmarkSave}
          onDelete={store.deleteBookmark}
        />
        <CategoryEditor
          key={`category-editor-${categoryDialogOpen}-${editingCategoryId ?? 'new'}`}
          open={categoryDialogOpen}
          category={editingCategory}
          categories={store.state.categories}
          bookmarkCount={editingCategory ? store.state.bookmarks.filter((bookmark) => bookmark.categoryId === editingCategory.id).length : 0}
          onOpenChange={setCategoryDialogOpen}
          onSave={handleCategorySave}
          onDelete={store.deleteCategory}
        />
      </DndContext>
    </TooltipProvider>
  )
}

export default App
