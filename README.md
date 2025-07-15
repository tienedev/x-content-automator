# X Community Manager

Application Electron pour automatiser et optimiser la gestion de votre présence sur X (Twitter). Génère du contenu intelligent, collecte des informations en temps réel et facilite l'engagement communautaire.

## 🚀 Fonctionnalités

### Génération de Contenu

- **Collecte automatique** : RSS feeds, scraping web, APIs
- **IA Mastra AI** : Génération de contenu original + reformulation
- **Catégories** : Tech, Business, Personnel
- **Copie en un clic** : Export direct vers clipboard pour X

### Interface Utilisateur

- **Dashboard simple** : Vue d'ensemble du contenu généré
- **Calendrier éditorial** : Planification des publications
- **Gestion des sources** : Configuration RSS/sites web
- **Prévisualisation** : Aperçu avant publication

## 🛠️ Stack Technique

### Frontend

- **Electron** : Application desktop cross-platform
- **React** : Interface utilisateur moderne et réactive
- **CSS Modules/Styled Components** : Styling modulaire

### Backend

- **Node.js** : Runtime JavaScript
- **PocketBase** : Base de données locale (si nécessaire)
- **Mastra AI** : Agent IA pour génération de contenu

### Intégrations

- **OpenAI API** : Génération de contenu avancée
- **Gemini API** : Alternative IA
- **RSS Parser** : Collecte de flux RSS
- **Web Scraping** : Extraction de contenu web

## 📁 Structure du Projet

```
x-community-manager/
├── src/
│   ├── main/              # Processus principal Electron
│   ├── renderer/          # Interface React
│   │   ├── components/    # Composants UI
│   │   ├── pages/         # Pages principales
│   │   ├── hooks/         # Hooks React personnalisés
│   │   └── utils/         # Utilitaires frontend
│   ├── agents/           # Agents Mastra AI
│   ├── services/         # Services backend
│   │   ├── content/      # Collecte de contenu
│   │   ├── ai/           # Intégrations IA
│   │   └── database/     # Gestion BDD
│   └── types/            # Types TypeScript
├── assets/               # Images, icônes
├── build/               # Fichiers de build
└── docs/                # Documentation
```

## 🎯 Roadmap

### Phase 1 : MVP

- [x] Structure projet Electron + React
- [ ] Interface basique avec zones de contenu
- [ ] Agent Mastra AI de base
- [ ] Collecte RSS simple
- [ ] Copie vers clipboard

### Phase 2 : Amélioration

- [ ] Calendrier éditorial
- [ ] Sources configurables
- [ ] Catégorisation automatique
- [ ] Historique des posts

### Phase 3 : Avancé

- [ ] Analytics de performance
- [ ] Intégration API X (optionnel)
- [ ] Templates personnalisés
- [ ] Collaboration multi-comptes

## ⚡ Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build production
npm run build

# Package pour distribution
npm run package
```

## 🔧 Configuration

### Variables d'environnement

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
MASTRA_CONFIG=path_to_config
```

### Sources de contenu

- Configuration via interface graphique
- Import/export de listes de sources
- Filtrage par catégories

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.
