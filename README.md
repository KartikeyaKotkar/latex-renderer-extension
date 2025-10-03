LaTeX Renderer — Build & Packaging Instructions
===============================================

What this repository contains
- Firefox add-on source for "LaTeX Renderer" (HTML/CSS/JS content and manifest).

Goal
- Produce an exact packaged add-on (.xpi) that can be installed in Firefox (temporary or permanent). The instructions below reproduce the build environment and package the extension into `web-ext-artifacts/`.

Supported OS / Environment
- Primary: Windows 10/11 (cmd.exe / PowerShell)
- Node.js (LTS) and npm
- web-ext (Mozilla's web extension build tool, installed via npm)

Required software and versions
- Node.js: 16.x or later (LTS recommended)
  - Download: https://nodejs.org/
  - Verify: `node -v` and `npm -v` in a terminal
- npm: comes with Node.js
- web-ext: install globally via npm
  - Install: `npm install --global web-ext`
  - Verify: `web-ext --version`

Build script (Windows)
- This repository includes `build.bat` which runs `web-ext build` and places the packaged XPI under `web-ext-artifacts/`.

Step-by-step build instructions
1. Open a Windows command prompt (cmd.exe) or PowerShell.
2. Change directory to the repository root (the folder that contains `manifest.json`). Example:

   cd /d D:\resume\latex-renderer-extension

3. Ensure Node.js and npm are installed and reachable from the terminal:

   node -v
   npm -v

4. Install `web-ext` globally if you haven't already:

   npm install --global web-ext

5. Run the build script (from the repository root):

   build.bat

6. After the script runs successfully you will find the packaged add-on in `web-ext-artifacts/` (e.g. `web-ext-artifacts/latex-renderer-<version>.xpi`).

Notes and troubleshooting
- If `web-ext` is not in your PATH after global install, run it with npx: `npx web-ext build`.
- The `build.bat` performs a simple `web-ext build --source-dir . --overwrite-dest --artifacts-dir web-ext-artifacts`. You can pass additional `web-ext` flags as needed.
- For development testing you can load the unpacked extension in Firefox via `about:debugging` → "This Firefox" → "Load Temporary Add-on" and select `manifest.json`.

Security / privacy
- This extension uses `browser.storage.local` to persist user settings in the browser profile. No external network calls are made by the extension code.

Contact
- If build fails or you need a different packaging flow (macOS/Linux, CI, signing), tell me which target and I can add scripts for it.
