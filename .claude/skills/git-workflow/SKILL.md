---
name: git-workflow
description: Trigger when creating commits, writing commit messages, naming branches, preparing PRs, or resolving merge conflicts. Enforces consistent Git conventions for this project so history stays readable and CI stays green.
---

# Git Workflow

## Branch Hierarchy

```
feature/* (or fix/*, chore/*, style/*)  →  main
```

| Branch       | Purpose                                      |
| ------------ | -------------------------------------------- |
| `main`       | Stable, deployable code — never commit here directly |
| `feature/*`  | New functionality                            |
| `fix/*`      | Bug fixes                                    |
| `chore/*`    | Dependencies, config, tooling, build changes |
| `style/*`    | Formatting-only, no logic change             |

---

## Branch Naming

```
feature/<scope>-<desc>        feature/units-add-dialog
feature/<scope>-<desc>        feature/materials-list-page
fix/<scope>-<desc>            fix/suppliers-select-key-remount
chore/<desc>                  chore/update-shadcn-deps
style/<desc>                  style/tailwind-class-order
```

**Rules:**

- Lowercase, hyphens only — no underscores
- Include the domain scope so the branch purpose is obvious at a glance
- Branch always cut from `main` (pull latest first)
- Max 60 characters total

### Valid scopes

`units` | `materials` | `suppliers` | `inventory` | `import-forms` | `export-forms` | `payments` | `dashboard` | `auth` | `ui` | `deps`

---

## 1. Starting a New Branch

```bash
# Always start from latest main
git checkout main
git pull origin main
git checkout -b feature/<scope>-<desc>

# Commit often using Conventional Commits
git add <files>
git commit -m "feat(units): add create unit dialog"

# Push and open PR → main
git push -u origin feature/<scope>-<desc>
# GitHub: PR feature/<scope>-<desc> → main
```

After the PR is squash-merged, delete the branch.

---

## 2. Bug Fix

```bash
git checkout main
git pull origin main
git checkout -b fix/<scope>-<desc>

git commit -m "fix(materials): explicit create-mode reset on dialog open"

git push -u origin fix/<scope>-<desc>
# GitHub: PR fix/<scope>-<desc> → main
```

---

## Commit Message Format

Follows **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body — explain the WHY, not the what]

[optional footer — e.g. BREAKING CHANGE]
```

### Types

| Type       | When                                              |
| ---------- | ------------------------------------------------- |
| `feat`     | New functionality visible to users                |
| `fix`      | Bug fix                                           |
| `perf`     | Performance improvement                           |
| `refactor` | Restructure without behavior change               |
| `style`    | Formatting, Tailwind class reorder (no logic)     |
| `chore`    | Dependencies, build config, tooling               |
| `test`     | Add or fix tests                                  |
| `docs`     | CLAUDE.md, README, inline comments only           |
| `revert`   | Revert a previous commit                          |

Breaking change — add `!` after scope:

```
feat(auth)!: replace token storage with httpOnly cookies
```

### Summary line rules

- Imperative mood: "add", "fix", "remove" — not "added", "fixes"
- Max 72 characters
- No period at end
- Lowercase after the colon

```
✅ feat(units): add create unit dialog
✅ fix(suppliers): resolve baseUnit from seed data on POST
✅ chore(deps): upgrade shadcn radix-nova to 0.4.0

❌ feat(units): Added unit dialog.   ← past tense + period
❌ fix: fixed the bug                ← no scope, vague
❌ FEAT(UNITS): ADD DIALOG           ← wrong case
```

### Body (when to add)

Add a body when the **why** is not obvious from the summary:

```
fix(materials): explicit create-mode reset on dialog open

Without this reset, reopening the dialog after editing an existing
material left stale form values because RHF does not reset on
unmount when keepValues is true. Forcing reset() in the open
useEffect eliminates the stale state regardless of open order.
```

---

## Pre-commit Checklist

Before every commit, run:

```bash
# From warehouse-ui/ — must exit 0
npx tsc --noEmit
```

No lint script is defined yet. Once added, it will be `npm run lint`.

**Never commit:**

- `.superpowers/` — local AI harness state, not project code
- `docs/*.png` — binary assets bloat the repo
- `node_modules/`
- `.env.local` — secrets
- `dist/` — build output
- `console.log` left in TS/TSX source files

---

## PR Conventions

### Title

Same format as the squash commit: `feat(materials): add material list page`

### PR body template

```markdown
## What

Brief description of the change (1–3 sentences).

## Why

Motivation — which feature phase, bug report, or design decision drives this.

## How

Key implementation decisions (especially non-obvious ones, e.g. why a
component was split, why MSW was preferred over vi.mock here).

## Test plan

- [ ] `npx tsc --noEmit` passes (from warehouse-ui/)
- [ ] `npm test -- --run` passes
- [ ] Happy path works in browser (describe steps)
- [ ] Error path works (e.g. network error shows toast)
- [ ] No regressions in related pages
```

### PR rules

- **One concern per PR** — feat + refactor = two PRs
- Keep PRs under 400 lines changed when possible
- Self-review your diff before requesting review
- Target branch is always `main`

---

## Merge Strategy

- **Squash merge** all feature/fix/chore/style branches into `main`
- Delete the branch immediately after merge
- **Never force-push** to `main`
- No release branches, no staging branch — deploy directly from `main`

---

## Conflict Resolution

```bash
# Rebase onto main before merging (preferred)
git fetch origin
git rebase origin/main

# Resolve conflicts in each file, then:
git add <resolved-files>
git rebase --continue

# If rebase is too risky (many conflicts):
git rebase --abort
# Merge instead and document the reason in the PR body
```

Never resolve conflicts by accepting all-theirs or all-ours blindly — read both sides.

---

## Rules

- Never push directly to `main`
- Never base a branch on another feature branch (unless explicitly coordinating)
- Never cherry-pick instead of proper branching
- Never use `--no-verify`

---

## Common Mistakes

| Don't                                  | Do instead                                       |
| -------------------------------------- | ------------------------------------------------ |
| `git commit -m "fix stuff"`            | Use Conventional Commits with a scope            |
| Branch feature from another feature    | Always branch from `main`                        |
| Commit directly to `main`              | Always use a branch + PR                         |
| `git push --force` on shared branches  | Use `--force-with-lease` only on your own branch |
| Commit `.superpowers/` or `docs/*.png` | Verify `.gitignore` covers them                  |
| Mix formatting + logic in one commit   | Split into separate commits                      |
| Leave `console.log` in committed code  | Remove before committing                         |
