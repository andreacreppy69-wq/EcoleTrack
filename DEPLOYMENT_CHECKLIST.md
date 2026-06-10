# Checklist de Déploiement PostgreSQL sur Render

## ✅ Pré-déploiement (sur votre machine locale)

- [x] Migration de SQLite vers PostgreSQL complétée
- [x] Tests locaux réussis (`npm run server`)
- [x] Tests d'intégration PostgreSQL réussis (`node test-postgres-integration.mjs`)
- [x] Tests de paiement réussis (`node test-payments.mjs`)
- [x] `render.yaml` configuré avec PostgreSQL
- [ ] `package.json` vérifiez que les scripts sont présents:
  - `npm run server` 
  - `npm run lint`
  - `npm run prepare-db`

## 🚀 Déploiement sur Render

### Étape 1: Préparer le Git
```bash
git add render.yaml package.json server.ts
git commit -m "Deploy PostgreSQL to Render"
git push origin main
```

### Étape 2: Créer Blueprint Render

**Option A: Déploiement automatique avec render.yaml (RECOMMANDÉ)**

1. Allez à https://dashboard.render.com
2. Cliquez sur **New +** → **Blueprint**
3. Connectez votre dépôt Git
4. Sélectionnez `render.yaml` 
5. Cliquez **Deploy**

Render créera automatiquement:
- Service PostgreSQL
- Service Web API
- Connexions et variables d'environnement

**Option B: Déploiement manuel**

Consultez [RENDER_POSTGRES_GUIDE.md](RENDER_POSTGRES_GUIDE.md) section "Configuration manuelle"

### Étape 3: Configurer les Variables d'Environnement

Allez à **Dashboard** → **Service: ecolestrack-api** → **Environment**

Ajoutez les variables (celles-ci ne sont **pas** dans render.yaml):

```
FEDAPAY_SECRET_KEY=your_actual_secret_key
FEDAPAY_API_KEY=your_actual_api_key
DEFAULT_ADMIN_EMAIL=admin@admin.com
DEFAULT_ADMIN_PASSWORD=your_very_secure_password
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**Note**: `DATABASE_URL` et `FEDAPAY_WEBHOOK_URL` sont automatiquement définis par render.yaml.

### Étape 4: Attendre le déploiement

Render affichera:
```
Building...
Deployed successfully ✓
```

Vérifiez les **Logs** pour:
```
[ENV] Loaded .env
[FEDAPAY] Secret key loaded successfully
Default admin created: admin@admin.com
Backend API server is running on http://localhost:4000
```

### Étape 5: Tester l'API déployée

```bash
# Remplacez YOUR_RENDER_URL par l'URL réelle de votre service
export RENDER_URL=https://your-service-xxx.onrender.com

# Test 1: Health check
curl -s ${RENDER_URL}/ | head -20

# Test 2: Login admin
curl -s -X POST ${RENDER_URL}/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "your_very_secure_password"
  }' | jq .

# Test 3: Get users (with token from response above)
TOKEN="paste_token_here"
curl -s -X GET ${RENDER_URL}/api/users \
  -H "Authorization: Bearer ${TOKEN}" | jq .
```

## 📋 Après le déploiement

### Configurer FedaPay Webhooks

1. Allez au **Dashboard FedaPay**
2. Paramètres → Webhooks
3. Ajouter webhook:
   - **URL**: `https://your-render-url.onrender.com/api/fedapay/webhook`
   - **Événements**: Cochez `transaction.approved`, `transaction.declined`
4. Sauvegardez

### Configurer les URLs de retour Paiement

1. **Frontend** (ex: Vercel) doit rediriger vers:
   - Succès: `https://your-frontend.vercel.app/paiement/succes?transactionId=...`
   - Échec: `https://your-frontend.vercel.app/paiement/echec`

2. **Backend** doit être configuré dans FedaPay:
   - Failure URL: voir le code `server.ts` ligne ~700

### Vérifier la Persistance de la Base

```bash
# Les données doivent persister entre les redéploiements
# Test: Créez un utilisateur, redéployez, puis vérifiez qu'il existe toujours

# 1. Créez un nouvel utilisateur
curl -X POST ${RENDER_URL}/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "dob": "2000-01-01",
    "profession": "Engineer",
    "phoneNumber": "+228",
    "gender": "M",
    "photoUrl": ""
  }'

# 2. Redéployez depuis le Dashboard Render
# Dashboard → Service → Deploy

# 3. Vérifiez que l'utilisateur existe toujours
curl -X POST ${RENDER_URL}/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }' | jq .
```

## 🆘 Dépannage

| Erreur | Cause | Solution |
|--------|-------|----------|
| "relation 'users' does not exist" | Tables non créées | Vérifiez que `initDb()` s'exécute dans les logs |
| "password authentication failed" | DATABASE_URL incorrecte | Vérifiez la variable d'environnement DATABASE_URL |
| "Cannot GET /api/users" | Service ne répond pas | Vérifiez que le service est "Running" dans Render |
| Webhook ne reçoit pas d'événements | Webhook URL incorrecte | Vérifiez l'URL dans FedaPay Dashboard |
| Sessions perdues après redéploiement | Normal avec restart | Les sessions persistent 7 jours, redéploiement les force |

## ✨ Avantages du déploiement actuel

✅ **Base de données**: PostgreSQL géré par Render (backup automatique)  
✅ **Scalabilité**: Peut gérer plusieurs requêtes simultanées  
✅ **Monitoring**: Dashboard Render avec logs et metrics  
✅ **Persistance**: Les données survivent aux redéploiements  
✅ **SSL/TLS**: HTTPS automatique  
✅ **Auto-redeploy**: Depuis Git à chaque push  

## 📞 Support Render

- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: https://render.com/support
