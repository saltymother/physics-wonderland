#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Pushing Physics Wonderland to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo "🌐 Your repository is live at: https://github.com/saltymother/physics-wonderland"
  echo "📄 GitHub Pages will be live shortly at: https://saltymother.github.io/physics-wonderland/"
else
  echo ""
  echo "❌ Push failed. Please verify that:"
  echo "  1. You clicked 'Add SSH key' at https://github.com/settings/ssh/new"
  echo "  2. You clicked 'Create repository' at https://github.com/new (named 'physics-wonderland')"
fi
