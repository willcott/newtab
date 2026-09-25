import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BOOKMARK_SCALE_OPTIONS,
  LAYOUT_LIMITS,
  type LayoutSettings,
} from '@/types/bookmarks'

type EditToolbarProps = {
  settings: LayoutSettings
  onSettingsChange: (settings: Partial<LayoutSettings>) => void
  onAddBookmark: () => void
  onAddSection: () => void
}

export function EditToolbar({
  settings,
  onSettingsChange,
  onAddBookmark,
  onAddSection,
}: EditToolbarProps) {
  return (
    <section className="edit-toolbar" aria-label="Page settings">
      <div className="edit-toolbar-controls">
        <div className="toolbar-control">
          <Label htmlFor="column-count">Columns</Label>
          <Select
            value={String(settings.columns)}
            onValueChange={(value) => {
              if (value) {
                onSettingsChange({ columns: Number(value) })
              }
            }}
          >
            <SelectTrigger id="column-count" className="toolbar-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                {
                  length: LAYOUT_LIMITS.maxColumns - LAYOUT_LIMITS.minColumns + 1,
                },
                (_, index) => {
                  const value = index + LAYOUT_LIMITS.minColumns
                  return (
                    <SelectItem key={value} value={String(value)}>
                      {value} {value === 1 ? 'column' : 'columns'}
                    </SelectItem>
                  )
                },
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="toolbar-control toolbar-scale-control">
          <Label htmlFor="bookmark-scale">Scale</Label>
          <Select
            value={settings.bookmarkScale}
            onValueChange={(value) => {
              if (value) {
                onSettingsChange({ bookmarkScale: value as LayoutSettings['bookmarkScale'] })
              }
            }}
          >
            <SelectTrigger id="bookmark-scale" className="toolbar-select toolbar-scale-select">
              <SelectValue>
                {(value) => BOOKMARK_SCALE_OPTIONS.find((option) => option.value === value)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BOOKMARK_SCALE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="edit-toolbar-actions">
        <Button type="button" variant="outline" onClick={onAddSection}>
          <Plus />
          Section
        </Button>
        <Button type="button" onClick={onAddBookmark}>
          <Plus />
          Bookmark
        </Button>
      </div>
    </section>
  )
}
