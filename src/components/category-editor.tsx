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
import type { Category } from '@/types/bookmarks'

type CategoryEditorProps = {
  open: boolean
  category?: Category
  categories: Category[]
  bookmarkCount: number
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  onDelete: (categoryId: string, destinationCategoryId?: string) => void
}

export function CategoryEditor({
  open,
  category,
  categories,
  bookmarkCount,
  onOpenChange,
  onSave,
  onDelete,
}: CategoryEditorProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [destinationCategoryId, setDestinationCategoryId] = useState(
    categories.find((item) => item.id !== category?.id)?.id ?? '',
  )
  const [error, setError] = useState('')
  const isEditing = Boolean(category)
  const otherCategories = categories.filter((item) => item.id !== category?.id)
  const canDelete = isEditing && otherCategories.length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give this category a name.')
      return
    }

    onSave(name)
    onOpenChange(false)
  }

  function handleDelete(): void {
    if (!category || !canDelete) {
      return
    }
    if (bookmarkCount > 0 && !destinationCategoryId) {
      setError('Choose where its bookmarks should move.')
      return
    }

    onDelete(category.id, destinationCategoryId || undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit category' : 'Add category'}</DialogTitle>
          <DialogDescription>
            Categories become the columns on your new-tab page.
          </DialogDescription>
        </DialogHeader>
        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <Label htmlFor="category-name">Heading</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Work, ideas, weekend"
              autoFocus
            />
          </div>
          {isEditing && bookmarkCount > 0 && (
            <div className="form-field">
              <Label htmlFor="category-destination">Move bookmarks to</Label>
              <Select
                value={destinationCategoryId}
                onValueChange={(value) => value && setDestinationCategoryId(value)}
              >
                <SelectTrigger id="category-destination" className="w-full">
                  <SelectValue placeholder="Choose a destination" />
                </SelectTrigger>
                <SelectContent>
                  {otherCategories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isEditing && otherCategories.length === 0 && (
            <p className="form-note">Keep at least one category on the page.</p>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <DialogFooter className="editor-footer">
            {canDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 />
                Delete
              </Button>
            )}
            <span className="editor-footer-spacer" />
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Add category'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
