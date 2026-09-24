---
name: product-brief
description: "Update the workspace product brief in brief.md when the Copilot user provides a product specification, feature request, requirement change, or product decision. Use before implementing product work so the brief remains the source of truth."
user-invocable: false
---

# Product Brief Maintenance

Keep `brief.md` aligned with product direction whenever the user gives a product specification or changes an existing requirement.

## When to Use

- The user provides a new product specification or feature requirement.
- The user changes the goal, workflow, data model, constraints, visual direction, technical shape, non-goals, or future plans.
- A requested implementation would make the current brief inaccurate.

## Procedure

1. Read `brief.md` before making product or implementation changes.
2. Extract only the requirements and decisions stated or clearly implied by the user's request. Do not invent acceptance criteria, scope, or technical choices.
3. Update the existing section that owns each requirement. Prefer concise edits to the current prose over appending a duplicate note.
4. Add a new section only when the requirement has no appropriate home. Keep the document's heading style and level consistent.
5. Remove or revise obsolete statements when the new specification supersedes them. Reconcile related sections, especially `Non-Goals` and `Future Considerations`.
6. Preserve accurate existing requirements and the brief's current terminology. Keep implementation details out unless the user specified them or they are necessary to describe the product contract.
7. If the request is ambiguous or conflicts with an existing requirement, update only the unambiguous portion and call out the unresolved decision for the user before coding.
8. After editing, reread the affected portion and check that the brief is internally consistent and still describes the requested product.

## Editing Rules

- Treat `brief.md` as the product source of truth, not as a running changelog.
- Keep changes focused on the user's specification; do not rewrite unrelated sections.
- Use the existing Markdown style and ASCII text unless the brief already requires another character set.
- Do not add dates, authorship, speculative rationale, or unrequested roadmap items.
- Update the brief before implementation when the specification changes product behavior or scope.
