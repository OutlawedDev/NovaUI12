#!/bin/bash

ZIP_URL="https://github.com/OutlawedDev/NovaUI/releases/download/1.0.0/NovaUI.app.zip"
TMP_ZIP="/tmp/NovaUI.app.zip"
UNZIP_DIR="/tmp/novaui_unzip"
APP_NAME="NovaUI.app"
DEST_DIR="/Applications"

echo "⬇️ Downloading app zip..."
curl -L -o "$TMP_ZIP" "$ZIP_URL"

echo "🗜 Unzipping..."
rm -rf "$UNZIP_DIR"
mkdir -p "$UNZIP_DIR"
unzip -q "$TMP_ZIP" -d "$UNZIP_DIR"

# 🧹 Delete __MACOSX if it appears
MACOSX_FOLDER="$UNZIP_DIR/__MACOSX"
if [ -d "$MACOSX_FOLDER" ]; then
  echo "🧹 Removing __MACOSX folder..."
  rm -rf "$MACOSX_FOLDER"
fi

echo "📁 Moving app to Applications..."
sudo mv -f "$UNZIP_DIR/$APP_NAME" "$DEST_DIR/$APP_NAME"

echo "🔐 Removing quarantine flag..."
sudo xattr -dr com.apple.quarantine "$DEST_DIR/$APP_NAME"

echo "🧼 Cleaning up temp files..."
rm -rf "$TMP_ZIP" "$UNZIP_DIR"

echo "✅ App is ready in Applications."
echo "🚀 Launching app..."
open "$DEST_DIR/$APP_NAME"
