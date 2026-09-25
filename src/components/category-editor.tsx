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
import type { Section } from '@/types/bookmarks'

type SectionEditorProps = {
  open: boolean
  section?: Section
  sections: Section[]
  bookmarkCount: number
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  onDelete: (sectionId: string, destinationSectionId?: string) => void
}

export function SectionEditor({
  open,
  section,
  sections,
  bookmarkCount,
  onOpenChange,
  onSave,
  onDelete,
}: SectionEditorProps) {
  const [name, setName] = useState(section?.name ?? '')
  const [destinationSectionId, setDestinationSectionId] = useState(
    sections.find((item) => item.id !== section?.id)?.id ?? '',
  )
  const [error, setError] = useState('')
  const isEditing = Boolean(section)
  const destinationOptions = sections.filter((item) => item.id !== section?.id)
  const canDelete = isEditing && destinationOptions.length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give this section a name.')
      return
    }

    onSave(name)
    onOpenChange(false)
  }

  function handleDelete(): void {
    if (!section || !canDelete) {
      return
    }
    if (bookmarkCount > 0 && !destinationSectionId) {
      setError('Choose where its contents should move.')
      return
    }

    onDelete(section.id, destinationSectionId || undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit section' : 'Add section'}</DialogTitle>
          <DialogDescription>
            Sections group bookmarks while columns arrange sections and standalone bookmarks.
          </DialogDescription>
        </DialogHeader>
        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <Label htmlFor="section-name">Heading</Label>
            <Input
              id="section-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Work, ideas, weekend"
              autoFocus
            />
          </div>
          {isEditing && bookmarkCount > 0 && (
            <div className="form-field">
              <Label htmlFor="section-destination">Move contents to</Label>
              <Select
                value={destinationSectionId}
                onValueChange={(value) => value && setDestinationSectionId(value)}
              >
                <SelectTrigger id="section-destination" className="w-full">
                  <SelectValue>
                    {(value) =>
                      sections.find((item) => item.id === value)?.name ?? 'Choose a destination'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {destinationOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isEditing && destinationOptions.length === 0 && (
            <p className="form-note">Keep at least one section on the page.</p>
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
            <Button type="submit">{isEditing ? 'Save changes' : 'Add section'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
