<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12dgBuGtZr9LUsVFxvu8vsyjosUbVT8j4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set OpenRouter envs in [.env.local](.env.local):

   ```bash
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_OPENROUTER_IMAGE_MODEL=bytedance-seed/seedream-4.5
   VITE_OPENROUTER_TEXT_MODEL=openai/gpt-4o-mini
   # Optional:
   # VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```

   Note: this is a pure frontend app. `VITE_*` vars are exposed to browser; for production use, move API calls to backend.
3. Run the app:
   `npm run dev`
