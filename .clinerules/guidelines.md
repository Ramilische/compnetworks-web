# Working guidelines for agents

## Development commands

Frontend (run inside `frontend/`):

```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # production build to dist/
npm run lint       # ESLint (flat config)
npm run preview    # preview the production build
```

Backend (run inside `backend/`):

```bash
python main.py     # or: uv run main.py — uvicorn on 127.0.0.1:1234 with --reload
```

The backend venv is uv-managed (`backend/.venv`, Python 3.14). To add a Python dependency:
`uv add <pkg>` (or `uv pip install <pkg>` while no pyproject exists) — remember there is
currently **no** `pyproject.toml`/`requirements.txt`; creating one when adding deps is
welcome, and tell the user about it.

## Verification checklist

After making changes:

1. Frontend: run `npm run lint` in `frontend/` and fix new errors.
2. Frontend (for non-trivial changes): run `npm run build` to catch build breaks.
3. Backend: restart the server and hit the changed endpoints
   (e.g. `curl http://localhost:1234/api/get-scheme-list`).
4. Cross-cutting (API/CORS/storage) changes: start both servers and verify the flow
   through the browser / `npm run dev` at `localhost:5173`.
5. There is no test suite yet — do not claim things are "tested"; verify by running.

## Do / Don't

- DO keep the page structure described in `architecture.md` (page shell + page folder with
  `api.js` / `constants.js` / hook / cards; CSS in `pages/styles/`).
- DO keep the API base URL in one constant (`API_URL`) and import it.
- DO write comments, docstrings and UI strings in **Russian**.
- DO keep validation both on the frontend (`validation.js`) and backend (regex/path checks).
- DON'T commit `node_modules/`, `dist/`, `backend/.venv/`, `__pycache__/` (already gitignored).
- DON'T introduce TypeScript, CSS frameworks, or state-management libraries without the
  user asking for it.
- DON'T leave the frontend and backend contracts out of sync: if you change the payload
  shape or endpoints, update both sides **and** the `project.md` rules file.
- Beware: backend stores schemes per **client host IP**; schemes created from
  `127.0.0.1` are not visible from `localhost` and vice versa (different folders).
  When debugging "missing" schemes, check which host the browser actually used.

## Self-update mandate for these rules

These rule files live in `.clinerules/`:

- `.clinerules/project.md` — what the app is, routes, API, data/storage contracts, status
- `.clinerules/architecture.md` — stack, folder structure, frontend/backend conventions
- `.clinerules/guidelines.md` — commands, workflow, this mandate

**You must update these files in the same task when you make significant changes**, e.g.:

- adding/removing routes, pages, API endpoints, or changing payload/storage contracts
- changing dependencies, build tooling, dev commands, ports, or folder layout
- introducing new conventions (styling, state, testing, etc.)
- completing or dropping TODO items listed in `project.md`

Minor changes (bug fixes, new component inside an existing page folder, copy edits) do
**not** require rule updates.

When updating, keep the files concise, edit only the affected sections, keep the language
(English) and general structure, and never let the rules describe code that no longer exists.
