import React, { useState } from 'react';
import { MovieRecommendation } from '../types';
import { getMoviePosterUrl } from '../utils/movieImages';
import { 
  Sparkles, Check, Bookmark, ThumbsDown, Clapperboard, 
  Tv, Film, Eye, Award, ExternalLink, Calendar, HelpCircle 
} from 'lucide-react';

interface RecommendationResultsProps {
  recommendations: MovieRecommendation[];
  onMarkAsWatched: (rec: MovieRecommendation, rating: number, review?: string) => void;
  onExcludeMovie: (title: string) => void;
}

export default function RecommendationResults({
  recommendations,
  onMarkAsWatched,
  onExcludeMovie
}: RecommendationResultsProps) {
  const [filterGenre, setFilterGenre] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Rate dialog state for a specific movie being added to history
  const [ratingMovieId, setRatingMovieId] = useState<string | null>(null);
  const [quickRating, setQuickRating] = useState<number>(5);
  const [quickReview, setQuickReview] = useState<string>("");

  // Extract all genres in current list to filter dynamically
  const availableGenres = Array.from(
    new Set(recommendations.flatMap(rec => rec.genres))
  );

  const filteredRecs = recommendations.filter(rec => {
    const matchesGenre = filterGenre === "All" || rec.genres.includes(filterGenre);
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.plot.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const getAccentBorderClass = (accent: string) => {
    switch (accent) {
      case "orange": return "border-orange-500/20 hover:border-orange-500/60 focus:border-orange-500";
      case "indigo": return "border-indigo-500/20 hover:border-indigo-500/60 focus:border-indigo-500";
      case "emerald": return "border-emerald-500/20 hover:border-emerald-500/60 focus:border-emerald-500";
      case "rose": return "border-rose-500/20 hover:border-rose-500/60 focus:border-rose-500";
      case "amber": return "border-amber-500/20 hover:border-amber-500/60 focus:border-amber-500";
      case "violet": return "border-violet-500/20 hover:border-violet-500/60 focus:border-violet-500";
      case "cyan": return "border-cyan-500/20 hover:border-cyan-500/60 focus:border-cyan-500";
      default: return "border-white/10 hover:border-white/20";
    }
  };

  const getAccentBgClass = (accent: string) => {
    switch (accent) {
      case "orange": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "indigo": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "emerald": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "rose": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "amber": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "violet": return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "cyan": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      default: return "bg-white/5 text-gray-300 border border-white/5";
    }
  };

  const getAccentTextGlowClass = (accent: string) => {
    switch (accent) {
      case "orange": return "text-orange-400 text-glow-orange";
      case "indigo": return "text-indigo-400 text-glow-indigo";
      case "emerald": return "text-emerald-400 text-glow-emerald";
      case "rose": return "text-rose-400 text-glow-rose";
      case "amber": return "text-amber-400 text-glow-gold";
      case "violet": return "text-violet-400 text-glow-violet";
      case "cyan": return "text-cyan-400 text-glow-cyan";
      default: return "text-slate-200";
    }
  };

  const startQuickWatch = (id: string) => {
    setRatingMovieId(id);
    setQuickRating(5);
    setQuickReview("");
  };

  const submitQuickWatch = (rec: MovieRecommendation) => {
    onMarkAsWatched(rec, quickRating, quickReview);
    setRatingMovieId(null);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" id="recommendation_results_panel">
      
      {/* Search and Quick Filters Menu */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between backdrop-blur-md">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse text-glow-indigo" />
          <div>
            <h3 className="font-bold text-white text-sm">Personalized Screening Queue</h3>
            <p className="text-[11px] text-gray-500">Sort, filter, and add movies to your local theater history</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none"
          />

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:outline-none cursor-pointer"
          >
            <option value="All">All Genres</option>
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommended Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecs.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs text-gray-500 italic">No recommendations match your current display filters.</p>
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const isRatingThis = ratingMovieId === rec.id;

            return (
              <div
                key={rec.id}
                id={`recommendation_card_${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                className={`flex flex-col justify-between bg-white/5 rounded-[28px] p-6 border transition-all duration-300 backdrop-blur-md group ${getAccentBorderClass(rec.primaryColorAccent)}`}
              >
                <div>
                  {/* Movie Poster Image Thumbnail */}
                  <div className="aspect-video w-full bg-black/40 rounded-2xl relative overflow-hidden ring-1 ring-white/10 shadow-lg mb-4.5">
                    <img 
                      src={getMoviePosterUrl(rec.title, rec.genres)} 
                      alt={rec.title} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-103 transition-all duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-wider text-indigo-400 border border-white/5">
                      {rec.whereToWatch.toLowerCase().includes("netflix") 
                        ? "NETFLIX 4K" 
                        : rec.whereToWatch.toLowerCase().includes("disney") 
                          ? "DISNEY+ HDR" 
                          : rec.whereToWatch.toLowerCase().includes("prime")
                            ? "PRIME VIDEO"
                            : "PREMIUM ULTRA"}
                    </div>
                  </div>

                  {/* Top Header Card Info */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getAccentBgClass(rec.primaryColorAccent)}`}>
                          {rec.similarityScore}% Match
                        </span>
                        <span className="text-xs font-mono text-slate-500">{rec.year}</span>
                        <span className="text-[10px] font-mono border border-slate-800 text-slate-500 px-1 rounded">{rec.rating}</span>
                        <span className="text-[10px] font-mono text-slate-500">{rec.duration}</span>
                      </div>
                      <h4 className={`text-base font-bold tracking-wide font-sans mt-1.5 leading-tight ${getAccentTextGlowClass(rec.primaryColorAccent)}`}>
                        {rec.title}
                      </h4>
                    </div>
                    
                    {/* Platform highlight */}
                    <div className="flex items-center gap-1.5 bg-black/40 rounded-lg px-2.5 py-1 text-[10px] border border-white/5 shrink-0 select-none">
                      <Tv className="w-3 h-3 text-indigo-400" />
                      <span className="text-gray-400 font-medium">{rec.whereToWatch}</span>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {rec.genres.map(genre => (
                      <span key={genre} className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Plot summary hook */}
                  <p className="text-xs text-gray-350 leading-relaxed font-sans mb-4">
                    {rec.plot}
                  </p>

                  {/* Cast and Director details */}
                  <div className="space-y-1 bg-black/45 rounded-xl p-3 border border-white/5 mb-4 text-[11px] text-gray-450">
                    <div>
                      <span className="font-semibold text-gray-300">Director:</span> {rec.director}
                    </div>
                    <div className="line-clamp-1">
                      <span className="font-semibold text-gray-300">Starring:</span> {rec.keyCast.join(", ")}
                    </div>
                  </div>

                  {/* Deep Personalized recommendation reasons */}
                  <div className="border-l-2 border-indigo-500/40 bg-indigo-500/[0.02] rounded-r-xl p-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1 mb-1 font-mono text-glow-indigo">
                      <Award className="w-3.5 h-3.5 text-indigo-400" /> Recommendation insight
                    </span>
                    <p className="text-xs text-gray-300 italic font-sans leading-relaxed text-left">
                      "{rec.recommendationReason}"
                    </p>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="pt-4 border-t border-white/5">
                  {isRatingThis ? (
                    <div className="bg-black/60 rounded-xl p-3.5 border border-indigo-500/40 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Log your Watch rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setQuickRating(st)}
                              className="cursor-pointer"
                            >
                              <ThumbsDown 
                                className={`w-4 h-4 transform rotate-180 transition ${
                                  st <= quickRating 
                                    ? 'text-indigo-400 fill-indigo-400 text-glow-indigo scale-110' 
                                    : 'text-gray-700'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Add memory review (optional)..."
                        value={quickReview}
                        onChange={(e) => setQuickReview(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      />

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRatingMovieId(null)}
                          className="px-2.5 py-1 text-[10px] text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitQuickWatch(rec)}
                          className="px-4 py-2 bg-white text-black font-black uppercase text-[10px] rounded-lg hover:scale-102 transition cursor-pointer"
                        >
                          Save History
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        id={`excl_rec_${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                        onClick={() => onExcludeMovie(rec.title)}
                        className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-400 transition flex items-center gap-1 py-1 px-2 border border-transparent hover:border-red-950/30 hover:bg-red-950/20 rounded-lg cursor-pointer"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Exclude
                      </button>

                      <button
                        type="button"
                        id={`mark_rec_${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                        onClick={() => startQuickWatch(rec.id)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3.5 border border-white/10 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        Already Watched
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
