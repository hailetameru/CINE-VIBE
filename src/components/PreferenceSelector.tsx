import React, { useState } from 'react';
import { 
  PRESET_GENRES, 
  PRESET_MOODS, 
  PRESET_ERAS, 
  UserPreferences 
} from '../types';
import { Film, Sparkles, HeartCrack, Hourglass, Calendar, Languages } from 'lucide-react';

interface PreferenceSelectorProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export default function PreferenceSelector({ 
  preferences, 
  onUpdatePreferences 
}: PreferenceSelectorProps) {
  const [newExclusion, setNewExclusion] = useState("");

  const toggleGenre = (genre: string) => {
    const genres = preferences.genres.includes(genre)
      ? preferences.genres.filter(g => g !== genre)
      : [...preferences.genres, genre];
    onUpdatePreferences({ ...preferences, genres });
  };

  const toggleMood = (mood: string) => {
    const moods = preferences.moods.includes(mood)
      ? preferences.moods.filter(m => m !== mood)
      : [...preferences.moods, mood];
    onUpdatePreferences({ ...preferences, moods });
  };

  const toggleEra = (era: string) => {
    const eras = preferences.eras.includes(era)
      ? preferences.eras.filter(e => e !== era)
      : [...preferences.eras, era];
    onUpdatePreferences({ ...preferences, eras });
  };

  const setPace = (pace: UserPreferences['pace']) => {
    onUpdatePreferences({ ...preferences, pace });
  };

  const addExclusion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExclusion.trim() && !preferences.exclusions.some(item => item.toLowerCase() === newExclusion.trim().toLowerCase())) {
      onUpdatePreferences({
        ...preferences,
        exclusions: [...preferences.exclusions, newExclusion.trim()]
      });
      setNewExclusion("");
    }
  };

  const removeExclusion = (index: number) => {
    const exclusions = preferences.exclusions.filter((_, i) => i !== index);
    onUpdatePreferences({ ...preferences, exclusions });
  };

  const toggleLanguage = (lang: string) => {
    const languages = preferences.languages.includes(lang)
      ? preferences.languages.filter(l => l !== lang)
      : [...preferences.languages, lang];
    onUpdatePreferences({ ...preferences, languages });
  };

  return (
    <div className="space-y-8" id="preference_selector_panel">
      {/* 1. Genres */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
          <Film className="w-5 h-5 text-indigo-400" />
          Favorite Genres
          <span className="text-xs font-normal text-gray-500 font-mono ml-auto">
            {preferences.genres.length} Selected
          </span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Select the kinds of stories you usually seek out or feel like watching.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_GENRES.map(genre => {
            const isSelected = preferences.genres.includes(genre);
            return (
              <button
                key={genre}
                id={`genre_btn_${genre.toLowerCase().replace(/\s+/g, '_')}`}
                onClick={() => toggleGenre(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                    : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cinema Mood & Experience */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
          <Sparkles className="w-5 h-5 text-fuchsia-400" />
          Desired Experience & Vibe
          <span className="text-xs font-normal text-gray-500 font-mono ml-auto">
            {preferences.moods.length} Selected
          </span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Define the physical or emotional impact you want from the cinema.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_MOODS.map(mood => {
            const isSelected = preferences.moods.includes(mood);
            return (
              <button
                key={mood}
                id={`mood_btn_${mood.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                onClick={() => toggleMood(mood)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                    : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Movie Era & Decades */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-white">
            <Calendar className="w-4 h-4 text-rose-400" />
            Story Eras
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Choose your preferred periods of cinematic history.
          </p>
          <div className="space-y-2">
            {PRESET_ERAS.map(era => {
              const isSelected = preferences.eras.includes(era);
              return (
                <button
                  key={era}
                  id={`era_${era.replace(/[^a-zA-Z0-9]/g, '_')}`}
                  onClick={() => toggleEra(era)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/40 shadow-sm' 
                      : 'bg-slate-950/30 text-slate-400 border-slate-800/60 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{era}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Pace & Flow */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-white">
              <Hourglass className="w-4 h-4 text-cyan-400" />
              Storytelling Pace
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select the speed and build-up frequency of the screenplay.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['any', 'fast-paced', 'slow-burn', 'balanced'] as const).map(option => {
                const label = option === 'any' ? 'Any Pace' : option === 'fast-paced' ? 'Fast-Paced' : option === 'slow-burn' ? 'Slow Burn' : 'Balanced';
                const isSelected = preferences.pace === option;
                return (
                  <button
                    key={option}
                    id={`pace_option_${option}`}
                    onClick={() => setPace(option)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold capitalize border text-center transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm' 
                        : 'bg-slate-950/30 text-slate-400 border-slate-800/60 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Languages selection */}
          <div className="mt-5 pt-5 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              Language Context
            </h4>
            <div className="flex gap-2">
              {["English Only", "Foreign / Subtitled"].map(lang => {
                const isSelected = preferences.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border text-center transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
                        : 'bg-slate-950/30 text-slate-500 border-slate-800/60 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Custom Exclusions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
          <HeartCrack className="w-5 h-5 text-red-500" />
          Content Exclusions
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Avoid specific triggers, tropes, or subjects (e.g. "extreme gore", "tragic ending", "heavy violence", "jump scares").
        </p>

        <form onSubmit={addExclusion} className="flex gap-2 mb-4">
          <input
            type="text"
            id="exclusion_input_field"
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
            placeholder="No jump scares, no sad endings..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
          />
          <button
            type="submit"
            id="add_exclusion_btn"
            className="px-4 py-2.5 bg-white/10 border border-white/10 text-xs font-bold text-gray-200 rounded-xl hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          >
            Exclude
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {preferences.exclusions.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No exclusions set. Recommendations will have no filters.</p>
          ) : (
            preferences.exclusions.map((exclusion, idx) => (
              <span 
                key={exclusion} 
                className="inline-flex items-center gap-1.5 bg-red-950/40 border border-red-900/40 text-red-400 px-2.5 py-1 rounded-full text-xs font-medium"
              >
                {exclusion}
                <button 
                  type="button" 
                  onClick={() => removeExclusion(idx)}
                  className="hover:text-red-200 cursor-pointer w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-900/30 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
