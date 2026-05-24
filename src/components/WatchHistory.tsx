import React, { useState } from 'react';
import { WatchedMovie, CURATED_PRESETS } from '../types';
import { getMoviePosterUrl } from '../utils/movieImages';
import { Star, Trash2, Search, Sparkles, Film as MovieIcon, Plus, AlertCircle, Loader2, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WatchHistoryProps {
  watchHistory: WatchedMovie[];
  onAddMovie: (movie: WatchedMovie) => void;
  onRemoveMovie: (id: string) => void;
}

export default function WatchHistory({
  watchHistory,
  onAddMovie,
  onRemoveMovie
}: WatchHistoryProps) {
  // AI Lookup states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aiFoundMovie, setAiFoundMovie] = useState<{
    title: string;
    year: string;
    genres: string[];
    plot: string;
  } | null>(null);

  // Form states for adding
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [customMoods, setCustomMoods] = useState("");

  const handleAiLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setAiFoundMovie(null);

    try {
      const response = await fetch("/api/movie-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to find movie information.");
      }

      if (data.movie) {
        setAiFoundMovie(data.movie);
      } else {
        throw new Error("Could not fetch details for this specify query.");
      }
    } catch (err: any) {
      setSearchError(err.message || "An unexpected error occurred during AI search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCurated = (preset: typeof CURATED_PRESETS[0]) => {
    // Check if already exists
    if (watchHistory.some(m => m.title.toLowerCase() === preset.title.toLowerCase())) {
      alert(`"${preset.title}" is already in your watch history!`);
      return;
    }

    const movie: WatchedMovie = {
      id: Date.now().toString() + Math.random().toString(),
      title: preset.title,
      year: preset.year,
      genres: preset.genres,
      userRating: 4 + Math.floor(Math.random() * 2), // random 4 or 5 stars as friendly default
      moods: ["Iconic"],
      watchedAt: new Date().toLocaleDateString()
    };
    onAddMovie(movie);
  };

  const confirmAddAiFound = () => {
    if (!aiFoundMovie) return;

    if (watchHistory.some(m => m.title.toLowerCase() === aiFoundMovie.title.toLowerCase())) {
      alert(`"${aiFoundMovie.title}" is already in your watch history!`);
      return;
    }

    const ratingsParsed = selectedRating;
    const moodsArray = customMoods
      ? customMoods.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];

    const movie: WatchedMovie = {
      id: Date.now().toString(),
      title: aiFoundMovie.title,
      year: aiFoundMovie.year,
      genres: aiFoundMovie.genres,
      userRating: ratingsParsed,
      userReview: reviewText.trim() || undefined,
      moods: moodsArray.length > 0 ? moodsArray : undefined,
      watchedAt: new Date().toLocaleDateString()
    };

    onAddMovie(movie);
    
    // Reset states
    setAiFoundMovie(null);
    setSearchQuery("");
    setReviewText("");
    setCustomMoods("");
    setSelectedRating(5);
  };

  const getGenreAnalytics = () => {
    const genreTotals: { [key: string]: { sum: number; count: number } } = {};
    
    watchHistory.forEach((movie) => {
      movie.genres.forEach((genre) => {
        const gNormal = genre.trim();
        if (!gNormal) return;
        const capitalized = gNormal.charAt(0).toUpperCase() + gNormal.slice(1).toLowerCase();
        if (!genreTotals[capitalized]) {
          genreTotals[capitalized] = { sum: 0, count: 0 };
        }
        genreTotals[capitalized].sum += movie.userRating;
        genreTotals[capitalized].count += 1;
      });
    });

    const data = Object.keys(genreTotals).map((genre) => {
      const rawAvg = genreTotals[genre].sum / genreTotals[genre].count;
      return {
        name: genre,
        avgRating: parseFloat(rawAvg.toFixed(1)),
        count: genreTotals[genre].count,
      };
    });

    return data.sort((a, b) => b.avgRating - a.avgRating);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md text-[11px] font-sans">
          <p className="font-bold text-white mb-1 uppercase tracking-wider">{data.name}</p>
          <div className="flex flex-col gap-0.5 mt-1 font-mono">
            <span className="text-indigo-400">Avg Rating: {data.avgRating} ★</span>
            <span className="text-gray-400">Total Count: {data.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8" id="watch_history_panel">
      
      {/* 1. Add Movie Inputs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
          <Search className="w-5 h-5 text-indigo-400 font-bold" />
          Add to Your Film Vault
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Type any movie you've seen and let our server-side AI extract pristine metadata. Or click one of the quick cinematic presets.
        </p>

        {/* Action Lookup Input */}
        <form onSubmit={handleAiLookup} className="flex gap-2">
          <input
            type="text"
            id="history_search_input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Gladiator, Avatar, Spirited Away, Dune..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-650 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            id="lookup_movie_btn"
            disabled={isSearching}
            className="px-5 bg-white hover:bg-white/95 text-black text-xs rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isSearching ? "Searching..." : "AI Search"}
          </button>
        </form>

        {/* Error notification if any */}
        {searchError && (
          <div className="mt-3 bg-red-950/30 border border-red-900/40 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* AI Found Movie Preview and Add Form */}
        {aiFoundMovie && (
          <div className="mt-5 p-5 bg-black/60 rounded-xl border border-indigo-500/30 animate-fadeIn space-y-4">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans">{aiFoundMovie.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{aiFoundMovie.year}</span>
                  <span className="text-[11px] text-gray-400 font-sans">{aiFoundMovie.genres.join(", ")}</span>
                </div>
              </div>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider font-bold">Matched</span>
            </div>

            <p className="text-xs text-gray-300 italic">" {aiFoundMovie.plot} "</p>

            {/* Rate Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Your Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="cursor-pointer hover:scale-110 transition-all p-1"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= selectedRating 
                            ? 'text-indigo-400 fill-indigo-400 text-glow-indigo' 
                            : 'text-gray-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 font-sans">Vibes / Mood Tags</label>
                <input
                  type="text"
                  placeholder="e.g. Masterpiece, Romantic, Intense"
                  value={customMoods}
                  onChange={(e) => setCustomMoods(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Short Review</label>
              <textarea
                placeholder="Write a brief line on what resonated with you..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAiFoundMovie(null)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white transition cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={confirmAddAiFound}
                id="confirm_add_movie_btn"
                className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Vault
              </button>
            </div>
          </div>
        )}

        {/* 2. Onboard presets */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <MovieIcon className="w-3.5 h-3.5 text-slate-500" />
            Quick Add Cinema Classics
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {CURATED_PRESETS.map(preset => {
              const isAdded = watchHistory.some(m => m.title.toLowerCase() === preset.title.toLowerCase());
              return (
                <button
                  key={preset.title}
                  type="button"
                  id={`onboard_preset_${preset.title.toLowerCase().replace(/\s+/g, '_')}`}
                  onClick={() => handleAddCurated(preset)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1 transition cursor-pointer ${
                    isAdded 
                      ? 'bg-white/5 text-gray-600 border-white/5 line-through' 
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Plus className="w-3 h-3 text-indigo-400" strokeWidth={3} />
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-gray-500">({preset.year})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Current History List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
          <span>Your Watched Archive</span>
          <span className="text-xs font-mono py-0.5 px-2 bg-black/40 border border-white/5 rounded-full text-indigo-400">
            {watchHistory.length} Titles
          </span>
        </h3>

        {watchHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-xs text-gray-500 italic">No watch history has been configured yet.</p>
            <p className="text-xs text-gray-600 mt-1">Add a few favorite movies above to seed custom suggestions.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto pr-1">
            {watchHistory.map((movie) => (
              <div key={movie.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start justify-between group">
                {/* Visual cover Thumbnail */}
                <div className="w-14 h-18 bg-black/40 rounded-xl border border-white/10 overflow-hidden shrink-0 shadow-md relative group-hover:border-indigo-500/35 transition-colors duration-300">
                  <img 
                    src={getMoviePosterUrl(movie.title, movie.genres)} 
                    alt={movie.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide font-sans truncate">{movie.title}</h4>
                    <span className="text-xs font-mono text-gray-500">{movie.year}</span>
                  </div>
                  
                  {/* Genres list inside history */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {movie.genres.map(g => (
                      <span key={g} className="text-[10px] px-1.5 py-0.2 bg-white/5 rounded border border-white/5 text-gray-400">{g}</span>
                    ))}
                  </div>

                  {/* Stars indicators */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(st => (
                        <Star 
                          key={st} 
                          className={`w-3 h-3 ${st <= movie.userRating ? 'text-indigo-400 fill-indigo-400 text-glow-indigo' : 'text-gray-800'}`} 
                        />
                      ))}
                    </div>
                    {movie.watchedAt && (
                      <span className="text-[10px] text-gray-600 font-mono">Logged on {movie.watchedAt}</span>
                    )}
                  </div>

                  {/* Moods tags */}
                  {movie.moods && movie.moods.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {movie.moods.map(mood => (
                        <span key={mood} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 rounded font-medium">#{mood}</span>
                      ))}
                    </div>
                  )}

                  {/* Feedback text */}
                  {movie.userReview && (
                    <p className="text-xs text-gray-400 italic mt-2 border-l-2 border-white/10 pl-2 bg-white/5 py-1 pr-1 rounded-r">
                      "{movie.userReview}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  id={`remove_history_item_${movie.title.toLowerCase().replace(/\s+/g, '_')}`}
                  onClick={() => onRemoveMovie(movie.id)}
                  title="Remove from history"
                  className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition cursor-pointer mt-0.5 lg:-mr-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Genre Analytics Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
          <Award className="w-5 h-5 text-fuchsia-400" />
          Genre Taste Analysis
        </h3>
        
        {watchHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-xs text-gray-500 italic">No watch analytics available.</p>
            <p className="text-xs text-gray-600 mt-1 font-sans">Rate some films to plot your taste map.</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Your calculated average star rating (1-5★) mapped across all logged film genres.
            </p>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={getGenreAnalytics()}
                  margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    domain={[0, 5]} 
                    tickCount={6}
                    tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} 
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="avgRating" radius={[0, 6, 6, 0]} barSize={10}>
                    {getGenreAnalytics().map((entry, index) => {
                      const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#3b82f6'];
                      const color = colors[index % colors.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend / Metrics summary */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <span>Top Genre: <span className="text-indigo-400">{getGenreAnalytics()[0]?.name || 'N/A'}</span></span>
              <span>Avg Rating: <span className="text-fuchsia-400">{(watchHistory.reduce((acc, m) => acc + m.userRating, 0) / watchHistory.length).toFixed(1)} ★</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
