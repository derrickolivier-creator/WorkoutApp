import { useState, useCallback, useMemo } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ENCOURAGEMENT = [
  "Way to go, legend! 🔥",
  "Crushed it! Keep that momentum! 💪",
  "You're building something great!",
  "Beast mode: ACTIVATED! 🚀",
  "Another one in the books! 📚",
  "That's what champions do! 🏆",
  "Stronger every single day! ⚡",
  "Absolutely SMASHED that session! 💥",
  "You showed up. That's everything. 🙌",
];

const DEFAULT_EXERCISES = [
  { id: 1, name: 'Goblet Squats',  sets: 3, reps: 10, weight: 12, bodyweight: false, isTime: false },
  { id: 2, name: 'Push-Ups',       sets: 3, reps: 10, weight: 0,  bodyweight: true,  isTime: false },
  { id: 3, name: 'Dumbbell Rows',  sets: 3, reps: 10, weight: 10, bodyweight: false, isTime: false },
  { id: 4, name: 'Glute Bridges',  sets: 3, reps: 12, weight: 14, bodyweight: false, isTime: false },
  { id: 5, name: 'Plank',          sets: 3, reps: 45, weight: 0,  bodyweight: true,  isTime: true  },
  { id: 6, name: 'Shoulder Press', sets: 3, reps: 10, weight: 8,  bodyweight: false, isTime: false, location: 'Home' },
];

const BONUS_ACTIVITIES = [
  { id: 'Walk', emoji: '🚶', label: 'Walk' },
  { id: 'Swim', emoji: '🏊', label: 'Swim' },
  { id: 'Yoga', emoji: '🧘', label: 'Yoga' },
];

const DAY_NAMES  = ['Monday', 'Wednesday', 'Friday'];
const DAY_SHORT  = ['Mon', 'Wed', 'Fri'];
const WEEK_BADGE = { 1: '🥉', 2: '🥈', 3: '🥇', 4: '🏆' };

const PTS_WORKOUT      = 100;
const PTS_BONUS        = 50;
const PTS_PERFECT_WEEK = 200;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSessions() {
  const out = {};
  for (let w = 1; w <= 4; w++) {
    out[w] = {};
    for (let d = 0; d < 3; d++) {
      out[w][d] = {
        completed:     false,
        completedAt:   null,
        bonusActivity: null,
        exercises:     DEFAULT_EXERCISES.map(ex => ({ ...ex })),
        ptsEarned:     0,
      };
    }
  }
  return out;
}

const randomMsg = () => ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)];

const weekCompletedCount = (sessions, week) =>
  [0, 1, 2].filter(d => sessions[week][d].completed).length;

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ label, value, onChange, min = 0, step = 1, unit }) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(+(value + step).toFixed(2));

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <span className="text-[10px] text-gray-400 uppercase tracking-widest truncate">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={dec}
          className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 active:scale-90 text-white text-base font-bold flex items-center justify-center transition-all shrink-0"
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= min) onChange(v);
          }}
          className="w-12 text-center bg-gray-900 text-white rounded-lg py-1 text-sm font-bold border border-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <button
          onClick={inc}
          className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-400 active:scale-90 text-white text-base font-bold flex items-center justify-center transition-all shrink-0"
        >
          +
        </button>
      </div>
      {unit && <span className="text-[10px] text-gray-500">{unit}</span>}
    </div>
  );
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, onChange, locked }) {
  const set = (field, val) => onChange({ ...exercise, [field]: val });

  return (
    <div className={`bg-gray-800 rounded-2xl p-4 border transition-all ${locked ? 'border-gray-700 opacity-70' : 'border-gray-700 hover:border-gray-600'}`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight">{exercise.name}</h3>
          {exercise.location !== undefined && (
            <button
              onClick={() => !locked && set('location', exercise.location === 'Home' ? 'Gym' : 'Home')}
              disabled={locked}
              className={`mt-1 text-[11px] px-2 py-0.5 rounded-full border font-medium transition-all disabled:cursor-default ${
                exercise.location === 'Gym'
                  ? 'bg-purple-900/60 border-purple-600 text-purple-300'
                  : 'bg-blue-900/60 border-blue-600 text-blue-300'
              }`}
            >
              {exercise.location === 'Gym' ? '🏋️ Gym' : '🏠 Home'}
            </button>
          )}
        </div>
        {exercise.bodyweight && (
          <span className="shrink-0 text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
            Bodyweight
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stepper
          label="Sets" value={exercise.sets} min={1} step={1} unit="sets"
          onChange={v => !locked && set('sets', v)}
        />
        <Stepper
          label={exercise.isTime ? 'Seconds' : 'Reps'}
          value={exercise.reps} min={1} step={exercise.isTime ? 5 : 1}
          unit={exercise.isTime ? 'sec' : 'reps'}
          onChange={v => !locked && set('reps', v)}
        />
        {exercise.bodyweight ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Weight</span>
            <div className="h-9 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-semibold">BW</span>
            </div>
          </div>
        ) : (
          <Stepper
            label="Weight" value={exercise.weight} min={0} step={1} unit="kg"
            onChange={v => !locked && set('weight', v)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Celebration Overlay ──────────────────────────────────────────────────────

function CelebrationOverlay({ message, onDismiss }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6"
      onClick={onDismiss}
    >
      <div
        className="bg-gray-900 border-2 border-orange-500 rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full"
        style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-3 animate-bounce">🎉</div>
        <p className="text-white text-xl font-black mb-2 leading-snug">{message}</p>
        <p className="text-gray-400 text-sm mb-6">Session logged successfully</p>
        <button
          onClick={onDismiss}
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-black py-3 px-8 rounded-xl w-full transition-all"
        >
          Keep going! 💪
        </button>
      </div>
    </div>
  );
}

// ─── Week Badge ───────────────────────────────────────────────────────────────

function Badge({ week, earned }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
      earned
        ? 'bg-yellow-900/30 border-yellow-600 shadow-sm shadow-yellow-900'
        : 'bg-gray-800 border-gray-700 opacity-50'
    }`}>
      <span className="text-3xl">{earned ? WEEK_BADGE[week] : '🔒'}</span>
      <span className={`text-xs font-bold ${earned ? 'text-yellow-400' : 'text-gray-500'}`}>
        Wk {week}
      </span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function WorkoutApp() {
  const [view, setView]               = useState('workout');
  const [activeWeek, setActiveWeek]   = useState(1);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [sessions, setSessions]       = useState(buildSessions);
  const [totalPts, setTotalPts]       = useState(0);
  const [badges, setBadges]           = useState({ 1: false, 2: false, 3: false, 4: false });
  const [celebration, setCelebration] = useState(null);

  const session = sessions[activeWeek][activeDayIdx];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateExercise = useCallback((idx, updated) => {
    setSessions(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [activeDayIdx]: {
          ...prev[activeWeek][activeDayIdx],
          exercises: prev[activeWeek][activeDayIdx].exercises.map((ex, i) =>
            i === idx ? updated : ex
          ),
        },
      },
    }));
  }, [activeWeek, activeDayIdx]);

  const toggleBonus = useCallback((activity) => {
    setSessions(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [activeDayIdx]: {
          ...prev[activeWeek][activeDayIdx],
          bonusActivity: prev[activeWeek][activeDayIdx].bonusActivity === activity ? null : activity,
        },
      },
    }));
  }, [activeWeek, activeDayIdx]);

  const completeWorkout = useCallback(() => {
    if (session.completed) return;

    const bonusPts     = session.bonusActivity ? PTS_BONUS : 0;
    const workoutPts   = PTS_WORKOUT + bonusPts;
    const alreadyDone  = [0, 1, 2].filter(d => d !== activeDayIdx && sessions[activeWeek][d].completed).length;
    const isPerfect    = alreadyDone === 2; // this completion makes 3/3
    const earned       = workoutPts + (isPerfect ? PTS_PERFECT_WEEK : 0);

    setSessions(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [activeDayIdx]: {
          ...prev[activeWeek][activeDayIdx],
          completed:   true,
          completedAt: new Date().toISOString(),
          ptsEarned:   workoutPts,
        },
      },
    }));

    if (isPerfect) setBadges(b => ({ ...b, [activeWeek]: true }));
    setTotalPts(p => p + earned);
    setCelebration(randomMsg());
  }, [session, sessions, activeWeek, activeDayIdx]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const weekStats = useMemo(() =>
    [1, 2, 3, 4].map(w => ({
      week:      w,
      completed: weekCompletedCount(sessions, w),
      pts:       [0, 1, 2].reduce((s, d) => s + sessions[w][d].ptsEarned, 0),
      badge:     badges[w],
    })),
  [sessions, badges]);

  const thisWeekDone = weekCompletedCount(sessions, activeWeek);
  const totalSessions = [1, 2, 3, 4].reduce((s, w) => s + weekCompletedCount(sessions, w), 0);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {celebration && (
        <CelebrationOverlay message={celebration} onDismiss={() => setCelebration(null)} />
      )}

      {/* ── Header ── */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-orange-500">GAINZ</span>
            </h1>
            <p className="text-[11px] text-gray-500 -mt-0.5 tracking-wide">4-Week Strength Program</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
            <span className="text-yellow-400">⚡</span>
            <span className="text-white font-black text-lg tabular-nums">{totalPts.toLocaleString()}</span>
            <span className="text-gray-400 text-xs font-medium">pts</span>
          </div>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-[61px] z-30">
        <div className="max-w-lg mx-auto px-4 flex">
          {[
            { id: 'workout',  icon: '🏋️', label: 'Workout'  },
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'history',  icon: '📋', label: 'History'  },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-all ${
                view === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pb-10">

        {/* ════════════════════ WORKOUT VIEW ════════════════════ */}
        {view === 'workout' && (
          <div className="pt-5 space-y-4">

            {/* Week picker */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Week</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(w => {
                  const done = weekCompletedCount(sessions, w);
                  return (
                    <button
                      key={w}
                      onClick={() => { setActiveWeek(w); setActiveDayIdx(0); }}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all relative ${
                        activeWeek === w
                          ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-900/30'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      Week {w}
                      {badges[w] && (
                        <span className="absolute -top-1.5 -right-1.5 text-xs leading-none">
                          {WEEK_BADGE[w]}
                        </span>
                      )}
                      {done > 0 && !badges[w] && (
                        <span className="block text-[9px] font-normal mt-0.5 opacity-70">
                          {done}/3
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day picker */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Day</p>
              <div className="grid grid-cols-3 gap-2">
                {DAY_NAMES.map((name, idx) => {
                  const s = sessions[activeWeek][idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIdx(idx)}
                      className={`py-3 rounded-xl text-sm font-bold border relative transition-all ${
                        activeDayIdx === idx
                          ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-900/30'
                          : s.completed
                          ? 'bg-green-900/40 border-green-700 text-green-300'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {DAY_SHORT[idx]}
                      {s.completed && (
                        <span className="absolute -top-1.5 -right-1.5 text-xs">✅</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session banner */}
            <div className={`rounded-2xl p-4 border ${
              session.completed
                ? 'bg-green-900/25 border-green-700'
                : 'bg-gray-800/60 border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-base">
                    Week {activeWeek} · {DAY_NAMES[activeDayIdx]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {session.completed
                      ? `Logged! +${session.ptsEarned} pts earned`
                      : `6 exercises · Complete for +${PTS_WORKOUT} pts`}
                  </p>
                </div>
                {session.completed
                  ? <span className="text-3xl">✅</span>
                  : <span className="text-2xl">🏋️</span>
                }
              </div>
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              {session.exercises.map((ex, idx) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  locked={session.completed}
                  onChange={updated => updateExercise(idx, updated)}
                />
              ))}
            </div>

            {/* Bonus activity */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌟</span>
                <div>
                  <p className="text-white text-sm font-bold">Bonus Activity</p>
                  <p className="text-[11px] text-gray-400">Extra movement = +{PTS_BONUS} pts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BONUS_ACTIVITIES.map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    disabled={session.completed}
                    onClick={() => toggleBonus(id)}
                    className={`py-3 rounded-xl text-sm font-semibold border flex flex-col items-center gap-0.5 transition-all disabled:cursor-default ${
                      session.bonusActivity === id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500 disabled:opacity-60'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            {!session.completed ? (
              <button
                onClick={completeWorkout}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-900/40 transition-all"
              >
                Complete Workout 🔥
              </button>
            ) : (
              <div className="w-full py-4 bg-green-800/60 border border-green-700 text-green-300 font-black text-lg rounded-2xl text-center">
                Session Complete! 🏆
              </div>
            )}

            {/* Week progress bar */}
            <div className="bg-gray-800/60 rounded-2xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-300">Week {activeWeek} Progress</p>
                <p className="text-xs text-orange-400 font-bold">{thisWeekDone} / 3 sessions</p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map(d => (
                  <div key={d} className="flex-1">
                    <div className={`h-2 rounded-full mb-1 transition-all ${
                      sessions[activeWeek][d].completed ? 'bg-orange-500' : 'bg-gray-700'
                    }`} />
                    <p className="text-center text-[10px] text-gray-500">{DAY_SHORT[d]}</p>
                  </div>
                ))}
              </div>
              {thisWeekDone === 3 && (
                <p className="text-center text-yellow-400 text-xs font-bold mt-2">
                  {WEEK_BADGE[activeWeek]} Perfect week! +{PTS_PERFECT_WEEK} bonus pts awarded
                </p>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ OVERVIEW VIEW ════════════════════ */}
        {view === 'overview' && (
          <div className="pt-5 space-y-6">

            {/* Points hero */}
            <div className="rounded-2xl p-5 border border-orange-800/60 bg-gradient-to-br from-orange-950/60 via-gray-900 to-gray-900">
              <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-1">Total Points</p>
              <p className="text-5xl font-black text-white tabular-nums">{totalPts.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">{totalSessions} session{totalSessions !== 1 ? 's' : ''} completed across all weeks</p>
            </div>

            {/* Badges */}
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Perfect Week Badges</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(w => (
                  <Badge key={w} week={w} earned={badges[w]} />
                ))}
              </div>
              <p className="text-[11px] text-gray-600 text-center mt-2">
                Complete all 3 sessions in a week · +{PTS_PERFECT_WEEK} pts each
              </p>
            </div>

            {/* Weekly cards */}
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Weekly Summary</p>
              <div className="space-y-3">
                {weekStats.map(({ week, completed, pts, badge }) => (
                  <div key={week} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white">Week {week}</span>
                        {badge && <span className="text-base">{WEEK_BADGE[week]}</span>}
                      </div>
                      <span className="text-orange-400 font-bold text-sm">
                        {pts > 0 ? `+${pts.toLocaleString()} pts` : '—'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[0, 1, 2].map(d => {
                        const s = sessions[week][d];
                        return (
                          <div
                            key={d}
                            className={`rounded-xl py-2 text-center text-xs font-semibold ${
                              s.completed
                                ? 'bg-green-800/50 text-green-300 border border-green-700'
                                : 'bg-gray-700 text-gray-500 border border-gray-600'
                            }`}
                          >
                            <div>{DAY_SHORT[d]}</div>
                            {s.bonusActivity && (
                              <div className="text-[10px] text-blue-400 mt-0.5">
                                {BONUS_ACTIVITIES.find(a => a.id === s.bonusActivity)?.emoji}
                                {' '}{s.bonusActivity}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(completed / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{completed}/3</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points guide */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">Points Guide</p>
              <div className="space-y-2.5">
                {[
                  { icon: '🏋️', label: 'Complete a workout session', pts: PTS_WORKOUT      },
                  { icon: '🌟', label: 'Log a bonus activity',        pts: PTS_BONUS        },
                  { icon: '🏆', label: 'Perfect week (3/3 sessions)', pts: PTS_PERFECT_WEEK },
                ].map(({ icon, label, pts }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-sm text-gray-300">{label}</span>
                    </div>
                    <span className="text-orange-400 font-bold text-sm shrink-0">+{pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ HISTORY VIEW ════════════════════ */}
        {view === 'history' && (
          <div className="pt-5 space-y-6">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Session History</p>

            {totalSessions === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏋️</div>
                <p className="text-gray-300 font-bold">No sessions yet</p>
                <p className="text-gray-600 text-sm mt-1">Complete your first workout to see it here!</p>
              </div>
            ) : (
              [1, 2, 3, 4].map(week => {
                const doneDays = [0, 1, 2].filter(d => sessions[week][d].completed);
                if (doneDays.length === 0) return null;
                return (
                  <div key={week}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest">
                        Week {week}
                      </span>
                      {badges[week] && (
                        <span className="text-sm">{WEEK_BADGE[week]} Perfect Week</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {doneDays.map(dayIdx => {
                        const s = sessions[week][dayIdx];
                        return (
                          <div key={dayIdx} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-bold text-white">{DAY_NAMES[dayIdx]}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {s.bonusActivity && (
                                    <span className="text-blue-400 mr-2">
                                      {BONUS_ACTIVITIES.find(a => a.id === s.bonusActivity)?.emoji}
                                      {' '}{s.bonusActivity} ·
                                    </span>
                                  )}
                                  +{s.ptsEarned} pts
                                </p>
                              </div>
                              <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-800 px-2 py-1 rounded-lg shrink-0">
                                Done ✓
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {s.exercises.map(ex => (
                                <div
                                  key={ex.id}
                                  className="bg-gray-700/50 rounded-xl px-3 py-2"
                                >
                                  <p className="text-xs font-semibold text-gray-200 truncate">
                                    {ex.name}
                                    {ex.location !== undefined && (
                                      <span className="ml-1 text-gray-500 font-normal">
                                        ({ex.location})
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {ex.sets}×{ex.reps}{ex.isTime ? 's' : ''}
                                    {!ex.bodyweight ? ` · ${ex.weight}kg` : ' · BW'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
