# Codebase Analyzer UI

Desktop renderer source for the Codebase Analyzer app.

## Run

```bash
cd ui_design
npm ci
npm run dev
```

To package the desktop app:

```bash
npm run dist
```

The app can analyze:
- the bundled repository snapshot from this workspace
- a local folder chosen in the app
- a folder uploaded with the fallback input

It is not a static mockup. The screens are wired to real source-file analysis and the exported report is generated from the current file set. In the packaged desktop build, local-folder analysis uses a native folder dialog bridge instead of a browser-only picker.
