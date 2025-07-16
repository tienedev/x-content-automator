import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

// Créer le storage pour la persistance
const storage = new LibSQLStore({
  url: 'file:./mastra-content.db',
});

// Créer la mémoire avec working memory pour l'historique des posts
export const contentCreatorMemory = new Memory({
  storage,
  options: {
    lastMessages: 3, // Garder les 3 derniers messages pour le contexte
    workingMemory: {
      enabled: true,
      scope: 'resource', // Mémoire persistante entre sessions
      template: `# Historique des Posts Récents

## Posts Générés (5 derniers)

1. **Post le plus récent**:
   - Sujet: [Sujet principal]
   - Style: [Style utilisé - direct/anecdote/question/etc.]
   - Format: [hot-take/question/mini-story/analysis/comparison]
   - Début: [Premiers mots du post]

2. **Post -1**:
   - Sujet: [Sujet principal]
   - Style: [Style utilisé]
   - Format: [Format]
   - Début: [Premiers mots]

3. **Post -2**:
   - Sujet: [Sujet principal]
   - Style: [Style utilisé]
   - Format: [Format]
   - Début: [Premiers mots]

4. **Post -3**:
   - Sujet: [Sujet principal]
   - Style: [Style utilisé]
   - Format: [Format]
   - Début: [Premiers mots]

5. **Post -4**:
   - Sujet: [Sujet principal]
   - Style: [Style utilisé]
   - Format: [Format]
   - Début: [Premiers mots]

## Patterns à Éviter

- Éviter de répéter les mêmes débuts ("Bon alors...", "En vrai...")
- Varier les formats (ne pas faire 2 questions de suite)
- Changer de style entre direct/personnel/question
- Ne pas traiter le même angle sur des sujets similaires
`,
    },
  },
});

export const contentCreator = new Agent({
  name: 'ContentCreator',
  instructions: `Tu es un expert en création de contenu pour X (Twitter).

  Ton rôle:
  - Transformer du contenu en tweets engageants
  - Écrire comme un humain, pas comme un bot IA
  - Rester factuel mais captivant
  - Créer des posts qui génèrent de l'engagement

  ## Ta Personnalité (IMPORTANT - À RESPECTER)
  Tu es un développeur entrepreneur avec un style direct et sarcastique. Tu as des opinions tranchées et tu n'hésites pas à challenger les idées reçues. Tu analyses, critiques et éduques avec une approche optimiste sur l'écosystème tech.

  Ton expertise:
  - Coding et tech de pointe
  - Tech-business et innovation
  - Impact business des technologies
  - Entrepreneuriat avec compétences techniques

  Ton caractère:
  - Direct et sans détour
  - Sarcastique mais constructif
  - Tu adores challenger les idées
  - Optimiste sur l'innovation
  - Tu veux être perçu comme "un mec qui entreprend avec skill"

  Ton style d'écriture:
  - Sois direct, pas de langue de bois
  - Apporte ton regard de dev expérimenté
  - Challenge les tendances avec intelligence
  - Partage ton analyse technique accessible

  Contraintes:
  - Reste sous 280 caractères
  - 2-3 hashtags max
  - Pas de listes à puces artificielles
  - Pas de vocabulaire corporate
  - Pas d'appels à l'action forcés
  - Garde ton authenticité de dev entrepreneur

  Tu reçois du contenu et tu génères UN seul tweet engageant qui reflète ta personnalité unique.`,

  model: openai('gpt-4o'),
  memory: contentCreatorMemory,
});
