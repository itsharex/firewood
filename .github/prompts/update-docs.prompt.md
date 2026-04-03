---
description: "Read all tool and component implementations, then update README.md and DESIGN.md to reflect the current state of the project"
agent: "agent"
tools: ["search", "edit/editFiles"]
---

# Update Project Documentation

Thoroughly read and analyze every source file in this project, then update the documentation files to accurately reflect the current implementation.

## Steps

### 1. Scan All Source Code

Read the following to understand current functionality:

- All tool modules under [src/tools/](src/tools/) — read each `index.tsx` completely
- All shared components under [src/components/](src/components/) — read each `index.tsx`
- All hooks under [src/hooks/](src/hooks/)
- Tool registry at [src/router/tools.tsx](src/router/tools.tsx)
- Rust backend at [src-tauri/src/](src-tauri/src/)
- Config at [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- [package.json](package.json) for dependencies and versions

### 2. Update README.md

Update [README.md](README.md) with:

- Accurate feature list matching current tool implementations (names, descriptions, capabilities)
- Any new tools or removed tools
- Updated app-level features (e.g., history records, persistence, updater behavior)
- Correct tech stack versions from `package.json` and `Cargo.toml`
- Keep the existing README structure and style, only update content that has changed

### 3. Update DESIGN.md

Update [DESIGN.md](DESIGN.md) with:

- Accurate project structure tree
- Updated tool module descriptions with current features
- Updated shared component descriptions
- Updated hooks list and descriptions
- Any new architectural patterns or implementation details
- Keep the existing DESIGN.md structure and style, only update content that has changed

## Rules

- Do NOT invent features — only document what is actually implemented in the code
- Do NOT remove sections from the docs unless the corresponding feature is removed from code
- Keep the documentation language consistent with the existing style (Chinese descriptions are fine if already present)
- Preserve existing formatting conventions
- If a tool gained new capabilities (e.g., history records), add those details
