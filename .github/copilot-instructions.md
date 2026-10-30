# Workshop starter

- Keep this a frontend-only Vue 3 / TypeScript application; do not introduce a backend or require cloud services.
- Use `src/services/albumStorage.ts` for album persistence and `src/types/album.ts` for the data contract.
- Preserve existing localStorage data on load. Report read, validation, and write failures visibly instead of silently replacing data.
- Keep sample data fictional and assets local so the app runs without external services.
- Use Bun (the version pinned in `package.json`) without requiring Node.js or npm. Install dependencies with `bun install --frozen-lockfile`.
- Run `bun run test` and `bun run build` after code changes. Keep Vitest; `bun test` invokes a different test runner.
