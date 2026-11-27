import { useRef, useState } from 'react';
import { Backpack, Compass, Gamepad2, MousePointerClick, RotateCcw, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import VRSceneCanvas from './components/VRSceneCanvas';
import type { Engine, GameState } from './game/Engine';
import { ARTIFACTS, ZONES, artifactsInZone, type Artifact, type ZoneId } from './data/artifacts';

const BASE = import.meta.env.BASE_URL;

function Thumb({ a }: { a: Artifact }) {
  const sources = [a.inspectImage, `cutouts/${a.cutout}`].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  if (idx >= sources.length) {
    const c = `#${a.color.toString(16).padStart(6, '0')}`;
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold" style={{ background: c }}>{a.name[0]}</div>
      </div>
    );
  }
  return <img src={`${BASE}assets/${sources[idx]}`} alt={a.name} onError={() => setIdx(idx + 1)} className="h-full w-full object-contain" />;
}

export default function App() {
  const engineRef = useRef<Engine | null>(null);
  const [maybeState, setState] = useState<GameState | null>(null);
  const state: GameState = maybeState ?? { zone: 'treehouse', discovered: [], inXR: false, inspecting: null, backpackOpen: false, voiceOn: true };
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
                    <span
                      key={z}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${z === state.zone ? 'bg-amber-600 text-white' : 'bg-stone-800 text-amber-100'}`}
                    >
                      {ZONES[z].name.split(' ').slice(0, 2).join(' ')} · {n}/{artifactsInZone(z).length}
                    </span>
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

          {state.backpackOpen && (
            <div className="absolute inset-y-0 right-0 z-10 flex w-[380px] max-w-full flex-col bg-stone-950/90 p-4 shadow-2xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold text-amber-300"><Backpack size={18} /> Backpack {found}/{total}</div>
                <button onClick={() => engineRef.current?.toggleBackpack()} className="rounded-full p-1 text-amber-100/70 hover:bg-stone-800" title="Close"><X size={18} /></button>
              </div>
              <div className="grid flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto">
                {ARTIFACTS.map((a) => {
                  const has = state.discovered.includes(a.id);
                  return (
                    <div key={a.id} className={`rounded-xl p-2 text-center ${has ? 'bg-amber-900/50' : 'bg-stone-800/60'}`}>
                      <div className="mb-1 h-16 overflow-hidden rounded-lg bg-stone-900">
                        {has ? <Thumb a={a} /> : <div className="flex h-full items-center justify-center text-3xl font-bold text-stone-600">?</div>}
                      </div>
                      <div className={`text-[11px] font-semibold leading-tight ${has ? 'text-amber-50' : 'text-stone-500'}`}>{has ? a.name : ZONES[a.zone].name}</div>
                    </div>
                  );
                })}
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
                    <span><b>Desktop:</b> drag to look, WASD/arrows to walk, click glowing artifacts, signs and portals. B opens the backpack, Esc closes panels.</span>
                  </div>
                  <div className="flex gap-2">
                    <Gamepad2 size={18} className="shrink-0 text-amber-400" />
                    <span><b>Quest 3:</b> point + trigger to select or teleport, left stick to walk, right stick to snap-turn, B or Y opens the backpack. Hand pinch works too.</span>
                  </div>
                </div>
              </div>
            )}
            <div className="pointer-events-auto flex items-center gap-3">
              <div id="vr-button-slot" />
              <button
                onClick={() => engineRef.current?.toggleBackpack()}
                className={`flex items-center gap-1 rounded-full px-4 py-3 text-xs font-semibold ${state.backpackOpen ? 'bg-amber-600 text-white' : 'bg-stone-900/80 text-amber-100/80 hover:bg-stone-800'}`}
                title="Backpack (B)"
              >
                <Backpack size={14} /> Backpack {found}/{total}
              </button>
              <button
                onClick={() => engineRef.current?.toggleVoice()}
                className="flex items-center gap-1 rounded-full bg-stone-900/80 px-4 py-3 text-xs font-semibold text-amber-100/80 hover:bg-stone-800"
                title="Narrator voice on/off"
              >
                {state.voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />} Voice {state.voiceOn ? 'on' : 'off'}
              </button>
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
