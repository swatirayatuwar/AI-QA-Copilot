---
name: Vite standalone build defaults
description: Workspace builds invoke artifact Vite configs without workflow environment variables.
---

Vite configs for artifacts should preserve workflow-provided PORT and BASE_PATH values while supplying safe defaults for standalone production builds.

**Why:** The root workspace build runs artifact build scripts without the workflow environment, so requiring PORT or BASE_PATH unconditionally makes an otherwise healthy project fail before bundling.

**How to apply:** Use workflow values when present and artifact-specific defaults when absent; keep development workflow configuration authoritative.