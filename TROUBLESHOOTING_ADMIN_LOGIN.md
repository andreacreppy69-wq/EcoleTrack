# 🔧 Dépannage - Internal Server Error lors de la connexion admin

## 📋 Problème
Vous recevez une erreur "Internal Server Error" lors de la tentative de connexion au compte admin en local.

## ✅ Corrections apportées

### 1. Gestion d'erreur améliorée dans `server.ts`
- ✓ Ajout d'un **try-catch** à la route `POST /api/users/login`
- ✓ Amélioration du logging dans le middleware `requireAdmin`
- ✓ Vérification que le mot de passe existe avant `bcrypt.compareSync`

### 2. Vérification de la base de données
- ✓ Le compte admin `admin@admin.com` existe dans `database.sqlite`
- ✓ Le mot de passe est correctement hashé avec bcrypt

## 🧪 Étapes de test

### Test 1: Vérifier que le serveur démarre sans erreur
```bash
cd "d:\Projet AYISSOU\go"
npm run dev
```
**Attendez les logs du serveur**, vous devriez voir:
```
Server running on http://localhost:4000
```

### Test 2: Vérifier les comptes admin dans la base de données
```bash
cd "d:\Projet AYISSOU\go"
node test-admin-db.mjs
```
Vous devriez voir:
```
✓ Compte par défaut "admin@admin.com" existe
✓ Mot de passe: Présent
```

### Test 3: Tester la connexion API directement
```bash
cd "d:\Projet AYISSOU\go"
node test-api-login.mjs
```
Cela testera la connexion sans passer par le navigateur.

## 🔑 Identifiants admin par défaut
- **Email:** `admin@admin.com`
- **Mot de passe:** `Admin@123`

## 🐛 Déboguer dans le navigateur

1. **Ouvrir DevTools:** Appuyez sur `F12`
2. **Aller à l'onglet Network** (Réseau)
3. **Tentez la connexion admin**
4. **Cliquez sur la requête** `users/login` dans la liste
5. **Onglet Response (Réponse):** Vous verrez le message d'erreur exact

### Erreurs courantes

#### "Failed to fetch"
- Le serveur backend n'est pas lancé
- ❌ Solution: `npm run dev` dans le terminal

#### "CORS error"
- Le domaine frontend n'est pas accepté par le backend
- ✓ Solution: Le CORS est configuré pour `localhost:3000`, `localhost:5173`, etc.

#### "Session invalide ou expirée"
- Le token n'a pas été créé correctement
- ✓ Solution: Les corrections apportées corrigent ce problème

#### "Erreur d'authentification"
- Une exception non gérée dans la route de login
- ✓ Solution: Le try-catch ajouté capture maintenant ces erreurs

## 📝 Logs du serveur

Après avoir lancé `npm run dev`, vous devriez voir des logs comme:
```
[REQ] POST /api/users/login Origin=http://localhost:5173
[AUTH] Session créée pour admin@admin.com
[LOGIN] Connexion réussie
```

S'il y a une erreur, vous verrez:
```
[LOGIN] Erreur lors de la connexion: [message d'erreur détaillé]
```

## 🔄 Solution rapide complète

Si le problème persiste, faites cela:

```bash
# 1. Arrêter le serveur (Ctrl+C)
# 2. Supprimer la session pour forcer une nouvelle
cd "d:\Projet AYISSOU\go"
del database.sqlite

# 3. Redémarrer le serveur
npm run dev

# 4. Tester la connexion avec les identifiants par défaut
# Email: admin@admin.com
# Mot de passe: Admin@123
```

## ❓ Questions fréquentes

**Q: Je vois toujours "Internal Server Error"**
R: Vérifiez les logs du serveur (npm run dev). Le try-catch maintenant affichera le message d'erreur exact.

**Q: Comment créer un nouvel administrateur?**
R: Modifiez `.env`:
```
DEFAULT_ADMIN_EMAIL=votre.email@example.com
DEFAULT_ADMIN_PASSWORD=VotreMotDePasse
```
Puis relancez `npm run dev`.

**Q: Le compte admin est bloqué. Comment le débloquer?**
R: Supprimez `database.sqlite` et relancez le serveur pour recréer l'administrateur par défaut.

## 📞 Support
Si le problème persiste après ces étapes, vérifiez:
- Les logs complets du serveur (npm run dev)
- La console du navigateur (F12 → Console)
- L'onglet Network pour voir la réponse exacte
