# Video File Hosting Instructions

## Issue
The `shift.mp4` video file is **113MB**, which exceeds GitHub's 100MB file size limit.

## Current Status
- Video is stored locally in `public/shift.mp4`
- Video is excluded from git via `.gitignore`
- Landing page references `/shift.mp4` but won't work in production

## Solutions

### Option 1: Host on Vercel (Recommended for MVP)
Vercel allows up to 100MB per file in the public directory. Since your video is 113MB, you'll need to compress it first:

```bash
# Install ffmpeg if not already installed
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Compress video to under 100MB
ffmpeg -i public/shift.mp4 -vcodec h264 -crf 28 public/shift_compressed.mp4
```

Then update Landing.jsx to use `shift_compressed.mp4`

### Option 2: YouTube/Vimeo Embed (Best for Production)
1. Upload `shift.mp4` to YouTube or Vimeo
2. Update Landing.jsx to use iframe embed instead of `<video>` tag

Example:
```jsx
<iframe
  className="w-full aspect-video"
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### Option 3: Cloud Storage CDN (Best for Large Files)
1. Upload to AWS S3, Cloudinary, or similar
2. Get public URL
3. Update Landing.jsx:

```jsx
<source src="https://your-cdn-url.com/shift.mp4" type="video/mp4" />
```

### Option 4: Git LFS (If you want to keep in repo)
```bash
# Install Git LFS
git lfs install

# Track video files
git lfs track "*.mp4"

# Add and commit
git add .gitattributes
git add public/shift.mp4
git commit -m "Add video via Git LFS"
```

## Current Workaround

The video will work locally during development. For production deployment:
1. Manually upload `shift.mp4` to your hosting
2. Or use one of the solutions above

## Recommended Next Steps

1. **Short term**: Compress the video to under 100MB
2. **Long term**: Move to YouTube embed for better streaming and CDN
