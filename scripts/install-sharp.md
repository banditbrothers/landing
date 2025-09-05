# Installing Sharp for Image Compression

Sharp is having trouble with its native dependencies on your macOS ARM64 system. Here are several ways to fix it:

## Option 1: Force Install (Recommended)

```bash
npm install sharp --force
```

## Option 2: Clean Install

```bash
# Remove node_modules and reinstall everything
rm -rf node_modules
rm package-lock.json yarn.lock
npm install
npm install sharp
```

## Option 3: Platform-Specific Install

```bash
npm install --os=darwin --cpu=arm64 sharp
```

## Option 4: Use Yarn with Clean Slate

```bash
# If you have permission issues, you might need to fix permissions first
sudo chown -R $(whoami) node_modules
yarn remove sharp
yarn add sharp
```

## Option 5: Alternative - Use Docker

If nothing works, you can run the script in Docker:

```dockerfile
FROM node:18-alpine
RUN apk add --no-cache vips-dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "scripts/compress-s3-images.js"]
```

## Verify Installation

Test if Sharp is working:

```bash
node -e "const sharp = require('sharp'); console.log('Sharp version:', sharp.versions);"
```

## What's Happening

The error suggests that Sharp's native dependencies (libvips) aren't properly installed for your ARM64 Mac. This is a common issue with native Node.js modules.

Once Sharp is properly installed, the compression script will work much better and actually compress your images instead of just skipping them.
