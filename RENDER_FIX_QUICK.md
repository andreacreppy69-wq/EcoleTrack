# 🚨 ERREUR RENDER: DATABASE_URL manquant - SOLUTION

## Le problème

Le service Web Render ne reçoit pas la variable `DATABASE_URL` du service PostgreSQL.

**Erreur affichée:**
```
[DB] ❌ FATAL: DATABASE_URL environment variable is not set!
Error: connect ECONNREFUSED ::1:5432 or 127.0.0.1:5432
```

## Pourquoi ça arrive

Le Blueprint `render.yaml` **n'a probablement pas créé le service PostgreSQL**, ou les deux services existent mais ne sont pas liés.

Render devrait avoir:
- ✅ Créé un service `ecolestrack-db` (PostgreSQL)
- ✅ Créé un service `ecolestrack-api` (Web)
- ✅ Injecté automatiquement `DATABASE_URL` dans le service Web

Si vous voyez seulement le service Web → Le Blueprint a échoué.

## ✅ Solution (5-10 minutes)

### 1️⃣ Vérifier dans Render Dashboard

Allez à https://dashboard.render.com

**Cherchez ces deux services:**
- `ecolestrack-db` (type: PostgreSQL, status: Running ou Creating)
- `ecolestrack-api` (type: Web Service, status: Running ou Deploying)

**Si vous voyez seulement `ecolestrack-api`:**
→ Continuez à l'étape 2

### 2️⃣ Supprimer tout et recommencer

1. **Supprimez le service Web:**
   - Dashboard → Service `ecolestrack-api` 
   - Settings (en bas) → **Delete Service**
   - Confirmez

2. **Attendez 1 minute**

3. **Créez un nouveau Blueprint:**
   - Cliquez **New +** en haut
   - Choisissez **Blueprint**
   - Connectez votre dépôt GitHub
   - Branche: `main`
   - **Très important**: Vérifiez que Render détecte `render.yaml`
   - Cliquez **Deploy**

4. **Attendez 5-10 minutes** pendant le déploiement

### 3️⃣ Vérifier que DATABASE_URL existe

Une fois que les services disent "Running":

1. Allez au service `ecolestrack-api`
2. Onglet **Environment**
3. Cherchez `DATABASE_URL`

**Vous devriez voir:**
```
postgresql://username:password@hostname.c.render.com:5432/database
```

**NON pas:**
```
localhost:5432
127.0.0.1:5432
::1:5432
```

Si `DATABASE_URL` est vide ou incorrecte:
- Rendéployez le Blueprint (étape 2)
- Ou configurez-la manuellement (voir section avancée)

### 4️⃣ Ajouter les secrets Render

Dans le service `ecolestrack-api`, onglet **Environment**, ajouter:

| Clé | Valeur | Type |
|-----|--------|------|
| `FEDAPAY_SECRET_KEY` | `sk_sandbox_...` | Secret (depuis FedaPay) |
| `FEDAPAY_API_KEY` | `pk_sandbox_...` | Secret (depuis FedaPay) |
| `DEFAULT_ADMIN_PASSWORD` | `YourSecurePassword123` | Secret |

**Comment ajouter:**
- Cliquez **+ Add**
- Entrez la clé
- Entrez la valeur
- Cliquez **Save**

### 5️⃣ Redémarrer et tester

1. Service `ecolestrack-api` → **Manual Deploy** (en haut à droite)
2. Attendez 2-3 minutes
3. Allez à **Logs** et cherchez:

**✅ Si ça marche:**
```
[DB] DATABASE_URL configured (host: server.c.render.com)
[DB] ✓ PostgreSQL connection successful
Default admin created: admin@admin.com
Backend API server is running
```

**Puis testez:**
```bash
# Remplacez YOUR_URL par votre URL Render
curl https://your-service-xxx.onrender.com/
# Devrait afficher: "API is running"

# Test login
curl -X POST https://your-service-xxx.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"YOUR_ADMIN_PASSWORD"}'
```

## 🔧 Configuration avancée (si manual deploy)

Si vous préférez configurer manuellement sans Blueprint:

### Créer PostgreSQL manuellement

1. Dashboard → **New +** → **PostgreSQL**
2. Choisir un nom et une région
3. Cliquer **Create Database**
4. Noter l'**External Database URL**

### Créer le service Web

1. Dashboard → **New +** → **Web Service**
2. Repository: `EcoleTrack`
3. Branch: `main`
4. Build command: `npm run lint`
5. Start command: `npm run server`
6. Plan: Standard

### Ajouter DATABASE_URL manuellement

1. Service Web → **Environment**
2. **+ Add**:
   - Clé: `DATABASE_URL`
   - Valeur: (la URL de PostgreSQL de l'étape 1)
3. **Save**
4. **Manual Deploy**

## 📊 Render.yaml - Vérification

Assurez-vous que `render.yaml` est **à la racine** de votre repo avec ce contenu:

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

## 🆘 Ça ne fonctionne toujours pas?

1. **Vérifiez les logs** du service Web pour la message d'erreur exact
2. **Attendez 10 minutes** - Sometimes Render is slow
3. **Supprimez et recommencez** - Delete both services and create new Blueprint
4. **Contact Render Support**: https://render.com/support

## ✨ À savoir

- ✅ Les deux services doivent être "Running"
- ✅ `DATABASE_URL` doit être injecté automatiquement par le Blueprint
- ✅ Si vous voyez `::1:5432` ou `127.0.0.1:5432`, DATABASE_URL n'est pas définie
- ✅ Render redémarre l'application quand vous changez Environment
- ✅ Les données PostgreSQL persistent entre les redéploiements

## 📚 Docs utiles

- **RENDER_DATABASE_URL_MISSING.md** - Guide détaillé de dépannage
- **DEPLOYMENT_CHECKLIST.md** - Checklist complète
- **Render Docs**: https://render.com/docs
