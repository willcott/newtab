# New Tab Project Brief

## Product Goal

Create a low-maintenance personal new-tab page that presents frequently used bookmarks as a set of user-named sections arranged in columns. The page is a static Vite bundle for local browser use as a new-tab target.

## Core Experience

The page has two modes:

- **Normal mode:** columns are ordered vertical containers that can hold sections or standalone bookmarks. Each bookmark is a compact row containing a favicon and the title chosen by the user. Clicking the row navigates to the saved URL. Sections contain bookmarks only and are not nested inside other sections. Section bookmark groups can be collapsed and expanded from their heading.
- **Edit mode:** users can add, edit, and delete bookmarks; add, rename, reorder, and delete sections; move sections between or within columns; move bookmarks between columns or in and out of sections; and change the number of columns and bookmark scale. Columns provide drop targets at both the top and bottom of their contents. Moving a section also moves the bookmarks it contains. A small edit control sits in the lower-right corner.

The first launch is seeded with three editable sections: Work contains Jira, Outlook, and Outlook Calendar; Dev contains GitHub and AWS; Personal contains Gmail. Figma is included as a standalone bookmark. There is always at least one section. Deleting a section with bookmarks requires choosing another section as the destination.

## Technical Shape

- React 19 with TypeScript and Vite.
- shadcn/ui generated primitives backed by Base UI.
- Tailwind CSS v4 for generated utility styles and CSS variables.
- dnd-kit for pointer-based column, section, and bookmark sorting.
- Geist Variable as the local UI font dependency.
The production Vite base is `./`, which keeps the generated CSS, JavaScript, and font paths relative to `dist/index.html`. The intended local artifact is `dist/index.html`.

## Data Model

The persisted document is versioned as `newtab.bookmarks.v3`:

- `version`: current storage schema version.
- `sections`: objects containing `id`, user-facing `name`, a `collapsed` state, and the ordered bookmarks contained by the section.
- `bookmarks`: objects containing `id`, an optional `sectionId`, `title`, normalized `url`, and derived `faviconUrl`.
- `layout`: ordered columns whose items are either a section or a standalone bookmark. Section bookmarks are not repeated in the column layout.
- `settings`: bounded `columns` and one of five discrete bookmark scale values: extra small, small, medium, large, or extra large. Scale changes the bookmark row, title text, and favicon sizes together.

State is loaded defensively. Malformed or incompatible storage falls back to the seeded defaults, and bookmark URLs are restricted to `http` and `https`. Updates are saved automatically after state changes. The storage module owns schema migration.

## Favicon Strategy

Favicon URLs are derived from the bookmark hostname through the Google favicon endpoint. Each bookmark also has a local generic icon fallback when its favicon cannot load.

## Visual Direction

The interface is compact and scan-oriented. Columns span the full available browser width and are vertical stacks, sections are visually contained groups with a distinct heading band and inset bookmark area, and bookmark rows have stable sizes controlled by the edit controls. Standalone bookmarks remain visually separate from section contents. The edit control is a small button in the lower-right corner. Light and dark colors follow the operating system preference through CSS media queries.

The application UI palette must contain only black, white, and neutral grayscale values. No colored accents, warm or cool tints, or chromatic theme tokens are allowed. Bookmark favicon logos are the intentional exception and retain their normal source colors.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

`npm run build` is the production validation command.
