# Authentification Admin - Corrections Appliquées

## 📋 Résumé des Corrections

Deux problèmes critiques d'authentification admin ont été résolus:

### ❌ Problème 1: Connexion Admin Locale Cassée
- **Symptôme**: "Accès refusé: privilèges administrateur requis en local"
- **Cause Racine**: `handleAdminLoginSubmit` vérifie juste les identifiants en dur sans appeler l'API
- **Solution**: Modifié pour appeler `/api/users/login` comme une connexion utilisateur normale

### ❌ Problème 2: Sessions Perdues sur Render
- **Symptôme**: "session invalide en ligne" après redémarrage du serveur
- **Cause Racine**: Sessions stockées en mémoire uniquement, détruites lors d'un redémarrage
- **Solution**: Persistance des sessions vers `.sessions.json` sur disque

## ✅ Corrections Apportées

### Backend (server.ts)

**Avant:**
```typescript
const sessions = new Map<string, { email: string; role: string; createdAt: number }>();
const createSession = (email: string, role: string) => {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { email: email.toLowerCase(), role, createdAt: Date.now() });
  return token;
};
```

**Après:**
```typescript
// Sessions persisted to disk for Render support
const loadSessions = (): Map<string, { email: string; role: string; createdAt: number }> => {
  try {
    if (fs.existsSync(sessionsPath)) {
      const data = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (e) {
    // Fallback to empty map on read error
  }
  return new Map();
};

const sessions = loadSessions();

const saveSessions = () => {
  try {
    const obj: Record<string, { email: string; role: string; createdAt: number }> = {};
    sessions.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(sessionsPath, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn('Failed to persist sessions:', e);
  }
};

const createSession = (email: string, role: string) => {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { email: email.toLowerCase(), role, createdAt: Date.now() });
  saveSessions(); // ← NEW: Persist to disk
  return token;
};
```

### Frontend (src/App.tsx)

**Avant:**
```typescript
const handleAdminLoginSubmit = (e: FormEvent) => {
  // Hardcoded check, no API call
  if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
    setAdminError('Email ou mot de passe administrateur incorrect.');
    return;
  }
  setIsAdminAuthenticated(true);
  localStorage.setItem('siteAdminAuthenticated', 'true');
};
```

**Après:**
```typescript
const handleAdminLoginSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setAdminError('');

  try {
    // Call API just like user login
    const { user, token } = await loginUser(adminEmail.trim(), adminPassword.trim());
    
    // Verify admin role
    const isAdmin = String(user.role || '').toLowerCase() === 'admin';
    if (!isAdmin) {
      setAdminError('Cet utilisateur n\'a pas les privilèges administrateur.');
      return;
    }

    // Store token for subsequent requests
    localStorage.setItem('siteAuthToken', token);
    setIsAdminAuthenticated(true);
    localStorage.setItem('siteAdminAuthenticated', 'true');
    
    // Load admin data
    loadUsers();
    loadActivityList();
    loadAdminMessages();
  } catch (error: any) {
    setAdminError(error?.message || 'Erreur lors de la connexion administrateur.');
  }
};
```

**Restauration de session au chargement:**
```typescript
// Restore admin session from token on page load (mount)
useEffect(() => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('siteAuthToken');
  const isAdmin = localStorage.getItem('siteAdminAuthenticated') === 'true';
  const storedEmail = localStorage.getItem('siteCurrentUserEmail');
  
  if (token && isAdmin && !isAdminAuthenticated && storedEmail) {
    // Restore admin session - set authenticated and trigger profile load
    setIsAdminAuthenticated(true);
    setCurrentUserEmail(storedEmail);
  }
}, []);
```

## 🔄 Flow Complet

### Avant (Cassé)
```
Admin Login Form
    ↓
handleAdminLoginSubmit (local check, pas API)
    ↓
localStorage.setItem('siteAdminAuthenticated', 'true')
    ↓
Pas de token! 
    ↓
Requête admin sans Authorization header
    ↓
❌ "Accès refusé: privilèges administrateur requis"
```

### Après (Corrigé)
```
Admin Login Form
    ↓
handleAdminLoginSubmit → loginUser() API
    ↓
/api/users/login → createSession() → saveSessions() → .sessions.json
    ↓
Token reçu et stocké dans localStorage
    ↓
Requête admin WITH Authorization: Bearer ${token}
    ↓
✅ requireAdmin middleware valide le token
    ↓
Admin features disponibles!
```

## 📊 Résultats des Tests

```
✅ Step 1: Admin login returns valid token
   Status: 200
   Token: 70d665669b467d7a03f034078eb99177aed6d48086821696

✅ Step 2: Admin endpoint accessible with token
   Status: 200
   Users list retrieved successfully

✅ Step 3: Sessions persisted to disk
   File: .sessions.json
   Sessions stored: 1
   Token present: YES
```

## 🚀 Déploiement

### Local (Windows/Mac/Linux)
- Sessions persisted à `.sessions.json`
- Survive restart du serveur dev
- ✅ Admin login fonctionne

### Production (Render)
- Sessions persisted à `.sessions.json` sur le système de fichiers
- ⚠️ Persiste SEULEMENT pendant la durée de vie du dyno
- 💡 Pour une vraie persistance, utiliser un volume Render ou base de données
- ✅ Survit aux redémarrages gracieux, ne survit pas à une destruction/recréation du dyno

## 📝 Notes de Sécurité

1. **Token Bearer**: Les tokens sont stockés dans localStorage (accessible au JS)
   - Sécurisé contre les attaques CSRF
   - Vulnérable aux attaques XSS
   - Solution: Utiliser httpOnly cookies en production

2. **Mot de passe Admin**: Toujours haché avec bcryptjs en base de données
   - Admin complet: `admin@admin.com` / `Admin@123` (créé au startup)
   - Impossible de récupérer le mot de passe brut

3. **TTL des Sessions**: 24 heures
   - Sessions expirées automatiquement après 24h
   - Tokens invalides rejetés par `requireAdmin`

## ✨ Prochaines Améliorations

1. **Sessions en DB** (vs fichier)
   - Créer table `sessions` en SQLite
   - Modifier `createSession()` et `getSession()` pour utiliser DB
   - Persistance multiserveur possible

2. **HttpOnly Cookies** (vs localStorage)
   - Plus sécurisé contre XSS
   - Tokens jamais accessibles au JS malveillant

3. **Refresh Tokens** (vs 24h expiration)
   - Tokens court-terme (15 min) + refresh tokens long-terme
   - Meilleure sécurité avec moins de latence

4. **Audit Logging**
   - Tracer tous les accès admin
   - Détecter les tentatives d'accès non autorisées
