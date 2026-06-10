# Guide de Déploiement PostgreSQL sur Render

## Configuration Automatique avec render.yaml

Le fichier `render.yaml` configure automatiquement :
- Un service PostgreSQL gérée par Render
- Un service web Node.js connecté à la base de données
- Les variables d'environnement nécessaires

## Déploiement Étape par Étape

### 1. Préparer le dépôt Git
```bash
git add render.yaml server.ts package.json
git commit -m "Migrate to PostgreSQL on Render"
git push
```

### 2. Configurer sur Render Dashboard

#### Option A: Déploiement automatique (recommandé)
1. Connectez votre dépôt GitHub/GitLab à Render
2. Render détectera automatiquement `render.yaml`
3. Créez un nouveau **Blueprint** service:
   - **Name**: ecolestrack-blueprint
   - **Branch**: main (ou votre branche)
   - **Render will automatically**:
     - Créer le service PostgreSQL
     - Créer le service Web API
     - Configurer les connexions et variables d'environnement

#### Option B: Configuration manuelle (si render.yaml ne fonctionne pas)

**Étape 1: Créer la base PostgreSQL**
1. Dashboard Render → New → PostgreSQL
   - **Name**: ecolestrack-db
   - **Database**: postgres
   - **User**: (auto-generated)
   - **Region**: (choisissez proche de vous)
   - **Plan**: Standard

2. Une fois créée, notez la **External Database URL** (format: `postgresql://user:password@host:5432/database`)

**Étape 2: Créer le service Web**
1. Dashboard Render → New → Web Service
   - **Repository**: (votre repo)
   - **Branch**: main
   - **Name**: ecolestrack-api
   - **Environment**: Node
   - **Build Command**: `npm run build:ts`
   - **Start Command**: `npm run server`
   - **Plan**: Standard

**Étape 3: Configurer les variables d'environnement**
1. Dans le service Web, allez à **Environment**
2. Ajoutez:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/database
   FEDAPAY_SECRET_KEY=your_secret_key_here
   FEDAPAY_API_KEY=your_api_key_here
   DEFAULT_ADMIN_EMAIL=admin@admin.com
   DEFAULT_ADMIN_PASSWORD=your_secure_password
   ```

### 3. Vérifier le déploiement

#### Vérifier les logs
```bash
# Dans Render Dashboard → Service → Logs
# Cherchez:
[ENV] Loaded .env
[FEDAPAY] Secret key loaded successfully
Default admin created: admin@admin.com
Backend API server is running on http://localhost:4000
```

#### Tester l'API
```bash
curl -X GET https://your-service-url.onrender.com/
# Devrait retourner: "API is running"
```

#### Tester la connexion admin
```bash
curl -X POST https://your-service-url.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"your_secure_password"}'
```

### 4. Configurer les webhooks FedaPay

1. **Obtenir l'URL webhook** depuis Render:
   - Dashboard → Service → Copy URL
   - Exemple: `https://ecolestrack-api-xxx.onrender.com`

2. **Configurer dans FedaPay Dashboard**:
   - Webhook URL: `https://your-service-url.onrender.com/api/fedapay/webhook`
   - Événements: `transaction.*`

3. **Configurer les URLs de retour**:
   - Success: `https://your-frontend-url.vercel.app/paiement/succes`
   - Failure: `https://your-frontend-url.vercel.app/paiement/echec`

### 5. Dépannage

#### Erreur: "relation 'users' does not exist"
- **Cause**: Les tables ne sont pas créées
- **Solution**: Le serveur crée les tables automatiquement au démarrage
- Vérifiez les logs pour voir si `initDb()` s'exécute

#### Erreur: "password authentication failed"
- **Cause**: DATABASE_URL incorrecte ou authentification échouée
- **Solution**: Vérifiez que DATABASE_URL correspond à la PostgreSQL de Render

#### Erreur: "Cannot GET /api/users"
- **Cause**: Endpoints introuvables
- **Solution**: Vérifiez que le build s'est déroulé correctement avec `npm run build:ts`

#### Les sessions sont perdues après redéploiement
- **Note**: C'est normal avec PostgreSQL
- PostgreSQL persiste les données, mais Render redémarre le service
- Les sessions avec TTL expireront après 7 jours d'inactivité

### 6. Avantages du déploiement PostgreSQL

✅ **Scalabilité**: PostgreSQL gère automatiquement les connexions multiples  
✅ **Fiabilité**: Backup automatique par Render  
✅ **Performance**: Base optimisée pour les requêtes complexes  
✅ **Persistance**: Les données survivent aux redéploiements  
✅ **Production-ready**: Configuration standard de l'industrie  

## Support

Pour des problèmes:
1. Vérifiez les **Logs** dans Render Dashboard
2. Testez l'endpoint `/` pour vérifier que le serveur répond
3. Vérifiez que `DATABASE_URL` est correctement configurée
4. Consultez les docs Render: https://render.com/docs
