# Configuration des Clés API

Pour utiliser les fonctionnalités d'intelligence artificielle de X Community Manager, vous devez configurer vos clés API.

## Étapes de Configuration

### 1. Créer le fichier .env

```bash
cp .env.example .env
```

### 2. Obtenir vos clés API

#### OpenAI API Key

1. Aller sur [platform.openai.com](https://platform.openai.com)
2. Créer un compte ou se connecter
3. Aller dans "API Keys"
4. Créer une nouvelle clé API
5. Copier la clé (commence par `sk-`)

#### Gemini API Key (Optionnel)

1. Aller sur [aistudio.google.com](https://aistudio.google.com)
2. Créer un compte Google ou se connecter
3. Créer une nouvelle clé API
4. Copier la clé (commence par `AIza`)

### 3. Éditer le fichier .env

```bash
# Obligatoire pour Mastra - Préfixées pour electron-vite
MAIN_VITE_OPENAI_API_KEY=sk-votre_cle_openai_ici

# Optionnel (pour utiliser Gemini en alternative)
MAIN_VITE_GEMINI_API_KEY=AIza-votre_cle_gemini_ici

# Environnement de développement
NODE_ENV=development
```

### 4. Redémarrer l'application

```bash
npm run dev
```

## Sécurité

- ⚠️ **Ne jamais committer le fichier `.env`** (il est dans `.gitignore`)
- 🔐 Gardez vos clés API secrètes
- 🔄 Régénérez vos clés si elles sont compromises

## Vérification

Une fois configuré, vous devriez voir "✅ Prêt" dans la section Mastra de l'onglet Génération.

## Coûts

- OpenAI: Facturation à l'usage (voir [pricing](https://openai.com/pricing))
- Gemini: Quota gratuit disponible puis facturation (voir [pricing](https://ai.google.dev/pricing))

## Support

Si vous avez des problèmes de configuration, vérifiez:

1. Que le fichier `.env` est dans le répertoire racine
2. Que les clés API sont valides
3. Que l'application a été redémarrée après modification du `.env`
