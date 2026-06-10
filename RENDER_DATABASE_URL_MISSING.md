# ❌ Erreur: DATABASE_URL non injecté par Render

## Problème
L'application Render ne reçoit pas la variable `DATABASE_URL` du service PostgreSQL. 

Les logs montrent:
```
[DB] ❌ FATAL: DATABASE_URL environment variable is not set!
Error: connect ECONNREFUSED ::1:5432 (ou 127.0.0.1:5432)
```

## Cause racine
Le Blueprint Render n'a probablement **pas créé correctement le service pgsql**, ou il n'a pas lié les services.

## Solution étape par étape

### Étape 1: Vérifier les services dans Render Dashboard

1. Allez à https://dashboard.render.com
2. Regardez la liste de vos services
3. Vous devriez voir **deux services**:
   - `ecolestrack-db` (PostgreSQL, type: pgsql)
   - `ecolestrack-api` (Web, type: web)

**Si vous ne voyez qu'un service (le web):**
→ Allez à l'**Étape 2**

### Étape 2: Supprimer et redéployer le Blueprint

1. **Supprimez tous les services**:
   - Chaque service → **Settings** → **Delete Service**
   - Attendez 2-3 minutes

2. **Créez un nouveau Blueprint**:
   - Cliquez **New +** → **Blueprint**
   - Sélectionnez **Connect to Git Repository**
   - Choisissez votre repo
   - Render devrait détecter `render.yaml`
   - **Important**: Assurez-vous que `render.yaml` est à la racine du repo
   - Cliquez **Deploy**

3. **Attendez 5-10 minutes** pendant que Render crée:
   - Le service PostgreSQL
   - Le service Web
   - Les connexions entre eux

### Étape 3: Configurer les variables d'environnement

Une fois que **les deux services sont créés** (status: "Running"):

1. Allez à **Service** → `ecolestrack-api`
2. Onglet **Environment**
3. Vérifiez que ces variables existent:

**Automatiquement injectées par le Blueprint** (ne pas modifier):
- `NODE_ENV` = `production`
- `DATABASE_URL` = `postgresql://user:password@...` (injectée par le service pgsql)
- `FEDAPAY_WEBHOOK_URL` = `https://...` (auto-généré)

**À ajouter manuellement** (cliquez **+ Add** si manquantes):
- `FEDAPAY_SECRET_KEY` = `sk_sandbox_...` (votre clé secrète FedaPay)
- `FEDAPAY_API_KEY` = `pk_sandbox_...` (votre clé API FedaPay)
- `DEFAULT_ADMIN_EMAIL` = `admin@admin.com`
- `DEFAULT_ADMIN_PASSWORD` = `Your_Very_Secure_Password_123`

### Étape 4: Vérifier DATABASE_URL

**Sur la page Environment du service Web**, cherchez `DATABASE_URL`:

Elle doit ressembler à:
```
postgresql://user:password@server-name.c.render.com:5432/database_name
```

**NON** à:
```
localhost:5432
127.0.0.1:5432
::1:5432
```

Si elle est vide ou incorrecte:
- Vérifiez que le service `ecolestrack-db` existe et est "Running"
- Redéployez le Blueprint (voir Étape 2)

### Étape 5: Redémarrer le service Web

Une fois les variables configurées:
1. Service `ecolestrack-api`
2. **Manual Deploy** (en haut à droite)
3. Attendez 2-3 minutes

### Étape 6: Vérifier les logs

Allez à **Service** → **Logs** et cherchez:

**✅ Si ça marche**:
```
[DB] DATABASE_URL configured (host: server.c.render.com)
[DB] Connection attempt 1/10...
[DB] ✓ PostgreSQL connection successful
Default admin created: admin@admin.com
Backend API server is running
```

**❌ Si ça ne marche toujours pas**:
```
[DB] ❌ FATAL: DATABASE_URL environment variable is not set!
```

## Blueprint YAML vérification

Assurez-vous que `render.yaml` est à la **racine** de votre repo et contient:

```yaml
services:
  - type: pgsql
    name: ecolestrack-db
    plan: standard
    database: postgres
    user: postgres

  - type: web
    name: ecolestrack-api
    env: node
    plan: standard
    buildCommand: npm run lint
    startCommand: npm run server
    dependsOn:
      - ecolestrack-db
    
    envVars:
      - key: NODE_ENV
        value: production
      
      - key: DATABASE_URL
        fromService:
          type: pgsql
          name: ecolestrack-db
          property: connectionString
      
      - key: FEDAPAY_WEBHOOK_URL
        fromService:
          type: web
          property: url
          suffixPath: /api/fedapay/webhook
```

## Dépannage avancé

### Les deux services existent mais DATABASE_URL manque

Cela peut arriver si les services ne sont pas correctement "linkés" par le Blueprint.

**Solution manuelle**:
1. Service `ecolestrack-api` → **Environment** → **+ Add**
2. Clé: `DATABASE_URL`
3. Valeur: Allez dans le service `ecolestrack-db`, cherchez l'URL de la base dans les informations
4. Copiez-la dans ecolestrack-api
5. **Manual Deploy** du service Web

### Le service pgsql démarre trop lentement

Notre code réessaie maintenant **10 fois** avec 2 secondes d'attente. Mais si PostgreSQL prend très longtemps:

1. Service `ecolestrack-db` → **Settings** → Vérifiez le plan
2. Si "Free", upgrader à "Standard" peut aider
3. Ou augmentez les retries en modifiant `server.ts`

## Prochaines étapes

✅ Vérifiez que les deux services existent  
✅ Vérifiez que DATABASE_URL est défini  
✅ Redéployez et vérifiez les logs  

Si ça ne fonctionne toujours pas:
1. Supprimez tout et recommencez avec un nouveau Blueprint
2. Assurez-vous que `render.yaml` est en Git
3. Contactez le support Render: https://render.com/support

## Support

- Docs Render: https://render.com/docs
- Troubleshooting: https://render.com/docs/troubleshooting-deploys
- Status: https://status.render.com
