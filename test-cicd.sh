#!/bin/bash

# Test CI/CD locally for logger-multi-db
# Run this before pushing to GitHub

set -e  # Exit on error

echo "🧪 Testing CI/CD for logger-multi-db"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

run_test() {
    local test_name=$1
    local command=$2

    echo -n "Testing: $test_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "📦 1. Package Configuration Tests"
echo "-----------------------------------"

run_test "package.json exists" "test -f package.json"
run_test "package.json has name" "grep -q '\"name\"' package.json"
run_test "package.json has version" "grep -q '\"version\"' package.json"
run_test "package.json has main field" "grep -q '\"main\"' package.json"
run_test "package.json has types field" "grep -q '\"types\"' package.json"
run_test "package.json has exports" "grep -q '\"exports\"' package.json"
run_test "LICENSE file exists" "test -f LICENSE"
run_test "README.md exists" "test -f README.md"

echo ""
echo "🔨 2. Build Tests"
echo "-----------------"

run_test "TypeScript compilation" "npm run build"
run_test "Type checking" "npm run typecheck"
run_test "dist/ directory created" "test -d dist"
run_test "dist/index.js exists" "test -f dist/index.js"
run_test "dist/index.d.ts exists" "test -f dist/index.d.ts"

echo ""
echo "📋 3. Scripts Tests"
echo "-------------------"

run_test "verify script works" "npm run verify"
run_test "dry-run publish works" "npm run publish:dry"

echo ""
echo "📦 4. Package Creation Tests"
echo "-----------------------------"

# Clean old tarballs
rm -f logger-multi-db-*.tgz

echo -n "Creating tarball... "
if npm pack > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))

    # Get tarball name
    TARBALL=$(ls logger-multi-db-*.tgz)

    if [ -f "$TARBALL" ]; then
        SIZE=$(du -h "$TARBALL" | cut -f1)
        echo "  → Size: $SIZE"

        # Test tarball contents
        echo -n "Checking tarball contents... "
        if tar -tzf "$TARBALL" | grep -q "package/dist/index.js"; then
            echo -e "${GREEN}✅ PASS${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAIL${NC}"
            ((FAILED++))
        fi
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo "🔧 5. GitHub Actions Workflow Tests"
echo "------------------------------------"

run_test "CI workflow exists" "test -f .github/workflows/ci.yml"
run_test "Publish workflow exists" "test -f .github/workflows/publish.yml"

# Check workflow syntax (basic)
echo -n "Checking CI workflow syntax... "
if ! grep -q $'\t' .github/workflows/ci.yml; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL (contains tabs)${NC}"
    ((FAILED++))
fi

echo -n "Checking Publish workflow syntax... "
if ! grep -q $'\t' .github/workflows/publish.yml; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL (contains tabs)${NC}"
    ((FAILED++))
fi

echo ""
echo "📄 6. Documentation Tests"
echo "-------------------------"

run_test "CHANGELOG.md exists" "test -f CHANGELOG.md"
run_test "docs/DEPLOYMENT.md exists" "test -f docs/DEPLOYMENT.md"
run_test "docs/NEXTJS.md exists" "test -f docs/NEXTJS.md"
run_test ".github/RELEASE_CHECKLIST.md exists" "test -f .github/RELEASE_CHECKLIST.md"

echo ""
echo "===================================="
echo "📊 Test Results Summary"
echo "===================================="
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Total tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Success rate: $PERCENTAGE%"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🚀 Your package is ready for publication!"
    echo ""
    echo "Next steps:"
    echo "  1. Commit and push to GitHub"
    echo "  2. Configure NPM_TOKEN in GitHub Secrets"
    echo "  3. Run GitHub Actions workflow to publish"
    echo ""

    # Clean up tarball
    rm -f logger-multi-db-*.tgz

    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please fix the failing tests before publishing."
    echo ""

    # Clean up tarball
    rm -f logger-multi-db-*.tgz

    exit 1
fi
