# Project: compnetworks-web

Web version of a university "Computer Networks" project: a GUI application for solving
the network design task. Frontend is React, backend is FastAPI.

## What it does

A user designs a computer network by specifying:

- **Nodes (УК / switching nodes)** — name + coordinates (x, y).
- **Channels (channel types)** — name, bandwidth (пропускная способность), price per meter.
- **Node types (variants of УК)** — name, speed, price.
- **Traffic** — expected traffic intensity between node pairs (symmetric matrix + unit, e.g. Мбит/с).

The scheme is sent to the backend and persisted as JSON on the server. Later the user
can list and load saved schemes.

## Frontend routes

Defined in `frontend/src/App.jsx` (React Router, `BrowserRouter`):

| Route            | Page                     | Purpose                                   |
| ---------------- | ------------------------ | ----------------------------------------- |
| `/`              | `Start.jsx`              | Home page, choose action                  |
| `/new-scheme`    | `NetworkDesignForm.jsx`  | Form to design a new network scheme      |
| `/choose-scheme` | `ChooseScheme.jsx`       | List saved schemes, load one from server  |

## Backend API

Base URL used by frontend: `http://localhost:1234/api/` (FastAPI app has `root_path='/api'`).
All responses are JSON shaped like `{ "message": "..." , ... }` — `message` is a
human-readable status ("Success", "Scheme already exists", ...).

| Method | Endpoint           | Body / Query                       | Result                                        |
| ------ | ------------------ | ---------------------------------- | --------------------------------------------- |
| POST   | `/create-scheme`   | JSON payload (see below)           | Creates `nodes.json` for the scheme; 400 if scheme already exists |
| GET    | `/get-scheme-list` | —                                  | `{ schemes: [name, ...] }` for the client host; 404 if host dir missing |
| GET    | `/get-scheme`      | `scheme_name=<name>`               | `{ scheme: <payload> }`; 404 if not found     |
| POST   | `/update-scheme`   | JSON payload (same shape as create)| Overwrites `nodes.json` of an existing scheme; 404 if scheme missing; 400 on invalid name/JSON |

There is a commented-out `POST /init-node` endpoint in `backend/app/main.py` (not active,
do not rely on it).

## Scheme storage

Filesystem-based, no database:

```
backend/app/schemes/<client-host>/<schemeName>/nodes.json
```

- `<client-host>` is the caller's IP (e.g. `127.0.0.1`), sanitized for filesystem safety.
- `<schemeName>` must match `^[\w\s-]+$` on the backend (letters, digits, spaces, `-`, `_`).
- The whole create-scheme payload is dumped verbatim into `nodes.json`.

## Scheme payload shape

Built by `buildPayload()` in `frontend/src/pages/network-design-form/api.js`:

```json
{
  "schemeName": "My scheme",
  "nodes": [{ "name": "УК1", "x": 10, "y": 20, "typeId": 1 }],
  "channelTypes": [{ "id": 1, "name": "...", "bandwidth": 100, "pricePerMeter": 5 }],
  "channels": [{ "from": 0, "to": 1, "typeId": 1 }],
  "nodeTypes": [{ "id": 1, "name": "...", "speed": 100, "price": 1000 }],
  "traffic": { "unit": "Мбит/с", "matrix": [[0]] }
}
```

Notes:
- `nodeTypes[].id` and `channelTypes[].id` are **auto-assigned** by `buildPayload`
  (sequential numbers `1..N` within each list) and never edited by the user.
- `nodes[].typeId` references `nodeTypes[].id`; the form has no per-node type UI yet,
  so every node defaults to the first node type.
- Form "channels" are saved as **channelTypes**; each `channels[i]` entry has the shape
  `{ from, to, typeId }` where `from`/`to` are 0-based indices into `nodes` and `typeId`
  references `channelTypes[].id`. The list is still empty for now — adding links is
  planned work (edit page).
- `traffic.matrix` is symmetric, ordered like `nodes`, diagonal is 0.

## Current status / TODO (from root README)

Done:
- Router models, packet size, "generate input file" (i.e. create-scheme flow), frontend–backend
  integration, frontend split into components/pages.

Planned:
- Finish/robustify the backend.
- Add a page for viewing and editing a network:
  - select a node by click,
  - change the type of the selected node,
  - add links (channels) between nodes.
