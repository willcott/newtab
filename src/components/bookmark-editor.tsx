import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { normalizeBookmarkUrl } from '@/lib/storage'
import type { Bookmark, BookmarkDraft, Category } from '@/types/bookmarks'

type BookmarkEditorProps = {
  open: boolean
  bookmark?: Bookmark
  categories: Category[]
  defaultCategoryId?: string
  onOpenChange: (open: boolean) => void
  onSave: (draft: BookmarkDraft) => void
  onDelete: (bookmarkId: string) => void
}

export function BookmarkEditor({
  open,
  bookmark,
  categories,
  defaultCategoryId,
  onOpenChange,
  onSave,
  onDelete,
}: BookmarkEditorProps) {
  const [title, setTitle] = useState(bookmark?.title ?? '')
  const [url, setUrl] = useState(bookmark?.url ?? '')
  const [categoryId, setCategoryId] = useState(
    bookmark?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '',
  )
  const [error, setError] = useState('')
  const isEditing = Boolean(bookmark)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!title.trim()) {
      setError('Give this bookmark a title.')
      return
    }
    if (!normalizeBookmarkUrl(url)) {
      setError('Enter a valid http or https address.')
      return
    }
    if (!categoryId) {
      setError('Choose a category.')
      return
    }

    onSave({ title, url, categoryId })
    onOpenChange(false)
  }

  function handleDelete(): void {
    if (bookmark) {
      onDelete(bookmark.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit bookmark' : 'Add bookmark'}</DialogTitle>
          <DialogDescription>
            Keep the label short and the address complete. The site icon is picked up automatically.
          </DialogDescription>
        </DialogHeader>
        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <Label htmlFor="bookmark-title">Title</Label>
            <Input
              id="bookmark-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Project dashboard"
              autoFocus
            />
          </div>
          <div className="form-field">
            <Label htmlFor="bookmark-url">URL</Label>
            <Input
              id="bookmark-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="form-field">
            <Label htmlFor="bookmark-category">Category</Label>
            <Select value={categoryId} onValueChange={(value) => value && setCategoryId(value)}>
              <SelectTrigger id="bookmark-category" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <DialogFooter className="editor-footer">
            {isEditing && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 />
                Delete
              </Button>
            )}
            <span className="editor-footer-spacer" />
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Add bookmark'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
