# Rework: Dependencies + Storage Cleanup

## Cobe v2 Upgrade (2025-03-18)
- [x] Upgrade cobe 0.6.5 → 2.0.0
- [x] Remove deprecated `onRender` option (no longer in COBEOptions)
- [x] Build and lint verified

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
