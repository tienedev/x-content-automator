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
- ❌ Projet Electron pas encore initialisé

## Configuration MCP
Serveurs configurés:
- mastra: `npx -y @mastra/mcp-docs-server@latest`
- gemini-cli: `npx -y @google/gemini-cli@latest mcp`
- context7: `npx -y @context7/mcp-server@latest`

## Prochaines Étapes
1. Initialiser le projet Electron avec React
2. Créer la structure des dossiers
3. Configurer l'agent Mastra AI
4. Implémenter la collecte RSS/web
5. Créer l'interface utilisateur basique

## Todos en Cours
- [x] Créer documentation technique (README.md)
- [ ] Analyser la structure du projet et initialiser l'app Electron
- [ ] Créer l'interface principale avec zones de contenu tech/business/perso
- [ ] Implémenter l'agent de collecte de contenu (RSS/web scraping)
- [ ] Intégrer Mastra AI pour génération et reformulation de contenu
- [ ] Ajouter système de copie vers clipboard pour posts
- [ ] Créer calendrier éditorial simple
- [ ] Ajouter gestion des sources RSS/sites web configurables

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