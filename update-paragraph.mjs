import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

const updated = content.replace(
  "Une fois inscrit, vous pourrez consulter l'opportunité d'investissement et toutes les informations de la campagne.",
  `{isLoginMode
                ? 'Bienvenue ! Connectez-vous à votre compte pour accéder au site.'
                : 'Une fois inscrit, vous pourrez consulter l\\'opportunité d\\'investissement et toutes les informations de la campagne.'}`
);

fs.writeFileSync('src/App.tsx', updated);
console.log('✓ Paragraph updated');
