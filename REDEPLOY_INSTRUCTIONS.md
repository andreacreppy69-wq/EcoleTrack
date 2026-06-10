# 🔧 Redéployer sur Render après correction PostgreSQL

## Changements apportés

✅ **render.yaml** simplifiée pour PostgreSQL managé  
✅ **server.ts** avec retry logic automatique (10 tentatives, 2s entre chaque)  
✅ Documentation de dépannage ajoutée  

## Redéployer maintenant

### Option 1: Si vous avez déjà un Blueprint (RECOMMANDÉ)

1. Allez à https://dashboard.render.com
2. Accédez à votre Blueprint: **Blueprints** → **Your Blueprints**
3. Cliquez sur votre blueprint
4. Cliquez **Deploy** (en haut à droite)
5. Attendez 2-3 minutes

Render va:
- Récupérer les changements depuis Git
- Recréer les services PostgreSQL + Web
- Configurer automatiquement DATABASE_URL

### Option 2: Suppression et redéploiement (si le Blueprint n'existe pas)

1. **Supprimez les services actuels**:
   - Dashboard Render
   - Service `ecolestrack-api` → Delete Service
   - Service `ecolestrack-db` → Delete Service (si elle existe)
   - Attendez 1-2 minutes

2. **Créez un nouveau Blueprint**:
   - Cliquez **New +** → **Blueprint**
   - Connectez votre dépôt GitHub
   - Branch: `main`
   - Render détectera `render.yaml`
   - Cliquez **Deploy**

## Vérifier après déploiement

### Logs dans le service Web

Allez à **Service** → **Logs** et cherchez:

```
✓ PostgreSQL connection successful
[ENV] Loaded .env
[FEDAPAY] Secret key loaded successfully
Default admin created: admin@admin.com
Backend API server is running
```

### Health check

```bash
# Remplacez YOUR_URL par votre URL Render réelle
curl https://your-service-xxx.onrender.com/
# Devrait afficher: "API is running"
```

### Login test

```bash
curl -X POST https://your-service-xxx.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"YOUR_PASSWORD"}'
```

## Variables d'environnement requises

Assurez-vous que ces variables existent dans **Environment** du service Web:

**Automatiquement configurées par render.yaml**:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...` (injecté par service pgsql)
- `FEDAPAY_WEBHOOK_URL=https://your-service-xxx.onrender.com/api/fedapay/webhook` (auto-généré)

**À configurer manuellement** (dans Dashboard → Environment):
- `FEDAPAY_SECRET_KEY=sk_sandbox_...`
- `FEDAPAY_API_KEY=pk_sandbox_...`
- `DEFAULT_ADMIN_EMAIL=admin@admin.com`
- `DEFAULT_ADMIN_PASSWORD=Your_Secure_Password_123`

## Améliorations apportées

### 1. Retry Logic pour PostgreSQL
```javascript
// Essaie de connecter 10 fois avec 2s d'attente entre chaque
await verifyDatabaseConnection();
```

Cela résout les problèmes de timing où le service Web démarre avant que PostgreSQL soit prêt.

### 2. Configuration Blueprint simplifiée
- Suppression de `ipAllowList` (non nécessaire)
- Ajout de `dependsOn: [ecolestrack-db]` (garantit l'ordre de démarrage)
- Configuration standard PostgreSQL

### 3. Logs informatifs
Les logs montrent clairement:
- État de la connexion PostgreSQL
- Succès de l'initialisation
- Prêt à accepter les requêtes

## Dépannage

Si vous voyez toujours l'erreur `ECONNREFUSED`:

1. **Vérifiez les logs** du service Web pour voir les 10 tentatives
2. **Vérifiez que DATABASE_URL** est définie dans Environment
3. **Attendez 3-5 minutes** - parfois PostgreSQL démarre lentement
4. Consultez [RENDER_POSTGRES_TROUBLESHOOT.md](RENDER_POSTGRES_TROUBLESHOOT.md)

## Points clés

✅ Les changements sont sur GitHub  
✅ Le serveur local fonctionne avec PostgreSQL  
✅ Retry logic gère les delays de démarrage  
✅ render.yaml est simplifié et optimisé  

**Prochaine étape**: Redéployez le Blueprint sur Render! 🚀
