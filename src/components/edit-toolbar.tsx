import { Columns3, LayoutPanelTop, Plus, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { LAYOUT_LIMITS, type LayoutSettings } from '@/types/bookmarks'

type EditToolbarProps = {
  settings: LayoutSettings
  onSettingsChange: (settings: Partial<LayoutSettings>) => void
  onAddBookmark: () => void
  onAddCategory: () => void
}

export function EditToolbar({
  settings,
  onSettingsChange,
  onAddBookmark,
  onAddCategory,
}: EditToolbarProps) {
  return (
    <section className="edit-toolbar" aria-label="Page settings">
      <div className="edit-toolbar-intro">
        <span className="toolbar-eyebrow">
          <LayoutPanelTop />
          Edit mode
        </span>
        <p>Arrange the page, then return to your shortcuts.</p>
      </div>
      <div className="edit-toolbar-controls">
        <div className="toolbar-control">
          <Label htmlFor="column-count">
            <Columns3 />
            Columns
          </Label>
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
        <div className="toolbar-control toolbar-height-control">
          <Label htmlFor="bookmark-height">
            <Ruler />
            Bookmark height
            <span className="control-value">{settings.bookmarkHeight}px</span>
          </Label>
          <Slider
            id="bookmark-height"
            aria-label="Bookmark height"
            min={LAYOUT_LIMITS.minBookmarkHeight}
            max={LAYOUT_LIMITS.maxBookmarkHeight}
            step={4}
            value={[settings.bookmarkHeight]}
            onValueChange={(value) => {
              const nextValue = Array.isArray(value) ? value[0] : value
              if (typeof nextValue === 'number') {
                onSettingsChange({ bookmarkHeight: nextValue })
              }
            }}
          />
        </div>
      </div>
      <div className="edit-toolbar-actions">
        <Button type="button" variant="outline" onClick={onAddCategory}>
          <Plus />
          Category
        </Button>
        <Button type="button" onClick={onAddBookmark}>
          <Plus />
          Bookmark
        </Button>
      </div>
    </section>
  )
}
