import { useState, ChangeEvent, useEffect } from 'react';
import { Search, Star, Download, X, AlertCircle, ExternalLink } from 'lucide-react';
import { searchLocalExtensions, getPopularExtensions, getTopRatedExtensions, type ExtensionDetail } from '../data/extensionHelpers';

export type ExtensionResult = {
  name: string;
  version: string;
  description: string;
  links?: any;
  downloads?: number;
  rating?: number;
  author?: string;
  category?: string;
  tags?: string[];
};

export type FilterTab = 'featured' | 'popular' | 'recommended' | 'favorites';

interface ExtensionMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExtension: (extension: ExtensionResult) => Promise<void>;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: ExtensionResult[];
  isSearching: boolean;
  searchError: string;
  onSearch: () => Promise<void>;
}

export default function ExtensionMarketplace({
  isOpen,
  onClose,
  onSelectExtension,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearching,
  searchError,
  onSearch,
}: ExtensionMarketplaceProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('featured');
  const [sortBy, setSortBy] = useState<'relevant' | 'downloads' | 'rating'>('relevant');
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState<Set<string>>(new Set());
  const [localResults, setLocalResults] = useState<ExtensionDetail[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Load initial local extensions based on active tab
    if (activeTab === 'popular') {
      setLocalResults(getPopularExtensions(12));
    } else if (activeTab === 'recommended') {
      setLocalResults(getTopRatedExtensions(12));
    } else if (activeTab === 'featured') {
      setLocalResults(getPopularExtensions(12));
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const handleInstall = async (extension: ExtensionResult | ExtensionDetail) => {
    setInstalling((prev) => new Set(prev).add(extension.name));
    try {
      await onSelectExtension({
        name: extension.name,
        version: extension.version,
        description: extension.description,
        downloads: extension.downloads,
        rating: extension.rating,
        author: 'author' in extension ? extension.author : undefined,
        category: 'category' in extension ? extension.category : undefined,
        tags: 'tags' in extension ? extension.tags : undefined,
      } as ExtensionResult);
    } finally {
      setInstalling((prev) => {
        const next = new Set(prev);
        next.delete(extension.name);
        return next;
      });
    }
  };

  const toggleFavorite = (name: string) => {
    setSelectedFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // D'abord, chercher dans les extensions locales
    const local = searchLocalExtensions(searchQuery);
    setLocalResults(local);
    
    // Puis, lancer la recherche NPM en même temps
    await onSearch();
  };

  const getDisplayResults = (): (ExtensionResult | ExtensionDetail)[] => {
    // Si on a des résultats de recherche NPM, les afficher
    if (searchResults.length > 0) {
      let results = [...searchResults];
      
      if (activeTab === 'favorites') {
        results = results.filter((r) => selectedFavorites.has(r.name));
      }
      
      if (sortBy === 'downloads') {
        results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      } else if (sortBy === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      return results;
    }

    // Sinon, afficher les résultats locaux
    if (localResults.length > 0) {
      let results = [...localResults];
      
      if (activeTab === 'favorites') {
        results = results.filter((r) => selectedFavorites.has(r.name));
      }
      
      if (sortBy === 'downloads') {
        results.sort((a, b) => b.downloads - a.downloads);
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }
      
      return results;
    }

    return [];
  };

  const displayResults = getDisplayResults();

  const tabOptions: { id: FilterTab; label: string; icon: string }[] = [
    { id: 'featured', label: 'En avant', icon: '⭐' },
    { id: 'popular', label: 'Populaires', icon: '🔥' },
    { id: 'recommended', label: 'Recommandés', icon: '✓' },
    { id: 'favorites', label: 'Favoris', icon: '❤️' },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-black/50 overflow-y-auto">
      {/* Header/Overlay */}
      <div className="sticky top-0 z-61 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">Ajouter des extensions</h1>
          <p className="text-sm text-slate-400 mb-6">Parcourez notre catalogue d'extensions recommandées ou recherchez des packages NPM pour télécharger des plugins en ligne.</p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Rechercher (ex: fedapay, stripe, paypal)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 rounded-lg bg-brand-green text-slate-950 font-semibold hover:bg-brand-green/90 disabled:opacity-50 transition whitespace-nowrap"
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-slate-400">
              Trier par:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-green"
            >
              <option value="relevant">Plus pertinent</option>
              <option value="downloads">Plus téléchargé</option>
              <option value="rating">Mieux noté</option>
            </select>
          </div>
        </div>

        {/* Tabs/Filters */}
        <div className="border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {searchError && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{searchError}</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
              <span>Recherche en cours...</span>
            </div>
          </div>
        )}

        {!isSearching && displayResults.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-slate-400">Aucune extension trouvée pour "{searchQuery}"</p>
            <p className="text-sm text-slate-500 mt-2">Essayez une autre recherche ou parcourez les catégories ci-dessus</p>
          </div>
        )}

        {!isSearching && displayResults.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-slate-400">Sélectionnez une catégorie ou recherchez une extension</p>
            <p className="text-sm text-slate-500 mt-2">Parcourez nos extensions recommandées en haut</p>
          </div>
        )}

        {/* Grid of Extensions */}
        {displayResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayResults.map((extension) => {
              const isFavorite = selectedFavorites.has(extension.name);
              const isInstalling = installing.has(extension.name);
              const isLocal = 'author' in extension;
              
              return (
                <div
                  key={extension.name}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 p-5 transition flex flex-col group"
                >
                  {/* Badge if local or online */}
                  <div className="mb-3 flex items-center gap-2">
                    {isLocal ? (
                      <span className="inline-block px-2 py-1 rounded bg-brand-green/20 text-brand-green text-xs font-semibold">
                        Catalogue local
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-sky-500/20 text-sky-300 text-xs font-semibold">
                        En ligne
                      </span>
                    )}
                    {!isLocal && (extension as ExtensionResult).links?.npm && (
                      <a
                        href={(extension as ExtensionResult).links?.npm}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Voir sur NPM
                      </a>
                    )}
                  </div>

                  {/* Header with favorite */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white break-words">{extension.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">v{extension.version}</p>
                      {isLocal && 'author' in extension && (
                        <p className="text-xs text-slate-500 mt-1">par {(extension as ExtensionDetail).author}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFavorite(extension.name)}
                      className={`p-2 rounded-lg transition flex-shrink-0 ${
                        isFavorite
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-700 text-slate-400 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 mb-4 flex-1 line-clamp-3">
                    {extension.description || 'Pas de description disponible'}
                  </p>

                  {/* Tags */}
                  {isLocal && 'tags' in extension && (extension as ExtensionDetail).tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {(extension as ExtensionDetail).tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-block px-2 py-1 rounded-full bg-slate-700 text-xs text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 text-xs text-slate-400 py-3 border-t border-b border-slate-700">
                    {extension.downloads && (
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{extension.downloads >= 1000000 ? (extension.downloads / 1000000).toFixed(1) + 'M' : (extension.downloads / 1000).toFixed(0) + 'k'}</span>
                      </div>
                    )}
                    {extension.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{extension.rating.toFixed(1)}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInstall(extension)}
                      disabled={isInstalling.has(extension.name)}
                      className="flex-1 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-brand-green/90 disabled:opacity-50 transition"
                    >
                      {isInstalling.has(extension.name) ? 'Installation...' : 'Télécharger'}
                    </button>
                    {(extension as ExtensionResult).links?.npm || ((isLocal && 'homepage' in extension && (extension as ExtensionDetail).homepage)) ? (
                      <a
                        href={(extension as ExtensionResult).links?.npm || (extension as ExtensionDetail).homepage}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
                        title={isLocal ? 'Visiter le site' : 'Ouvrir sur NPM'}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : null}
                      <a
                        href={(extension as ExtensionDetail).homepage}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
                        title="Visiter le site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
