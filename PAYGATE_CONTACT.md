Sujet: Activation du compte PayGateGlobal et vérification de la clé API

Bonjour l’équipe PayGateGlobal,

Nous souhaitons activer notre compte/compte marchand afin de pouvoir recevoir des paiements via votre API.

Détails du compte :
- Nom du projet / entreprise : Ecole Track
- Email de contact : gouverneur13.13@gmail.com
- Téléphone de contact : +228 91551295
- Environnement : test

Clé API à vérifier (envoyer uniquement dans votre canal privé sécurisé) : 03a67441-feea-4ac6-9c72-e9d2079bd187

Endpoints utilisés :
- Endpoint appelé par notre backend : https://paygateglobal.com/api/v1/pay
- Callback configuré : https://ecoletrack-5481.onrender.com/api/paygate/callback
- URL de retour client : https://ecolestrack.vercel.app/paiement/succes

Exemple de requête que nous envoyons (body JSON) :
{
  "auth_token": "03a67441-feea-4ac6-9c72-e9d2079bd187",
  "phone_number": "+22891551295",
  "amount": 100,
  "description": "Test paiement",
  "identifier": "TEST-12345",
  "network": "TMONEY"
}

Réponse observée depuis votre API (extrait) :
{
  "error_code": 403,
  "error_message": "Votre compte est inactif."
}

Logs backend (payload envoyé par notre serveur)
---
PayGate request:
{
  "url": "https://paygateglobal.com/api/v1/pay",
  "body": {
    "auth_token": "[REDACTED_IN_LOGS]",
    "phone_number": "+22891551295",
    "amount": 100,
    "description": "Test paiement",
    "identifier": "TEST-1780925347533",
    "network": "TMONEY"
  }
}
---

Contexte et demande :
- Nous recevons le message "Votre compte est inactif." (code 403) lors de l'appel de test. La clé semble bien fournie mais le compte PayGate associé est inactif.
- Pouvez‑vous :
  1) Activer ce compte / clé pour l’environnement de test (ou indiquer la procédure exacte pour l’activer) ;
  2) Indiquer si des documents KYC ou étapes supplémentaires sont nécessaires ;
  3) Confirmer si nous devons ajouter une allowlist d’IP, configurer des webhooks ou autres éléments pour que les callbacks fonctionnent correctement.

Merci d’avance pour votre aide,
Prénom Nom
Ecole Track
contact: gouverneur13.13@gmail.com
+tél: +228 91551295

---
Notes techniques (pour votre équipe)
- Backend: `server.ts` (Express) appelle `POST https://paygateglobal.com/api/v1/pay`.
- Callback reçu sur: `/api/paygate/callback` et `/api/pay/callback` (compat).
- Test local: `curl` ou `node test_pay.mjs` renvoie le même message d’erreur.

---
Pièces jointes recommandées :
- Capture d’écran des logs ci‑dessus (si vous partagez par support). 
- RIB / documents KYC si demandés.
