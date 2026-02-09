# Cloudinary Setup Guide

## Get Your Free 25GB Storage

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Choose the free tier (25GB storage, 25GB bandwidth/month)
3. After signup, go to your [Cloudinary Console](https://console.cloudinary.com/)
4. Copy your credentials from the dashboard

## Configure Environment Variables

Update `.env.local` with your Cloudinary credentials:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Create Upload Preset

1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set preset name: `de_artisa_uploads`
5. Set signing mode to: **Unsigned**
6. Set folder: `de_artisa_portfolio` (optional)
7. Save the preset

## Restart Development Server

After updating `.env.local`, restart your server:

```bash
npm run dev
```

Now artists can upload images directly through the "Add Work" page with Cloudinary's 25GB free storage!
