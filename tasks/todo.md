# Location Avatar on Glob

## Plan
- [x] Create avatar generation (favicon + location badge SVG)
- [x] Extend location schema with avatarPath
- [x] Generate avatar on new location, store in public/avatars/
- [x] Display custom avatar on glob marker (fallback: favicon)

## Avatar
- Base: prdhugo.fr/favicon.svg (shoulder-to-head circular clip)
- Badge: flag emoji overlay (bottom-right)
- Storage: public/avatars/{hash}.svg
- Display: globe marker uses avatarPath or favicon fallback

---

# Rework: Dependencies + Storage Cleanup

## Plan
- [x] Upgrade dependencies (Next 15.5, React 19.2, AI SDK 4.3, remove Leaflet)
- [x] Extract storage to lib/db.ts with awaited writes
- [x] Refactor page.tsx to use storage module
- [x] Add @/lib/utils, fix InformationCard sort, Globe typing
- [x] Verify build

## Storage simplification
- Single JSON file (keep)
- Extract read/write to lib/db.ts
- All writes awaited (fix race conditions)
- Simple API: readDb(), writeDb(db)
