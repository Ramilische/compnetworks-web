# Architecture: compnetworks-web

Monorepo with two independent apps:

```
compnetworks-web/
├── frontend/          # React SPA (Vite)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
├── backend/           # FastAPI app (uv project: pyproject.toml + uv.lock)
│   ├── main.py        # compat shim → app.cli (python main.py still works)
│   ├── app/
│   │   ├── main.py    # FastAPI app + endpoints
│   │   ├── cli.py     # dev-server entry (console script `uv run app`)
│   │   └── schemes/   # JSON storage (per client host)
│   └── tests/         # pytest API tests (TestClient, storage → tmp dirs)
└── README.md          # project overview (Russian)
```

## Tech stack (confirmed in use — do not add alternatives without discussion)

**Frontend** (`frontend/package.json`):
- Vite 8, React 19, React DOM 19, React Router DOM 7
- React Compiler enabled via Babel preset (`@rolldown/plugin-babel` + `reactCompilerPreset`
  in `vite.config.js`)
- ESLint 10 flat config (`eslint.config.js`) with `eslint-plugin-react-hooks` and
  `eslint-plugin-react-refresh`
- Plain CSS files, JavaScript/JSX only (no TypeScript, no CSS framework, no state-management
  library — keep it that way unless the task requires otherwise)

**Backend** (`backend/`):
- Python 3.14 (`.python-version`), venv managed by **uv** (`.venv`)
- Packaging/deps: `backend/pyproject.toml` (hatchling build) + committed `uv.lock`;
  runtime deps: fastapi, uvicorn, gunicorn, pillow (pydantic comes with fastapi);
  dev group: pytest, httpx2 — add new ones with `uv add <pkg>` / `uv add --dev <pkg>`
- Console scripts (run inside `backend/`): `uv run app` → dev server,
  `uv run tests` → pytest (storage monkeypatched to tmp dirs in tests)
- Dev server: `uv run app` → uvicorn on `127.0.0.1:1234`, `reload=True`

## Frontend conventions (follow strictly)

### Page structure

Every page is a thin shell plus a page folder:

```
src/pages/
├── <Page>.jsx                 # layout only: composes cards, uses the page hook
├── <kebab-name>/              # matches <Page>.jsx
│   ├── api.js                 # fetch helpers (build URLs, unwrap responses, throw Error with message)
│   ├── constants.js           # URLs, factories, limits, small pure helpers
│   ├── use<Page>.js           # ALL page state + handlers as one custom hook
│   ├── validation.js          # (if needed) pure validation functions
│   └── *Card.jsx              # presentational section components
└── styles/<Page>.css          # page-scoped styles, class prefix = page initials (e.g. .ndf, .cs)
```

Examples: `NetworkDesignForm.jsx` + `network-design-form/`, `ChooseScheme.jsx` +
`choose-scheme/`.

- Pages own no logic: state lives in the page hook; components receive props
  (values, `onAdd`/`onRemove`/`onUpdate`, `errors`, `clearError`).
- In hooks, wrap stable callbacks in `useCallback`; call `setState` only after `await`
  (inside `try/catch/finally`) so it is safe to call from effects.
- Errors are user-facing strings (Russian), rendered via `<Alert>` / `<ErrorText>`.

### UI kit

Reusable primitives live in `src/components/ui/` with a barrel `index.js`:

```js
import { Actions, Alert, Button, Card, PageHeader } from '../components/ui';
```

Current kit: `Actions, Alert, Button, Card, DataTable, ErrorText, Field, Hint, JsonBlock,
PageHeader, SelectInput, Summary, TableWrap, TextInput` (+ shared `ui.css`).
Add new generic primitives there and export them from `index.js`; page-specific
components stay in the page folder.

### API layer

- Base URL single source of truth: `API_URL` in
  `src/pages/network-design-form/constants.js` (`http://localhost:1234/api/`).
  Other pages import it (see `choose-scheme/constants.js`) — never hardcode the URL elsewhere.
- `api.js` per page: one shared `unwrap(response)` helper pattern — parse JSON, throw
  `Error(data.message || <status text>)` when `response.ok` is false.
- Build request payloads in pure functions (`buildPayload`) so they are testable and
  reusable.

### Routing

Routes are declared centrally in `src/App.jsx`. New pages: create
`src/pages/<Page>.jsx` (+ page folder), then add a `<Route>` in `App.jsx`.
Navigation between pages uses `useNavigate()` from `react-router-dom`.

## Backend conventions

- FastAPI app instance in `backend/app/main.py`; `app/cli.py` runs uvicorn
  (console script `uv run app`), `backend/main.py` is a compat shim.
- Keep `root_path='/api'`; frontend calls endpoints under `/api/`.
- CORS middleware must stay enabled and allow `localhost` / `127.0.0.1` on any port
  (frontend dev server is `localhost:5173`).
- Storage is the filesystem: resolve paths relative to `Path(__file__)`, never the CWD;
  sanitize client-provided names with regex before using them in paths.
- Responses: `JSONResponse(content={'message': '...', ...}, status_code=...)`. Return a
  meaningful `message` on errors; frontend surfaces it directly to the user.
- Docstrings and inline comments in **Russian** (existing style), endpoint docstrings
  explain purpose.

## Code style

- 4-space indentation everywhere (JS and Python).
- **All code comments, docstrings, and UI text are written in Russian.**
  (These agent rule files are the exception — they are in English.)
- JSDoc-style `/** ... */` doc comments above exported/important functions in the frontend.
- Plain `function` components / arrow factory functions as already used; keep diffs minimal
  and match surrounding style.
