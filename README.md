<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/fa4f6bd3-5be5-4e38-9c78-4c13d6b214b7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` and `FEDAPAY_API_KEY` in [.env.local](.env.local) to your API keys.
   - `GEMINI_API_KEY="MY_GEMINI_API_KEY"`
   - `FEDAPAY_API_KEY="MY_FEDAPAY_API_KEY"`
3. Optionally set `VITE_FEDAPAY_PUBLIC_KEY` and `FEDAPAY_WEBHOOK_URL` in `.env.local`.
   - `VITE_FEDAPAY_PUBLIC_KEY="pk_sandbox_5bWbetzgQxOXxvjJm4rw19X5"`
   - `FEDAPAY_WEBHOOK_URL="https://ecoletrack-5481.onrender.com/api/fedapay/webhook"`
   - `FEDAPAY_FAILURE_URL="https://ecolestrack.vercel.app/paiement/echec"`
4. Run the app:
   `npm run dev`
"# EcoleTrack" 
