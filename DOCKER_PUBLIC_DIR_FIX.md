# Docker Public Directory Fix

## Error
```
ERROR: failed to calculate checksum of ref: "/app/public": not found
COPY --from=builder /app/public ./public
```

## Root Cause
The Dockerfile was trying to copy the `/app/public` directory from the builder stage, but this directory didn't exist in the frontend folder.

## Why This Happened
Next.js projects typically have a `public` directory for static assets (images, fonts, etc.), but this project didn't have one created yet. The Dockerfile assumed it would exist.

## The Solution
Created the `public` directory with a `.gitkeep` file to ensure it's tracked by git.

```bash
mkdir frontend/public
echo "# Public directory for Next.js static assets" > frontend/public/.gitkeep
```

## What is the Public Directory?
In Next.js, the `public` directory is used for static assets that should be served at the root level:
- Images: `/public/logo.png` → accessible at `/logo.png`
- Fonts: `/public/fonts/custom.woff2` → accessible at `/fonts/custom.woff2`
- Favicon: `/public/favicon.ico` → accessible at `/favicon.ico`
- robots.txt, sitemap.xml, etc.

## Files Created
- `frontend/public/` - Directory for static assets
- `frontend/public/.gitkeep` - Ensures directory is tracked by git

## Why .gitkeep?
Git doesn't track empty directories. The `.gitkeep` file (a convention, not a git feature) ensures the empty directory is committed to the repository.

## Alternative Solutions

### Option 1: Create public directory (chosen)
✅ Simple and follows Next.js conventions
✅ Ready for future static assets
✅ No Dockerfile changes needed

### Option 2: Make COPY optional in Dockerfile
```dockerfile
# Copy public directory if it exists
COPY --from=builder /app/public* ./public/ || true
```
❌ More complex
❌ Requires shell in alpine image
❌ Not standard Docker practice

### Option 3: Remove public COPY from Dockerfile
```dockerfile
# Remove this line:
# COPY --from=builder /app/public ./public
```
❌ Would fail if public directory is added later
❌ Not following Next.js best practices

## Impact
- ✅ Docker build will succeed
- ✅ Public directory ready for static assets
- ✅ Follows Next.js conventions
- ✅ No code changes needed

## Next Steps
1. Commit the public directory
2. Push to trigger deployment
3. Docker build will complete successfully
4. Application will deploy to ECS

## Future Usage
When you need to add static assets:
```
frontend/
  public/
    favicon.ico
    logo.png
    images/
      hero.jpg
    fonts/
      custom.woff2
```

Access in code:
```tsx
// In Next.js components
<img src="/logo.png" alt="Logo" />
<link rel="icon" href="/favicon.ico" />
```

## Verification
```bash
# Check directory exists
ls frontend/public
# Output: .gitkeep

# Check in Docker build
docker build -t test frontend/
# Should succeed without "not found" error
```

## Status
✅ Public directory created
✅ .gitkeep file added
✅ Ready for Docker build
✅ Ready for deployment
