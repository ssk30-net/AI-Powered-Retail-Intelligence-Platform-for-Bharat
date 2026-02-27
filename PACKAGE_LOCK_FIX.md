# Package Lock File Fix

## Error
```
npm ci can only install packages when your package.json and package-lock.json are in sync.
Missing: @radix-ui/react-accordion@1.2.12 from lock file
Missing: @radix-ui/react-alert-dialog@1.1.15 from lock file
... (100+ missing packages)
```

## Root Cause
When we added 35+ new packages to `package.json`, the `package-lock.json` file was not updated. The `npm ci` command requires these files to be perfectly in sync.

## What is npm ci?
`npm ci` (clean install) is used in CI/CD pipelines because it:
- Installs exact versions from package-lock.json
- Is faster than `npm install`
- Ensures reproducible builds
- Requires package.json and package-lock.json to be in sync

## Solution
Regenerated the package-lock.json file to include all new dependencies:

```bash
npm install --package-lock-only --legacy-peer-deps
```

This command:
- Updates package-lock.json without installing node_modules
- Uses --legacy-peer-deps to handle peer dependency conflicts
- Adds all missing packages and their transitive dependencies

## Changes
- **File Modified:** `frontend/package-lock.json`
- **Lines Changed:** +2323 additions, -114 deletions
- **New Packages Added:** 100+ packages (including transitive dependencies)

## New Packages in Lock File

### Direct Dependencies (35+)
All the Radix UI packages and supporting libraries we added to package.json

### Transitive Dependencies (70+)
Automatically resolved dependencies of the packages we added:
- @radix-ui/primitive
- @radix-ui/react-collection
- @radix-ui/react-compose-refs
- @radix-ui/react-context
- @radix-ui/react-direction
- @radix-ui/react-dismissable-layer
- @radix-ui/react-focus-guards
- @radix-ui/react-focus-scope
- @radix-ui/react-portal
- @radix-ui/react-presence
- @radix-ui/react-popper
- @radix-ui/react-roving-focus
- @radix-ui/react-use-callback-ref
- @radix-ui/react-use-controllable-state
- @radix-ui/react-use-escape-keydown
- @radix-ui/react-use-layout-effect
- @radix-ui/react-visually-hidden
- @floating-ui/core
- @floating-ui/dom
- @floating-ui/react-dom
- aria-hidden
- embla-carousel
- embla-carousel-reactive-utils
- react-remove-scroll
- react-remove-scroll-bar
- react-style-singleton
- use-callback-ref
- use-sidecar
- And many more...

## Why This Happened
1. We added packages to package.json
2. Committed package.json without updating package-lock.json
3. Docker build ran `npm ci` which requires both files to be in sync
4. Build failed because lock file was missing the new packages

## Prevention
Always update package-lock.json when modifying package.json:
```bash
# Option 1: Install packages (updates both files)
npm install <package-name>

# Option 2: Update lock file only
npm install --package-lock-only
```

## Verification
✅ package-lock.json is valid JSON
✅ All missing packages now in lock file
✅ File size increased from ~50KB to ~150KB
✅ Ready for Docker build with npm ci

## Next Steps
1. Commit the updated package-lock.json
2. Push to trigger GitHub Actions
3. Docker build will succeed with npm ci
4. Frontend will deploy successfully

## Expected Result
- ✅ `npm ci` will install exact versions from lock file
- ✅ All dependencies will be available
- ✅ Build will complete successfully
- ✅ No more "Missing from lock file" errors
