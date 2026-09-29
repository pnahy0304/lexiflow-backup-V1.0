# Playwright Skill

> [!NOTE] This skill runs Playwright with a Termux-friendly launcher patch.

Use Git subtree to add this skill into the correct Codex path.
By default it runs headless; specify other modes in your prompt.

## Setup
Termux:

```bash
pkg install x11-repo
pkg install chromium
npm install
```

Other platforms:

```bash
npm run setup
```

## Add
From the target repo root:

```bash
git subtree add --prefix=.codex/skills/playwright-skill https://github.com/appautomaton/playwright-skill.git main --squash
```

## Update
```bash
git subtree pull --prefix=.codex/skills/playwright-skill https://github.com/appautomaton/playwright-skill.git main --squash
```

## Clone a repo that already has the subtree
Nothing special is required. A normal `git clone` includes the subtree content.
