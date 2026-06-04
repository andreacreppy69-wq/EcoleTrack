import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

// Use a more robust search - look for the h1 tag specifically
const searchRegex = /<h1 className="text-2xl font-extrabold text-white">Créer un compte pour accéder au site<\/h1>\s*<p className="text-slate-400 text-sm mt-3">\s*Une fois inscrit, vous pourrez consulter l'opportunité d'investissement et toutes les informations de la campagne\.\s*<\/p>/;

const replacement = `<h1 className="text-2xl font-extrabold text-white">
              {isLoginMode ? 'Se connecter' : 'Créer un compte'}
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              {isLoginMode
                ? 'Bienvenue ! Connectez-vous à votre compte pour accéder au site.'
                : 'Une fois inscrit, vous pourrez consulter l\\'opportunité d\\'investissement et toutes les informations de la campagne.'}
            </p>`;

if (searchRegex.test(content)) {
  const updated = content.replace(searchRegex, replacement);
  fs.writeFileSync('src/App.tsx', updated);
  console.log('✓ Title updated with regex');
} else {
  console.log('✗ Regex did not match');
  
  // Try finding just the h1 tag
  if (content.includes('Créer un compte pour accéder au site')) {
    console.log('✓ Found text, but regex structure mismatch');
    
    // Use simpler string replacement
    const simpleReplace = content.replace(
      '<h1 className="text-2xl font-extrabold text-white">Créer un compte pour accéder au site</h1>',
      `<h1 className="text-2xl font-extrabold text-white">
              {isLoginMode ? 'Se connecter' : 'Créer un compte'}
            </h1>`
    );
    
    const finalReplace = simpleReplace.replace(
      '              Une fois inscrit, vous pourrez consulter l\'opportunité d\'investissement et toutes les informations de la campagne.',
      `{isLoginMode
                ? 'Bienvenue ! Connectez-vous à votre compte pour accéder au site.'
                : 'Une fois inscrit, vous pourrez consulter l\\'opportunité d\\'investissement et toutes les informations de la campagne.'}`
    );
    
    fs.writeFileSync('src/App.tsx', finalReplace);
    console.log('✓ Simple string replacement successful');
  }
}
