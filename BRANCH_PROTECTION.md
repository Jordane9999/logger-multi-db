# 🔒 Branch Protection Setup

This document explains how to configure branch protection rules for the `main` branch to maintain code quality and prevent direct pushes.

## 📋 Prerequisites

- You must be a repository owner or admin
- Repository must be public or you must have GitHub Pro/Team/Enterprise

## 🛡️ Recommended Branch Protection Rules

Follow these steps to protect the `main` branch:

### 1. Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Click **Branches** in the left sidebar
4. Click **Add branch protection rule**

### 2. Configure Branch Name Pattern

- **Branch name pattern**: `main`

### 3. Enable Protection Rules

#### ✅ **Require a pull request before merging**

- Enable: **Require a pull request before merging**
  - ✅ **Require approvals**: Minimum 1 approval
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from Code Owners** (optional, requires CODEOWNERS file)
  - ⬜ **Restrict who can dismiss pull request reviews** (optional)
  - ⬜ **Allow specified actors to bypass required pull requests** (not recommended)

#### ✅ **Require status checks to pass before merging**

- Enable: **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - Select status checks that must pass:
    - `build (18.x)` - Node.js 18 build
    - `build (20.x)` - Node.js 20 build
    - `build (22.x)` - Node.js 22 build
    - `code-quality` - Code quality checks
    - `security` - Security audit

#### ✅ **Require conversation resolution before merging**

- Enable: **Require conversation resolution before merging**
  - All PR comments must be resolved before merge

#### ✅ **Require signed commits** (Recommended)

- Enable: **Require signed commits**
  - All commits must be GPG/SSH signed

#### ✅ **Require linear history** (Optional but recommended)

- Enable: **Require linear history**
  - Prevents merge commits, forces rebase or squash

#### ✅ **Include administrators**

- Enable: **Include administrators**
  - Admins must also follow these rules

#### ✅ **Restrict who can push to matching branches** (Optional)

- Enable: **Restrict who can push to matching branches**
  - Only allow specific people/teams to push
  - Useful for core maintainers only

#### ✅ **Allow force pushes** (Not Recommended)

- ⬜ **Do NOT enable** - Force pushes can overwrite history

#### ✅ **Allow deletions** (Not Recommended)

- ⬜ **Do NOT enable** - Prevents accidental branch deletion

### 4. Save Changes

Click **Create** or **Save changes** at the bottom of the page.

---

## 🔄 Workflow After Branch Protection

### For Contributors

1. **Fork** the repository
2. **Clone** your fork
3. Create a **new branch** from `main`

   ```bash
   git checkout -b feature/my-feature
   ```

4. Make your changes and commit
5. **Push** to your fork

   ```bash
   git push origin feature/my-feature
   ```

6. Open a **Pull Request** to `main`
7. Wait for:
   - CI checks to pass ✅
   - Code review and approval ✅
   - All conversations resolved ✅
8. Merge (squash and merge recommended)

### For Maintainers

1. **Review** pull requests
2. Ensure all checks pass
3. **Approve** if code is good
4. **Merge** the PR (squash and merge or rebase)
5. **Delete** the feature branch after merge

---

## 📝 CODEOWNERS File (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific people:

```
# Default owners for everything
* @tech_converter

# Adapters
/src/adapters/ @tech_converter

# Core logger
/src/core/ @tech_converter

# Documentation
*.md @tech_converter
```

---

## 🚫 What Branch Protection Prevents

✅ **Prevents:**

- Direct pushes to `main`
- Merging untested code
- Merging unapproved code
- Merging with failing CI
- Merging with unresolved comments
- Accidental branch deletion
- Force pushes that rewrite history

✅ **Enforces:**

- Code review process
- CI/CD pipeline
- Code quality standards
- All tests must pass
- Documentation updates

---

## 🔧 Testing Branch Protection

After enabling branch protection, test it:

### Test 1: Try Direct Push (Should Fail)

```bash
# On main branch
git checkout main
echo "test" >> README.md
git add .
git commit -m "test"
git push origin main
```

**Expected:** ❌ Push rejected with message:

```
remote: error: GH006: Protected branch update failed
```

### Test 2: Via Pull Request (Should Work)

```bash
# Create feature branch
git checkout -b test/branch-protection
echo "test" >> README.md
git add .
git commit -m "test: branch protection"
git push origin test/branch-protection

# Open PR on GitHub
# Wait for CI to pass
# Get approval
# Merge
```

**Expected:** ✅ Merge successful after all checks pass

---

## 🎓 Best Practices

1. **Always work in feature branches**

   - `feature/add-redis-adapter`
   - `fix/mongodb-connection`
   - `docs/update-readme`

2. **Keep branches up to date**

   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/my-feature
   git rebase main
   ```

3. **Write descriptive PR titles**

   - ✅ `feat(mongodb): add connection pooling`
   - ❌ `update stuff`

4. **Keep PRs focused and small**

   - One feature/fix per PR
   - Easier to review
   - Faster to merge

5. **Respond to review comments**
   - Address all feedback
   - Resolve conversations
   - Re-request review after changes

---

## ❓ FAQ

### Q: Can I bypass branch protection in an emergency?

**A:** Only repository admins can temporarily disable protection rules. But this should be extremely rare and documented.

### Q: What if CI is broken and I need to merge?

**A:** Fix the CI first! Never merge broken code. If CI itself is broken, fix it in a separate PR.

### Q: How do I get my PR approved faster?

**A:**

- Keep PRs small and focused
- Write clear descriptions
- Add tests
- Ensure CI passes
- Respond quickly to feedback

### Q: Can I merge my own PR?

**A:** Depends on your settings. Generally, you need at least 1 approval from someone else.

---

## 🔗 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Code Owners Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

**Branch protection is essential for maintaining code quality in open source projects!** 🛡️
