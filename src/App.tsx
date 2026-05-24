import React, { useState, useEffect } from 'react';
import { WatchedMovie, UserPreferences, MovieRecommendation } from './types';
import PreferenceSelector from './components/PreferenceSelector';
import WatchHistory from './components/WatchHistory';
import RecommendationResults from './components/RecommendationResults';
import { 
  Sparkles, Clapperboard, HelpCircle, Film, RefreshCw, 
  Trash2, Play, AlertCircle, CheckCircle2, User, HelpCircle as WelcomeIcon 
} from 'lucide-react';

const LOCAL_HISTORY_KEY = "mov_rec_history_v1";
const LOCAL_PREFS_KEY = "mov_rec_prefs_v1";
const LOCAL_RECS_KEY = "mov_rec_suggestions_v1";

const DEFAULT_PREFERENCES: UserPreferences = {
  genres: ["Sci-Fi", "Drama"],
  moods: ["Mind-bending", "Thought-provoking"],
  pace: "balanced",
  eras: ["Millennium (2000s - 2015)", "Modern Cinema (2016 - Present)"],
  languages: ["English Only"],
  exclusions: []
};

const SEED_HISTORY: WatchedMovie[] = [
  {
    id: "seed-1",
    title: "Inception",
    year: "2010",
    genres: ["Sci-Fi", "Action", "Thriller"],
    userRating: 5,
    moods: ["Mind-bending", "Intense & Suspenseful"],
    userReview: "Absolutely brilliant depth of conceptual worldbuilding. The soundtrack by Hans Zimmer is unmatched.",
    watchedAt: new Date().toLocaleDateString()
  },
  {
    id: "seed-2",
    title: "Spirited Away",
    year: "2001",
    genres: ["Anime", "Fantasy"],
    userRating: 5,
    moods: ["Emotional & Heartwarming"],
    userReview: "An unforgettable, magical journey through Miyazaki's hand-drawn wonderland.",
    watchedAt: new Date().toLocaleDateString()
  }
];

export default function App() {
  const [watchHistory, setWatchHistory] = useState<WatchedMovie[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (storedHistory) {
        setWatchHistory(JSON.parse(storedHistory));
      } else {
        // First-run Seed
        setWatchHistory(SEED_HISTORY);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(SEED_HISTORY));
      }

      const storedPrefs = localStorage.getItem(LOCAL_PREFS_KEY);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      } else {
        localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      }

      const storedRecs = localStorage.getItem(LOCAL_RECS_KEY);
      if (storedRecs) {
        setRecommendations(JSON.parse(storedRecs));
      }
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }
  }, []);

  // Update preferences helper
  const updatePreferencesHandler = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(newPrefs));
  };

  // Add a movie helper
  const addMovieHandler = (movie: WatchedMovie) => {
    const updated = [movie, ...watchHistory];
    setWatchHistory(updated);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  };

  // Remove a movie helper
  const removeMovieHandler = (id: string) => {
    const updated = watchHistory.filter(m => m.id !== id);
    setWatchHistory(updated);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  };

  // Mark recommendation as watched
  const markAsWatchedHandler = (rec: MovieRecommendation, rating: number, review?: string) => {
    const newMovie: WatchedMovie = {
      id: Date.now().toString(),
      title: rec.title,
      year: rec.year,
      genres: rec.genres,
      userRating: rating,
      userReview: review,
      watchedAt: new Date().toLocaleDateString()
    };
    
    // Add to history
    addMovieHandler(newMovie);

    // Filter out from active recommendations so it disappears gracefully
    const updatedRecs = recommendations.filter(r => r.id !== rec.id);
    setRecommendations(updatedRecs);
    localStorage.setItem(LOCAL_RECS_KEY, JSON.stringify(updatedRecs));
  };

  // Exclude/reject recommendation
  const excludeMovieHandler = (title: string) => {
    // Add title to exclusions
    const updatedExclusions = [...preferences.exclusions, title];
    const newPrefs = { ...preferences, exclusions: updatedExclusions };
    updatePreferencesHandler(newPrefs);

    // Remove from local list
    const updatedRecs = recommendations.filter(r => r.title.toLowerCase() !== title.toLowerCase());
    setRecommendations(updatedRecs);
    localStorage.setItem(LOCAL_RECS_KEY, JSON.stringify(updatedRecs));
  };

  // Trigger Gemini recommendation generation (Custom server.ts call)
  const generateRecommendations = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    setLoadingStage("Entering cinematic lounge...");

    const stages = [
      "Analyzing rated films in your Archive...",
      "Identifying preferred storytelling moods...",
      "Mapping sub-genres & cinematic intersections...",
      "Invoking Gemini critique intelligence...",
      "Extracting years, runtimes & directions...",
      "Constructing match metrics & summaries...",
      "Polishing personalized insight descriptions..."
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setLoadingStage(stages[currentStage]);
      }
    }, 1800);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          watchHistory,
          preferences
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Recommendation request timed out or returned error.");
      }

      if (data.recommendations && Array.isArray(data.recommendations)) {
        // Format and save
        const formatted = data.recommendations.map((m: any, idx: number) => ({
          ...m,
          id: `rec-${Date.now()}-${idx}`
        }));
        setRecommendations(formatted);
        localStorage.setItem(LOCAL_RECS_KEY, JSON.stringify(formatted));

        // Smooth scroll to recommendations portion
        setTimeout(() => {
          document.getElementById("recommendations_header")?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error("No suggestion structures returned from the critique engine.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to establish connect to server.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const clearCredentials = () => {
    if (window.confirm("Are you sure you want to reset your film logs, history and preferences?")) {
      localStorage.removeItem(LOCAL_HISTORY_KEY);
      localStorage.removeItem(LOCAL_PREFS_KEY);
      localStorage.removeItem(LOCAL_RECS_KEY);
      setWatchHistory([]);
      setPreferences(DEFAULT_PREFERENCES);
      setRecommendations([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex font-sans relative overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Immersive radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation rail on desktop */}
      <nav className="hidden lg:flex w-24 border-r border-white/10 flex-col items-center py-10 gap-12 bg-black/40 backdrop-blur-3xl z-20 shrink-0 select-none">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
          <div className="w-2 h-6 bg-white rounded-full -rotate-12 translate-x-1"></div>
          <div className="w-2 h-6 bg-white/60 rounded-full -rotate-12 -translate-x-1"></div>
        </div>
        <div className="flex flex-col gap-10">
           <div className="w-6 h-6 border-2 border-white rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors" title="Atmosphere"><div className="w-2 h-2 bg-indigo-400 rounded-sm"></div></div>
           <div className="w-6 h-6 border-2 border-white/30 rounded-full cursor-pointer hover:border-white transition-colors" title="Collections"></div>
           <div className="w-6 h-6 border-2 border-white/30 rounded-lg transform rotate-45 cursor-pointer hover:border-white transition-colors" title="Custom Filtering"></div>
           <div className="w-6 h-6 border-3 border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:border-white transition-colors" title="Watch History"><div className="w-1 h-2 bg-white/30 rounded-full"></div></div>
        </div>
        <div className="mt-auto mb-4 opacity-70">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold font-mono text-indigo-400">IU</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Header containing premium brand design and status indicators */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-3xl sticky top-0 z-50">
          <div className="w-full px-6 sm:px-12 py-5 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center gap-1">
                CINE<span className="text-indigo-400 text-glow-indigo">VIBE</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase font-bold">
                Curated for julian_v01 &bull; hailetameru722
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-gray-400 select-none">
                <span className="text-white border-b-2 border-indigo-500 pb-2 cursor-pointer">Atmosphere</span>
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => {
                  document.getElementById("watch_history_panel")?.scrollIntoView({ behavior: 'smooth' });
                }}>History</span>
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => {
                  document.getElementById("preference_selector_panel")?.scrollIntoView({ behavior: 'smooth' });
                }}>Filters</span>
              </div>

              <button
                onClick={clearCredentials}
                title="Reset cinema lounge"
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-300 transition cursor-pointer"
              >
                Reset Space
              </button>
            </div>
          </div>
        </header>

        {/* Main interactive screen layout */}
        <main className="flex-1 w-full px-6 sm:px-12 py-10">
          
          {/* Cinema Lounge Banner Hero Card */}
          <div className="mb-10 p-10 bg-gradient-to-r from-indigo-950/45 via-black/40 to-transparent border border-white/10 rounded-[32px] relative overflow-hidden backdrop-blur-md shadow-2xl ring-1 ring-white/5">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 col blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-3xl">
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold tracking-[0.4em] uppercase px-3 py-1 rounded-full">
                  BECAUSE YOU CRITIQUE CINEMA
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mt-4 mb-4 uppercase italic">
                  IMMERSE IN STORYTELLING
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                  Welcome to an high-fidelity offline screening room. Define your storytelling pace, genres, desired vibes, languages, and contentexclusions to design a tailored intelligence profile.
                </p>
              </div>

              <button
                id="main_generate_cta_btn"
                onClick={generateRecommendations}
                disabled={isLoading}
                className="group relative px-8 py-4 bg-white hover:scale-105 text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl shadow-black/85 transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-40 shrink-0 flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-black" />
                Stream Suggestions
              </button>
            </div>
          </div>

          {/* Action Loader state overlay overlay */}
          {isLoading && (
            <div className="mb-10 bg-black/45 border border-indigo-500/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center animate-pulse shadow-2xl backdrop-blur-3xl">
              <div className="w-14 h-14 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-purple-500/30 animate-spin flex items-center justify-center mb-5">
                <Film className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xs font-black tracking-[0.2em] text-white uppercase font-sans text-glow-indigo">{loadingStage}</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
                Synthesizing metadata, checking era bounds, and prompting our server-side cinematic models. This can take several moments.
              </p>
            </div>
          )}

          {/* Error notification */}
          {errorStatus && (
            <div className="mb-10 bg-red-950/20 border border-red-900/40 rounded-3xl p-6 flex items-start gap-4 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-red-300 uppercase tracking-widest text-[11px]">Recommender Processing Error</h4>
                <p className="text-red-400/90 mt-1">{errorStatus}</p>
                <button 
                  onClick={generateRecommendations}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-950/40 border border-red-900 text-red-300 rounded-xl hover:bg-red-950/70 transition font-mono font-bold uppercase tracking-wider text-[10px]"
                >
                  <RefreshCw className="w-3. h-3" /> Retry Generation
                </button>
              </div>
            </div>
          )}

          {/* Side-by-side wide layout split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Config Panel (Watch History & Preferences) */}
            <div className="lg:col-span-5 space-y-10">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Configure Aesthetic</span>
                <span className="w-10 border-b border-indigo-500/40" />
              </div>
              
              {/* Preferences widget */}
              <PreferenceSelector 
                preferences={preferences}
                onUpdatePreferences={updatePreferencesHandler}
              />

              {/* Watch history archive list */}
              <WatchHistory 
                watchHistory={watchHistory}
                onAddMovie={addMovieHandler}
                onRemoveMovie={removeMovieHandler}
              />
            </div>

            {/* Right Column: Dynamic Screenings Console */}
            <div className="lg:col-span-7 space-y-8">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between" id="recommendations_header">
                <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-[0.3em]">Screening Room</span>
                <span className="w-24 border-b border-fuchsia-500/40" />
              </div>

              {recommendations.length > 0 ? (
                <RecommendationResults 
                  recommendations={recommendations}
                  onMarkAsWatched={markAsWatchedHandler}
                  onExcludeMovie={excludeMovieHandler}
                />
              ) : (
                <div className="bg-white/5 border border-dashed border-white/15 rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
                  <div className="w-16 h-16 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center text-gray-400 mb-6 relative">
                    <Film className="w-7 h-7" />
                    <Sparkles className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Recommendation queue is empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                    Select your favorite genres, toggle pacing options, and list 2 or more of your watched films in the left controls. Then generate new choices.
                  </p>

                  <button
                    type="button"
                    onClick={generateRecommendations}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white hover:scale-105 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all focus:outline-none cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Populate Queue
                  </button>
                </div>
              )}
            </div>

          </div>

        </main>

        {/* Footer credits and information */}
        <footer className="border-t border-white/5 mt-16 bg-black/40 py-10">
          <div className="w-full px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-gray-600 tracking-[0.2em] uppercase font-bold text-center">
            <div className="flex gap-10">
              <span className="text-indigo-500/80">Engine: Neural-Rec v4.0</span>
              <span>User: julian_v01</span>
              <span>Last Sync: Just now</span>
            </div>
            <div className="flex gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer">Contact Lab</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
