import React, { useState, useEffect } from 'react';
import { FeedCategory, Source } from '@/types';

interface SourceCategoryManagerProps {
  onSourcesAdded: () => void;
}

const SourceCategoryManager: React.FC<SourceCategoryManagerProps> = ({ onSourcesAdded }) => {
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
  const [existingSources, setExistingSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndividual, setAddingIndividual] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [categoriesData, sourcesData] = await Promise.all([
        window.electronAPI.storage.getCategories(),
        window.electronAPI.storage.getSources(),
      ]);
      setCategories(categoriesData);
      setExistingSources(sourcesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleAddCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      await window.electronAPI.storage.addSourcesFromCategory(categoryId);
      onSourcesAdded();
      setSelectedCategory(null);
      setSelectedFeeds(new Set());
      alert('Toutes les sources de la catégorie ont été ajoutées !');
    } catch (error) {
      console.error("Erreur lors de l'ajout des sources:", error);
      alert("Erreur lors de l'ajout des sources");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSelectedFeeds = async (categoryId: string) => {
    if (selectedFeeds.size === 0) return;

    setAddingIndividual(true);
    try {
      await window.electronAPI.storage.addSourcesFromCategory(
        categoryId,
        Array.from(selectedFeeds)
      );
      onSourcesAdded();
      setSelectedCategory(null);
      setSelectedFeeds(new Set());
      alert(`${selectedFeeds.size} source(s) ajoutée(s) avec succès !`);
    } catch (error) {
      console.error("Erreur lors de l'ajout des sources:", error);
      alert("Erreur lors de l'ajout des sources");
    } finally {
      setAddingIndividual(false);
    }
  };

  const toggleFeedSelection = (feedUrl: string) => {
    const newSelection = new Set(selectedFeeds);
    if (newSelection.has(feedUrl)) {
      newSelection.delete(feedUrl);
    } else {
      newSelection.add(feedUrl);
    }
    setSelectedFeeds(newSelection);
  };

  const selectAllFeeds = (category: FeedCategory) => {
    const availableFeeds = category.feeds.filter(
      feed => !existingSources.some(source => source.url === feed.url)
    );
    setSelectedFeeds(new Set(availableFeeds.map(feed => feed.url)));
  };

  const clearSelection = () => {
    setSelectedFeeds(new Set());
  };

  const isSourceExists = (feedUrl: string): boolean => {
    return existingSources.some(source => source.url === feedUrl);
  };

  const getCategoryIcon = (categoryId: string): string => {
    const icons: Record<string, string> = {
      'tech-news': '📱',
      startup: '🚀',
      engineering: '⚙️',
      'ai-ml': '🤖',
      'design-ux': '🎨',
      marketing: '📈',
      learning: '📚',
      science: '🔬',
    };
    return icons[categoryId] || '📄';
  };

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div className='loading'></div>
        <p style={{ marginTop: '10px' }}>Chargement des catégories...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        📚 Catégories de sources prédéfinies
      </h3>

      {selectedCategory ? (
        // Vue détaillée d'une catégorie
        <div>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedFeeds(new Set());
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Retour aux catégories
          </button>

          {(() => {
            const category = categories.find(c => c.id === selectedCategory);
            if (!category) return null;

            const availableFeeds = category.feeds.filter(feed => !isSourceExists(feed.url));
            const existingFeedsCount = category.feeds.length - availableFeeds.length;

            return (
              <div>
                {/* En-tête de la catégorie */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{getCategoryIcon(category.id)}</span>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600' }}>{category.name}</h4>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{category.description}</p>
                    {existingFeedsCount > 0 && (
                      <p className='text-xs text-orange-600 dark:text-orange-400 mt-1'>
                        ⚠️ {existingFeedsCount} source(s) déjà ajoutée(s)
                      </p>
                    )}
                  </div>
                </div>

                {availableFeeds.length === 0 ? (
                  // Toutes les sources sont déjà ajoutées
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: '14px', color: '#92400e' }}>
                      ✅ Toutes les sources de cette catégorie sont déjà ajoutées.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Contrôles de sélection */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '16px',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        🎯 Sélection:
                      </span>
                      <button
                        onClick={() => selectAllFeeds(category)}
                        style={{
                          background: 'none',
                          border: '1px solid #3b82f6',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={clearSelection}
                        style={{
                          background: 'none',
                          border: '1px solid #6b7280',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Désélectionner
                      </button>
                      {selectedFeeds.size > 0 && (
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#3b82f6',
                            fontWeight: '500',
                            backgroundColor: '#dbeafe',
                            padding: '4px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          {selectedFeeds.size} sélectionnée(s)
                        </span>
                      )}
                    </div>

                    {/* Liste des sources avec checkboxes */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        maxHeight: '320px',
                        overflowY: 'auto',
                      }}
                    >
                      <div style={{ padding: '8px' }}>
                        {availableFeeds.map((feed, index) => (
                          <label
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              padding: '10px',
                              borderRadius: '6px',
                              backgroundColor: selectedFeeds.has(feed.url)
                                ? '#eff6ff'
                                : 'transparent',
                              border: selectedFeeds.has(feed.url)
                                ? '1px solid #3b82f6'
                                : '1px solid transparent',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              if (!selectedFeeds.has(feed.url)) {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!selectedFeeds.has(feed.url)) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <input
                              type='checkbox'
                              checked={selectedFeeds.has(feed.url)}
                              onChange={() => toggleFeedSelection(feed.url)}
                              style={{
                                margin: 0,
                                width: '16px',
                                height: '16px',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#374151',
                                }}
                              >
                                {feed.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#6b7280',
                                  marginTop: '2px',
                                }}
                              >
                                {feed.url}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#3b82f6',
                                backgroundColor: '#dbeafe',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {feed.category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Boutons d'action */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    paddingTop: '8px',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  {availableFeeds.length > 0 && (
                    <>
                      <button
                        className='btn btn-primary'
                        onClick={() => handleAddCategory(category.id)}
                        disabled={loading || addingIndividual}
                        style={{ flex: '1', minWidth: '150px' }}
                      >
                        {loading ? (
                          <>
                            <span className='loading'></span>
                            Ajout en cours...
                          </>
                        ) : (
                          <>
                            <span>📦</span>
                            Ajouter toutes ({availableFeeds.length})
                          </>
                        )}
                      </button>

                      <button
                        className='btn btn-secondary'
                        onClick={() => handleAddSelectedFeeds(category.id)}
                        disabled={selectedFeeds.size === 0 || loading || addingIndividual}
                        style={{
                          flex: '1',
                          minWidth: '150px',
                          opacity: selectedFeeds.size === 0 ? 0.5 : 1,
                        }}
                      >
                        {addingIndividual ? (
                          <>
                            <span className='loading'></span>
                            Ajout...
                          </>
                        ) : (
                          <>
                            <span>✓</span>
                            Ajouter sélection ({selectedFeeds.size})
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    className='btn btn-outline'
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedFeeds(new Set());
                    }}
                    style={{ minWidth: '100px' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        // Grille des catégories
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {categories.map(category => {
            const existingCount = existingSources.filter(source =>
              category.feeds.some(feed => feed.url === source.url)
            ).length;
            const availableCount = category.feeds.length - existingCount;

            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative' as const,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{getCategoryIcon(category.id)}</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    {category.name}
                  </h4>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  {category.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      fontWeight: '500',
                    }}
                  >
                    {availableCount > 0
                      ? `${availableCount} source${availableCount > 1 ? 's' : ''} disponible${availableCount > 1 ? 's' : ''}`
                      : 'Toutes ajoutées'}
                  </div>

                  {existingCount > 0 && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'rgb(234 88 12)',
                        backgroundColor: '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: '12px',
                      }}
                    >
                      {existingCount} déjà ajoutée{existingCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Indicateur visuel de progression */}
                <div
                  style={{
                    marginTop: '8px',
                    height: '3px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(existingCount / category.feeds.length) * 100}%`,
                      backgroundColor:
                        existingCount === category.feeds.length ? '#10b981' : '#f59e0b',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SourceCategoryManager;
