const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const oldText = `            <h1 className="text-2xl font-extrabold text-white">Créer un compte pour accéder au site</h1>
            <p className="text-slate-400 text-sm mt-3">
              Une fois inscrit, vous pourrez consulter l'opportunité d'investissement et toutes les informations de la campagne.
            </p>`;

const newText = `            <h1 className="text-2xl font-extrabold text-white">
              {isLoginMode ? 'Se connecter' : 'Créer un compte'}
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              {isLoginMode
                ? 'Bienvenue ! Connectez-vous à votre compte pour accéder au site.'
                : 'Une fois inscrit, vous pourrez consulter l\\'opportunité d\\'investissement et toutes les informations de la campagne.'}
            </p>`;

if (content.includes(oldText)) {
  const updated = content.replace(oldText, newText);
  fs.writeFileSync('src/App.tsx', updated);
  console.log('✓ Title updated successfully');
} else {
  console.log('✗ Could not find the text to replace');
}
