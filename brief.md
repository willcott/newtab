# New Tab Project Brief

## Product Goal

Create a low-maintenance personal new-tab page that presents frequently used bookmarks as a set of user-named columns. The page is built as a static Vite bundle so it can be opened locally and used as a browser new-tab target without a server or account.

## Core Experience

The page has two modes:

- **Normal mode:** categories are displayed as columns. Each bookmark is a compact row containing a favicon and the title chosen by the user. Clicking the row navigates to the saved URL.
- **Edit mode:** users can add, edit, and delete bookmarks; add, rename, reorder, and delete categories; move bookmarks within a category or between categories; and change the number of columns and bookmark height.

The first launch is seeded with editable examples so the layout is immediately understandable. There is always at least one category. Deleting a category with bookmarks requires choosing another category as the destination.

## Technical Shape

- React 19 with TypeScript and Vite.
- shadcn/ui generated primitives backed by Base UI.
- Tailwind CSS v4 for generated utility styles and CSS variables.
- dnd-kit for pointer-based category and bookmark sorting.
- Geist Variable as the local UI font dependency.
- No backend, login, browser-extension API, or remote application state.

The production Vite base is `./`, which keeps the generated CSS, JavaScript, and font paths relative to `dist/index.html`. The intended local artifact is `dist/index.html`.

## Data Model

The persisted document is versioned as `newtab.bookmarks.v1`:

- `version`: current storage schema version.
- `categories`: ordered objects containing `id` and user-facing `name`.
- `bookmarks`: objects containing `id`, `categoryId`, `title`, normalized `url`, and derived `faviconUrl`.
- `settings`: bounded `columns` and `bookmarkHeight` values.

State is loaded defensively. Malformed or incompatible storage falls back to the seeded defaults, and bookmark URLs are restricted to `http` and `https`. Updates are saved automatically after state changes. The storage module is the migration boundary for future schema versions.

## Favicon Strategy

Favicon URLs are derived from the bookmark hostname through the Google favicon endpoint. This avoids an image upload flow and keeps the stored document small. The browser can load those icons only when network access is available; every bookmark also has a local generic icon fallback for failures or offline use.

## Visual Direction

The interface is intentionally compact and scan-oriented rather than dashboard-like. Categories are unframed grid columns with a small heading rule; bookmark rows have stable heights controlled by the edit toolbar. Light and dark colors follow the operating system preference through CSS media queries. There is no separate theme setting in the first version.

The application UI palette must contain only black, white, and neutral grayscale values. No colored accents, warm or cool tints, or chromatic theme tokens are allowed. Bookmark favicon logos are the intentional exception and retain their normal source colors.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

The project does not require or document a separate `npm run type-check` command. `npm run build` is the production validation command.

## Non-Goals

The first version deliberately excludes accounts, sync, search, import/export, custom image uploads, analytics, server persistence, and browser-extension packaging. A browser may require an extension to fully override its built-in new-tab page; this project currently supplies the standalone static HTML artifact only.

## Future Considerations

1. Add JSON import/export if the bookmark set needs to move between machines.
2. Add optional local favicon storage if remote favicon services become unreliable.
3. Package the same UI as a browser extension if direct new-tab replacement is required.
4. Add schema migrations only when persisted data changes shape; keep them inside `src/lib/storage.ts`.
