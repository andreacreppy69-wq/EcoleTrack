# Dépannage: Erreur de connexion PostgreSQL sur Render

## Erreur
```
Error: connect ECONNREFUSED ::1:5432 (ou 127.0.0.1:5432)
```

Cela signifie que le service web essaie de se connecter à PostgreSQL mais n'y arrive pas.

## Causes possibles et solutions

### 1. ❌ Le Blueprint n'a pas créé le service pgsql

**Vérification**:
- Dashboard Render → Your Blueprints/Services
- Cherchez deux services:
  - `ecolestrack-db` (PostgreSQL)
  - `ecolestrack-api` (Web)

**Si seul le service Web existe**:
1. Supprimez le service Web existant
2. Allez à **New +** → **Blueprint**
3. Connectez votre dépôt Git
4. Vérifiez que Render détecte `render.yaml`
5. Cliquez **Deploy**

### 2. ⚠️ DATABASE_URL n'est pas définie

**Vérification**:
1. Dashboard Render → Service `ecolestrack-api`
2. Allez à **Environment**
3. Cherchez `DATABASE_URL`

**Si manquante ou incorrecte**:

**Option A: Via Blueprint (recommandé)**
- Redéployez le Blueprint (voir solution 1)

**Option B: Manuel**
1. Notez l'URL de la base PostgreSQL (dans le service `ecolestrack-db`)
2. Allez au service Web → Environment
3. Ajoutez/modifiez `DATABASE_URL`:
   ```
   postgresql://user:password@host:5432/database
   ```
4. Cliquez **Save**
5. Le service redémarrera automatiquement

### 3. 🔧 Services démarrent en parallèle (timing issue)

**Vérification**:
- Regardez les logs du service Web dans Dashboard

**Si le service Web démarre avant que PostgreSQL soit prêt**:
- Les changements apportés à `render.yaml` (ajout de `dependsOn`) devraient corriger cela
- Redéployez: allez à **Service** → **Manual Deploy** ou `git push`

### 4. 🌍 Problème de connectivité réseau interne

Render gère habituellement cela automatiquement, mais vérifiez:
1. Service `ecolestrack-db` est bien en **Running**
2. Service `ecolestrack-api` peut atteindre la base (retry logic gère maintenant 10 tentatives avec 2s entre chaque)

## Solution étape par étape

### A) Si c'est un nouveau Blueprint

```
1. Dashboard Render → New + → Blueprint
2. Connectez votre dépôt
3. Render détecte render.yaml
4. Branch: main
5. Cliquez Deploy
6. Attendez 2-3 minutes
7. Vérifiez les logs du Web service
```

### B) Si les services existent déjà

```
1. Supprimez les deux services (ecolestrack-db et ecolestrack-api)
2. Recommencez avec le Blueprint (voir A)
```

### C) Redéploiement manuel

Si vous préférez ne pas utiliser Blueprint:

```bash
# Mettre à jour localement et push
git add render.yaml server.ts
git commit -m "Fix PostgreSQL connection retry logic"
git push origin main

# Allez au Dashboard
# Service ecolestrack-api → Manual Deploy
# Render redémarrera le service avec le nouveau code
```

## Vérifier après correction

Une fois que le déploiement est fait, vérifiez dans les **Logs** du service Web:

```
✓ postgres connection successful
[ENV] Loaded .env
[FEDAPAY] Secret key loaded successfully
Default admin created: admin@admin.com
Backend API server is running on http://localhost:4000
[REQ] HEAD / Origin=
```

Puis testez:
```bash
curl https://your-service-xxx.onrender.com/
# Devrait afficher: "API is running"
```

## Si ça ne fonctionne toujours pas

### Demandez plus d'infos des logs

Allez à Dashboard → Service `ecolestrack-api` → **Logs**

Regardez pour:
1. **ERROR**: Quel est le message complet?
2. **WARNING**: Y a-t-il des avertissements?
3. **DATABASE_URL**: Est-elle dans les logs?

### Reset complet (dernière option)

1. Supprimez le Blueprint/Services depuis Render
2. Attendre 5 minutes
3. Créez un nouveau Blueprint

---

**Note**: Avec les changements apportés à `render.yaml` et `server.ts`, les connexions échouées sont maintenant automatiquement retentées jusqu'à 10 fois avec 2s de délai entre chaque. Cela devrait résoudre les problèmes de timing.
