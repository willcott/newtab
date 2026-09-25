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
import type { Bookmark, BookmarkDraft, Section } from '@/types/bookmarks'

const NO_SECTION_VALUE = '__no-section__'

type BookmarkEditorProps = {
  open: boolean
  bookmark?: Bookmark
  sections: Section[]
  defaultSectionId?: string
  onOpenChange: (open: boolean) => void
  onSave: (draft: BookmarkDraft) => void
  onDelete: (bookmarkId: string) => void
}

export function BookmarkEditor({
  open,
  bookmark,
  sections,
  defaultSectionId,
  onOpenChange,
  onSave,
  onDelete,
}: BookmarkEditorProps) {
  const [title, setTitle] = useState(bookmark?.title ?? '')
  const [url, setUrl] = useState(bookmark?.url ?? '')
  const [sectionId, setSectionId] = useState<string | null>(
    bookmark?.sectionId ?? defaultSectionId ?? null,
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
    onSave({ title, url, sectionId })
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
            <Label htmlFor="bookmark-section">Section (optional)</Label>
            <Select
              value={sectionId ?? NO_SECTION_VALUE}
              onValueChange={(value) => setSectionId(value === NO_SECTION_VALUE ? null : value)}
            >
              <SelectTrigger id="bookmark-section" className="w-full">
                <SelectValue>
                  {(value) =>
                    value === NO_SECTION_VALUE
                      ? 'No section'
                      : sections.find((section) => section.id === value)?.name ?? 'No section'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SECTION_VALUE}>No section</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
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
