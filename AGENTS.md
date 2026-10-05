# Repository documentation

## UI constraints

- Use Mantine components for UI controls.
- Do not add decorative styling, custom themes, branding panels, explanatory copy, or even a basic designed layout unless the user explicitly requests it.
- Render only the functional controls needed for the requested behavior and concise error messages.

## Finding context

Start with [docs/README.md](docs/README.md). Use [docs/components.md](docs/components.md) to locate components and [docs/routes.md](docs/routes.md) to locate pages/handlers. Consult [docs/design.md](docs/design.md) only when its design context is relevant to the user's task. Read the relevant documentation and specific source files instead of scanning the entire repository each time.

## Task scope and the design reference

The user's request defines the task. `docs/design.md` is a design reference, not an agent goal, task list, implementation plan, or authorization to build anything. Its descriptions and open questions do not create work for an agent.

Do not implement missing features, resolve open design questions, change routes, or bring the codebase into alignment with the design document unless the user requests that work. Differences between code and the design reference are not defects to fix automatically. Use the document to understand context for requested work, without expanding that work's scope.

## Keeping documentation current

Component, route, and service documentation describes the codebase as it exists, not a history of edits. Whenever requested work changes code, update the corresponding descriptions under `docs/` in the same task. Replace obsolete information; remove entries for deleted components/routes. Do not create a change log or append dated task summaries. Keep design context separate from implemented inventories.

- Keep `docs/README.md` as a concise index linking to each topic and explaining when to read it.
- Document every application component in `docs/components.md`: name, source location, server/client role, purpose, inputs/props, rendered behavior, and relevant dependencies or related components. Page components and layouts are included; imported third-party components need only be listed as dependencies.
- Document every implemented route in `docs/routes.md`: path, page/handler type, HTTP methods where applicable, authentication, purpose, inputs, outputs/redirects/errors, relevant configuration, and source location. Link page routes to their component descriptions.
- When server actions or services exist, give each a maintained description of its source, purpose, inputs/outputs, authorization, and data dependencies in focused documents linked from the index. They are not routes.
- Keep instructions for agents in this file. The design reference contains design context and is not an execution directive; updating code inventories does not require rewriting it to match the code. Edit it when the user requests a design-document change.
- Add focused topic documents when a feature needs more detail; use descriptive filenames and consistent headings for behavior, interfaces, data flow, and source locations. Link them from the index rather than duplicating their content.
- Update source links when files move. Keep descriptions factual and concise, with material limitations where relevant. Never include credentials, tokens, or private environment values.

The goal is a well-structured, current reference that lets another agent locate the relevant context and files directly.
