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
   - `FEDAPAY_FAILURE_URL="https://invecolestrack.vercel.app/paiement/echec"`
4. Run the app:
   `npm run dev`
"# EcoleTrack" 

## Usage du script `reset-metrics`

Ce projet inclut un script Node qui appelle l'endpoint administrateur `POST /api/admin/reset-metrics` pour remettre à zéro le montant total collecté et le nombre d'investisseurs.

- Fichier: [scripts/reset-metrics.cjs](scripts/reset-metrics.cjs)
- Commande npm: `npm run reset-metrics`

Variables d'environnement prises en charge:
- `API_BASE` ou `API_URL`: URL de l'API (par défaut `http://localhost:3000`).
- `ADMIN_TOKEN`: si fourni, sera utilisé comme `Bearer` Authorization.
- `ADMIN_EMAIL` et `ADMIN_PASSWORD`: si aucun `ADMIN_TOKEN`, le script essaie de se connecter avec ces identifiants.

Exemples:

PowerShell (avec token):
```
$env:ADMIN_TOKEN="your_token"; npm run reset-metrics
```

PowerShell (avec identifiants admin):
```
$env:ADMIN_EMAIL="admin@admin.com"; $env:ADMIN_PASSWORD="Admin@123"; npm run reset-metrics
```

Bash (avec token):
```
API_BASE="https://mon-api.example.com" ADMIN_TOKEN=your_token npm run reset-metrics
```

Notes:
- Le script termine avec un code de sortie non nul en cas d'erreur (utile pour CI/CD).
- Assurez-vous que l'admin utilisé a les droits `admin` et que l'endpoint est accessible depuis l'environnement où le script est exécuté.

