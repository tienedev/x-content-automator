# X Community Manager - État du Projet

## Contexte

Application Electron pour automatiser la gestion de votre présence sur X (Twitter). L'objectif est de créer une app qui aide à faire croître un compte X en postant quotidiennement, répondant aux commentaires et s'engageant dans la communauté.

## Stack Technique Définie

- **Frontend**: Electron + React
- **Backend**: Node.js
- **Base de données**: PocketBase (si nécessaire)
- **IA**: Mastra AI pour génération de contenu
- **APIs**: OpenAI + Gemini (utilisateur a les clés)

## Fonctionnalités Définies

1. **Contenu**: Tech, Business, Personnel
2. **Publication**: Copie manuelle vers X (pas d'API X pour l'instant)
3. **Commentaires**: Gestion manuelle
4. **Sources**: RSS feeds + sites web
5. **Génération**: Contenu original + reformulation (choix utilisateur)
6. **Interface**: Simple pour commencer
7. **Calendrier**: Planification éditoriale

## État Actuel

- ✅ README.md créé avec architecture complète
- ✅ Configuration MCP ajoutée (/Users/tiene/.config/claude-code/settings.json)
- ✅ Projet Electron initialisé
- ✅ Architecture Mastra AI implémentée
- ✅ Agents NewsAnalyzer et ContentCreator créés
- ✅ Workflow de génération de contenu opérationnel
- ✅ Interface ContentGenerator intégrée avec Mastra

## Configuration MCP

Serveurs configurés:

- mastra: `npx -y @mastra/mcp-docs-server@latest`
- gemini-cli: `npx -y @google/gemini-cli@latest mcp`
- context7: `npx -y @context7/mcp-server@latest`

## Architecture Mastra Implémentée

### Agents

- **NewsAnalyzer**: Analyse les actualités pour identifier le potentiel viral
- **ContentCreator**: Génère du contenu engageant et personnel

### Workflow

- **contentGenerationWorkflow**: Orchestre les deux agents
  1. Analyse et scoring des news RSS
  2. Sélection des meilleures actualités
  3. Génération de variations de contenu
  4. Finalisation avec l'agent ContentCreator

### Tools

- **analyzeViralPotential**: Score le potentiel viral des actualités
- **generateContentVariations**: Crée plusieurs formats de posts

## Comment Démarrer

1. **Configuration des clés API** (voir [API_SETUP.md](./API_SETUP.md)):

   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés OpenAI et Gemini
   ```

2. **Démarrage de l'application**:

   ```bash
   npm run dev
   ```

   Cela démarre automatiquement:
   - Le serveur Mastra avec les agents
   - L'application Electron

3. **Utilisation**:
   - Aller dans l'onglet "Génération"
   - Sélectionner le mode "Workflow Mastra"
   - Saisir un sujet et générer du contenu

**Note**: Les clés API se configurent maintenant directement dans le fichier `.env` du projet, plus dans l'interface Settings.

## Prochaines Étapes

1. Améliorer l'analyse des actualités
2. Ajouter plus de formats de contenu
3. Intégrer la planification éditoriale
4. Ajouter des métriques d'engagement

## Todos Complétés

- [x] Créer documentation technique (README.md)
- [x] Analyser la structure du projet et initialiser l'app Electron
- [x] Créer l'interface principale avec zones de contenu tech/business/perso
- [x] Implémenter l'agent de collecte de contenu (RSS/web scraping)
- [x] Intégrer Mastra AI pour génération et reformulation de contenu
- [x] Ajouter système de copie vers clipboard pour posts
- [x] Créer agents NewsAnalyzer et ContentCreator
- [x] Implémenter workflow de génération de contenu
- [x] Intégrer Mastra dans l'interface utilisateur
- [ ] Créer calendrier éditorial simple
- [ ] Ajouter métriques et analytics
- [ ] Améliorer l'analyse des actualités

## Commandes Utiles

```bash
# Démarrer Claude Code avec MCP
claude mcp

# Initialiser le projet (à faire)
npm init -y
npm install electron react react-dom
```

## Notes Importantes

- L'utilisateur préfère commencer simple et itérer
- Pas besoin d'API X dans un premier temps
- Focus sur la génération de contenu et interface utilisateur
- Mastra AI est la priorité pour l'agent IA
