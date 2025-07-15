const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// Configuration pour les tests
const parser = new Parser({
  timeout: 10000, // 10 secondes de timeout
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; X-Community-Manager/1.0)',
    },
  },
});

// Charger la configuration des feeds
const configPath = path.join(__dirname, '..', 'src', 'config', 'rssFeeds.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extraire les feeds de la configuration TypeScript
const categories = [];
const categoryMatches = configContent.matchAll(
  /{\s*id:\s*['"]([^'"]+)['"],[\s\S]*?feeds:\s*\[[\s\S]*?\]\s*}/g
);

for (const categoryMatch of categoryMatches) {
  const categoryBlock = categoryMatch[0];
  const categoryId = categoryMatch[1];

  // Extraire le nom de la catégorie
  const nameMatch = categoryBlock.match(/name:\s*['"]([^'"]+)['"]/);
  const categoryName = nameMatch ? nameMatch[1] : categoryId;

  // Extraire tous les feeds de cette catégorie
  const feedMatches = categoryBlock.matchAll(
    /{\s*name:\s*['"]([^'"]+)['"],\s*url:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"][\s\S]*?}/g
  );

  const feeds = [];
  for (const feedMatch of feedMatches) {
    feeds.push({
      name: feedMatch[1],
      url: feedMatch[2],
      type: feedMatch[3],
      category: feedMatch[4],
    });
  }

  if (feeds.length > 0) {
    categories.push({
      id: categoryId,
      name: categoryName,
      feeds: feeds,
    });
  }
}

console.log(
  `🔍 Test de ${categories.reduce((acc, cat) => acc + cat.feeds.length, 0)} feeds RSS...\n`
);

async function testFeed(feed) {
  try {
    console.log(`⏳ Test: ${feed.name} (${feed.url})`);

    const startTime = Date.now();
    const result = await parser.parseURL(feed.url);
    const duration = Date.now() - startTime;

    if (result && result.items && result.items.length > 0) {
      console.log(`✅ ${feed.name} - OK (${result.items.length} items, ${duration}ms)`);
      return { ...feed, status: 'OK', itemCount: result.items.length, duration };
    } else {
      console.log(`⚠️  ${feed.name} - Aucun contenu`);
      return { ...feed, status: 'NO_CONTENT', error: 'Aucun item trouvé' };
    }
  } catch (error) {
    console.log(`❌ ${feed.name} - ERREUR: ${error.message}`);
    return {
      ...feed,
      status: 'ERROR',
      error: error.message,
      errorCode: error.code || 'UNKNOWN',
    };
  }
}

async function testAllFeeds() {
  const results = {
    working: [],
    broken: [],
    noContent: [],
  };

  let totalCount = 0;

  for (const category of categories) {
    console.log(`\n📂 Catégorie: ${category.name}`);
    console.log('─'.repeat(50));

    for (const feed of category.feeds) {
      totalCount++;
      const result = await testFeed(feed);

      switch (result.status) {
        case 'OK':
          results.working.push(result);
          break;
        case 'NO_CONTENT':
          results.noContent.push(result);
          break;
        case 'ERROR':
          results.broken.push(result);
          break;
      }

      // Petite pause pour éviter de surcharger les serveurs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT FINAL');
  console.log('='.repeat(60));
  console.log(`Total testé: ${totalCount}`);
  console.log(`✅ Fonctionnels: ${results.working.length}`);
  console.log(`⚠️  Sans contenu: ${results.noContent.length}`);
  console.log(`❌ Cassés: ${results.broken.length}`);

  if (results.broken.length > 0) {
    console.log('\n🔴 FEEDS CASSÉS À SUPPRIMER:');
    console.log('─'.repeat(40));
    results.broken.forEach(feed => {
      console.log(`• ${feed.name}`);
      console.log(`  URL: ${feed.url}`);
      console.log(`  Erreur: ${feed.error}`);
      console.log('');
    });
  }

  if (results.noContent.length > 0) {
    console.log('\n🟡 FEEDS SANS CONTENU (à vérifier):');
    console.log('─'.repeat(40));
    results.noContent.forEach(feed => {
      console.log(`• ${feed.name}`);
      console.log(`  URL: ${feed.url}`);
      console.log('');
    });
  }

  // Sauvegarder les résultats dans un fichier JSON
  const reportPath = path.join(__dirname, 'rss-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Rapport détaillé sauvegardé: ${reportPath}`);

  return results;
}

// Lancer les tests
testAllFeeds()
  .then(results => {
    console.log('\n✨ Tests terminés !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur lors des tests:', error);
    process.exit(1);
  });
