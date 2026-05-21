# Codebase Analyzer UI

Web app source for the Codebase Analyzer.

## Run

```bash
cd ui_design
npm install
npm run dev
```

The app can analyze:
- the bundled repository snapshot from this workspace
- a local folder chosen in the browser
- a folder uploaded with the fallback input

It is not a static mockup. The screens are wired to real source-file analysis and the exported report is generated from the current file set.
