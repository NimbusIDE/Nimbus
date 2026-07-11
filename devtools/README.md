# Nimbus Devtools

Shared git aliases and bash helpers for the Nimbus project. Run the setup script once after cloning and you're good to go.

## Setup

```bash
bash devtools/setup.sh
source ~/.bashrc
```

That's it. The script is safe to run multiple times — it checks for existing entries before adding anything.

## What gets installed

### Git aliases

| Alias               | Command                        | Notes                                          |
| ------------------- | ------------------------------ | ---------------------------------------------- |
| `git s`             | `git status`                   |                                                |
| `git b`             | `git branch`                   |                                                |
| `git lo`            | `git log --oneline`            |                                                |
| `git graph`         | pretty branch graph            |                                                |
| `git last`          | last commit with file stats    |                                                |
| `git cm`            | `git commit`                   |                                                |
| `git ane`           | `git commit --amend --no-edit` |                                                |
| `git amend`         | `git commit --amend`           |                                                |
| `git addp`          | `git add -p`                   | stage hunks interactively                      |
| `git unstage`       | `git restore --staged`         |                                                |
| `git sw`            | `git switch`                   | with tab completion                            |
| `git ch`            | `git checkout`                 | with tab completion                            |
| `git nwb <desc>`    | create NIM-prefixed branch     | e.g. `git nwb 42-fix-auth` → `nim-42-fix-auth` |
| `git chg <partial>` | switch by partial branch name  | e.g. `git chg 42` finds `nim-42-fix-auth`      |
| `git ps`            | `git push`                     |                                                |
| `git psf`           | `git push --force-with-lease`  |                                                |
| `git pl`            | `git pull`                     |                                                |
| `git f`             | `git fetch`                    |                                                |
| `git st`            | `git stash`                    |                                                |
| `git stp`           | `git stash pop`                |                                                |
| `git r`             | `git rebase`                   |                                                |
| `git continue`      | `git rebase --continue`        |                                                |
| `git fixup-i`       | interactive fixup with fzf     | pick a commit to fixup into                    |
| `git squash-i`      | interactive squash with fzf    | pick a commit to squash from                   |
| `git nimlog`        | NIM commits from last 2 weeks  |                                                |
| `git cleanup`       | delete merged local branches   |                                                |

### Bash functions

| Command | What it does                               |
| ------- | ------------------------------------------ |
| `gsw`   | fzf fuzzy branch switcher with log preview |

## Branch tab completion

All aliases support tab completion the same as the full `git` commands. To see your teammate's remote branches:

```bash
git f        # fetch to update remote refs
git sw <tab> # tab completes local + remote branches
gsw          # fzf picker across all branches
```

## Daily workflow

```bash
# Start a new issue (e.g. NIM-42)
git nwb 42-fix-auth-flow   # creates nim-42-fix-auth-flow

# Work on it
git s                      # check status
git addp                   # stage hunks
git cm -m "fix: auth flow NIM-42"

# Push
git ps                     # first push (auto sets upstream)
git psf                    # subsequent force-pushes if needed

# Switch between branches
git sw <tab>               # tab complete
gsw                        # fzf picker

# See recent NIM work
git nimlog

# Clean up merged branches
git cleanup
```

## Requirements

- `bash` with `bash-completion` installed
- `fzf` for `gsw`, `fixup-i`, and `squash-i`

Install fzf if missing:

```bash
# Arch / Manjaro
sudo pacman -S fzf

# Ubuntu / Debian
sudo apt install fzf

# macOS
brew install fzf
```
