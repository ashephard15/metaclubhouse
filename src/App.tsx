import { useRef, useState } from 'react';
import { Compass, Gamepad2, MousePointerClick, RotateCcw, Trophy } from 'lucide-react';
import VRSceneCanvas from './components/VRSceneCanvas';
import type { Engine, GameState } from './game/Engine';
import { ARTIFACTS, ZONES, artifactsInZone, type ZoneId } from './data/artifacts';

export default function App() {
  const engineRef = useRef<Engine | null>(null);
  const [maybeState, setState] = useState<GameState | null>(null);
  const state: GameState = maybeState ?? { zone: 'treehouse', discovered: [], inXR: false, inspecting: null };
  const [showHelp, setShowHelp] = useState(true);

  const found = state.discovered.length;
  const total = ARTIFACTS.length;
  const complete = found === total;

  return (
    <div className="relative h-full w-full">
      <VRSceneCanvas onReady={(e) => (engineRef.current = e)} onState={setState} />

      {/* HUD stays mounted (it hosts the VR button) but is hidden while in the headset */}
      <div style={{ display: !maybeState || state.inXR ? 'none' : undefined }}>
          {/* Top bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
            <div className="pointer-events-auto rounded-2xl bg-stone-950/75 px-5 py-3 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Compass size={14} /> Time Explorers VR
              </div>
              <div className="text-xl font-bold">{ZONES[state.zone].name}</div>
              <div className="text-sm text-amber-100/70">{ZONES[state.zone].subtitle}</div>
            </div>

            <div className="pointer-events-auto rounded-2xl bg-stone-950/75 px-5 py-3 text-right shadow-xl backdrop-blur">
              <div className="flex items-center justify-end gap-2 text-sm font-semibold text-amber-300">
                <Trophy size={16} /> {found} / {total} artifacts
              </div>
              <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-stone-700">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all" style={{ width: `${(found / total) * 100}%` }} />
              </div>
              <div className="mt-2 flex justify-end gap-1">
                {(Object.keys(ZONES) as ZoneId[]).map((z) => {
                  const n = artifactsInZone(z).filter((a) => state.discovered.includes(a.id)).length;
                  return (
                    <button
                      key={z}
                      onClick={() => engineRef.current?.travelTo(z)}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${z === state.zone ? 'bg-amber-600 text-white' : 'bg-stone-800 text-amber-100 hover:bg-stone-700'}`}
                      title={`Travel to ${ZONES[z].name}`}
                    >
                      {ZONES[z].name.split(' ').slice(0, 2).join(' ')} · {n}/4
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {complete && (
            <div className="pointer-events-none absolute inset-x-0 top-28 flex justify-center">
              <div className="rounded-2xl bg-emerald-700/90 px-6 py-3 text-lg font-bold shadow-xl">
                🎉 Master Time Explorer! You collected every artifact.
              </div>
            </div>
          )}

          {/* Bottom: VR button + help */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4">
            {showHelp && (
              <div className="pointer-events-auto max-w-xl rounded-2xl bg-stone-950/80 px-5 py-4 text-sm shadow-xl backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-amber-300">How to explore</span>
                  <button className="text-amber-100/60 hover:text-amber-100" onClick={() => setShowHelp(false)}>Hide</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex gap-2">
                    <MousePointerClick size={18} className="shrink-0 text-amber-400" />
                    <span><b>Desktop:</b> drag to look, WASD/arrows to walk, click glowing artifacts and portals. Esc closes a panel.</span>
                  </div>
                  <div className="flex gap-2">
                    <Gamepad2 size={18} className="shrink-0 text-amber-400" />
                    <span><b>Quest 3:</b> point + trigger to select or teleport, left stick to walk, right stick to snap-turn. Hand pinch works too.</span>
                  </div>
                </div>
              </div>
            )}
            <div className="pointer-events-auto flex items-center gap-3">
              <div id="vr-button-slot" />
              <button
                onClick={() => { if (confirm('Reset all collected artifacts?')) engineRef.current?.resetProgress(); }}
                className="flex items-center gap-1 rounded-full bg-stone-900/80 px-4 py-3 text-xs font-semibold text-amber-100/80 hover:bg-stone-800"
                title="Reset progress"
              >
                <RotateCcw size={14} /> Reset
              </button>
              {!showHelp && (
                <button onClick={() => setShowHelp(true)} className="rounded-full bg-stone-900/80 px-4 py-3 text-xs font-semibold text-amber-100/80 hover:bg-stone-800">Help</button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
