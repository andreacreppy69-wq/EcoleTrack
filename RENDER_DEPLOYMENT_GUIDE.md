# Guide de Déploiement sur Render - Stockage Persistant des Sessions

## Problème
Après chaque déploiement sur Render, les sessions admin sont perdues et l'utilisateur doit se reconnecter.

## Cause Racine
Par défaut, les fichiers locaux (comme la base de données SQLite) sont supprimés à chaque déploiement sur Render. Cela entraîne la perte de toutes les sessions stockées dans la base de données.

## Solution 1: Utiliser render.yaml (Recommandé)

Le fichier `render.yaml` à la racine du projet configure automatiquement:
- Un disque persistant monté à `/var/data`
- Les variables d'environnement nécessaires pour le stockage

### Déploiement avec render.yaml:
1. Committez `render.yaml` à votre dépôt Git
2. Connectez votre dépôt à Render
3. Render détectera automatiquement et utilisera la configuration

**Résultat:** La base de données persiste entre les déploiements

## Solution 2: Configuration Manuelle

Si render.yaml n'est pas utilisé, configurez manuellement le service Render:

### Étape 1: Ajouter un Disque Persistant
- Dans le dashboard Render, allez à votre service web
- Cliquez sur "Disks" 
- Ajouter un nouveau disque:
  - **Name:** `db-storage`
  - **Mount Path:** `/var/data`
  - **Size:** 1 GB

### Étape 2: Configurer les Variables d'Environnement
Dans "Environment", ajoutez:
```
RENDER_DATA_DIR=/var/data
DATABASE_FILE=/var/data/database.sqlite
NODE_ENV=production
```

## Solution 3: Endpoint de Récupération de Session

Si la base de données est perdue, les administrateurs peuvent récupérer une session en fournissant leurs identifiants:

### Endpoint:
```
POST /api/session/recover
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "Admin@123"
}
```

### Réponse (succès):
```json
{
  "success": true,
  "user": { ... },
  "token": "new_token_here",
  "message": "Session récupérée avec succès après le déploiement."
}
```

## Vérification

Pour vérifier que le stockage persistant fonctionne:

1. **Connexion admin** et attendez quelques secondes
2. **Redéployez** l'application sur Render
3. **Rafraîchir** la page du navigateur
4. **Vérifier** que vous restez connecté (ou voir un message explicite de récupération)

## Logs de Débogage

Lors du démarrage du serveur, vérifiez les logs:
```
[DB] Database path configuration:
[DB] DATABASE_FILE: /var/data/database.sqlite
[DB] RENDER_DATA_DIR: /var/data
[DB] Final dbPath: /var/data/database.sqlite
[DB] Database directory exists: true
[DB] ✓ Utilisation du stockage persistant Render : /var/data/database.sqlite
```

Si vous voyez:
```
[DB] ⚠️  ATTENTION: storage est en local. Les sessions risquent d'être perdues lors d'un redeploy.
```

Cela signifie que le disque persistant n'est pas configuré correctement.

## Dépannage

### Sessions perdues après déploiement
1. Vérifiez que le disque persistant est attaché au service
2. Vérifiez que `RENDER_DATA_DIR` et `DATABASE_FILE` sont configurés
3. Vérifiez les logs du serveur

### Endpoint de récupération ne fonctionne pas
- Assurez-vous que vous utilisez les bonnes identifiants admin
- Vérifiez le rate limiting (max 5 tentatives par 15 minutes)
- Attendez un moment et réessayez

### Données manquantes après redéploiement
Si le disque persistant n'était pas configuré auparavant:
- Les données existantes pourraient être dans `/tmp/` (données éphémères)
- La création manuelle d'un disque persistant crée une nouvelle partition vide
- Les données précédentes sont perdues
