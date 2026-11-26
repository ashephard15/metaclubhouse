import { useEffect, useRef } from 'react';
import { Engine, type GameState } from '../game/Engine';

interface Props {
  onReady: (engine: Engine) => void;
  onState: (s: GameState) => void;
}

/** Mounts the Three.js + WebXR engine and moves the VR button into the HUD slot. */
export default function VRSceneCanvas({ onReady, onState }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const engine = new Engine(ref.current);
    const slot = document.getElementById('vr-button-slot');
    if (slot) {
      engine.vrButton.removeAttribute('style');
      engine.vrButton.className = 'vr-button';
      slot.appendChild(engine.vrButton);
    }
    const unsub = engine.subscribe(onState);
    onReady(engine);
    return () => {
      unsub();
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="absolute inset-0" />;
}
