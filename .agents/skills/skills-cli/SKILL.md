---
name: skills-cli
description: >-
  Discover, install, update, sync, and manage portable agent skills using the skills CLI (npx skills)
  from skills.sh or GitHub repositories for Antigravity and other AI coding agents. Use when the
  user asks to add a skill, search for skills, update skills, or manage agent skills via npx skills.
---

# Skills CLI Manager

Use this skill when installing, updating, managing, or discovering agent skills from [skills.sh](https://skills.sh/) or GitHub repositories using the `npx skills` command line tool.

Antigravity natively discovers skills placed inside `.agents/skills/<skill-name>/` in your workspace or `~/.agents/skills/<skill-name>/` globally.

---

## Quick Reference Commands

### 1. Install a Skill to the Current Project
To add a skill from a GitHub repository or skills package into the workspace:
```bash
npx skills add <owner>/<repo> --skill <skill-name> -y
```

**Examples:**
```bash
# Add NVIDIA RAG Blueprint skill
npx skills add NVIDIA/skills --skill rag-blueprint -y

# Add multiple skills from a repository
npx skills add vercel-labs/agent-skills --skill pr-review commit -y

# Add all skills from a repository
npx skills add <owner>/<repo> --all
```

### 2. Install a Skill Globally
To install a skill globally so it is available across all projects:
```bash
npx skills add <owner>/<repo> --skill <skill-name> -g -y
```

### 3. Discover & Search Skills
Search for skills interactively or by query keyword:
```bash
# Search by keyword
npx skills find <keyword>

# Search within a specific GitHub owner/organization
npx skills find <keyword> --owner <owner>
```

### 4. List Installed Skills
Inspect installed skills in the current workspace or globally:
```bash
# List skills in current project
npx skills list

# List globally installed skills
npx skills list -g

# Output machine-readable JSON
npx skills list --json
```

### 5. Update Installed Skills
Check for updates and pull the latest versions of installed skills:
```bash
# Update skills in project
npx skills update -y

# Update a specific skill
npx skills update <skill-name> -y

# Update global skills
npx skills update -g -y
```

### 6. Remove a Skill
Remove an installed skill from the project or global configuration:
```bash
# Remove from project
npx skills remove <skill-name> -y

# Remove from global
npx skills rm --global <skill-name> -y
```

---

## Best Practices for Antigravity

1. **Always use `-y` (Non-Interactive)**:
   In automated agent environments, always append `-y` (or `--yes`) to avoid interactive terminal prompt locks.

2. **Verify Antigravity Placement**:
   When installed, verify that files are copied or linked under:
   - Workspace: `.agents/skills/<skill-name>/SKILL.md`
   - Global: `~/.agents/skills/<skill-name>/SKILL.md`

3. **Check YAML Frontmatter**:
   Every skill must have a valid YAML frontmatter block starting with `---` and ending with `---`, containing at least:
   - `name`: unique lowercase hyphenated identifier
   - `description`: clear third-person explanation of what the skill does and when to activate it.

4. **Security Check**:
   The `skills` CLI automatically runs security risk assessments (Gen, Socket, Snyk). Always check the report printed during installation to verify the skill is rated Safe.
