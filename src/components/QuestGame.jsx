import { useEffect, useRef, useState } from "react";

const UNITY_ROOT = ""; // put your Unity folder in: public/Quest/...

export default function QuestGame({ fruitCount,resetFruits }) {
  const canvasRef = useRef(null);
  const unityInstanceRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadUnity = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Reuse loader script if already added
      const loaderSrc = `${UNITY_ROOT}/Build/quest.loader.js`;
      let script = document.querySelector(`script[src="${loaderSrc}"]`);

      if (!script) {
        script = document.createElement("script");
        script.src = loaderSrc;
        script.async = true;
        document.body.appendChild(script);
      }

      await new Promise((resolve, reject) => {
        if (script.dataset.loaded === "true") return resolve();
        script.addEventListener("load", () => {
          script.dataset.loaded = "true";
          resolve();
        });
        script.addEventListener("error", reject);
      });

      if (cancelled) return;

      if (!window.createUnityInstance) {
        console.error("createUnityInstance not found. Loader script may not have loaded.");
        return;
      }

      try {
        const instance = await window.createUnityInstance(canvas, {
          dataUrl: `${UNITY_ROOT}/Build/quest.data`,
          frameworkUrl: `${UNITY_ROOT}/Build/quest.framework.js`,
          codeUrl: `${UNITY_ROOT}/Build/quest.wasm`,
          streamingAssetsUrl: `${UNITY_ROOT}/StreamingAssets`,
          companyName: "DefaultCompany",
          productName: "Adventure Time",
          productVersion: "1.0",

          // KEY: prevents cropping by matching render size to the canvas size
          matchWebGLToCanvasSize: true,

        
          
        });

        if (cancelled) {
          // If unmounted before load finishes, quit immediately
          await instance.Quit();
          return;
        }

        unityInstanceRef.current = instance;
        setIsLoaded(true);
      } catch (e) {
        console.error("Unity initialization error:", e);
      }
    };

    loadUnity();

    return () => {
      cancelled = true;
      setIsLoaded(false);

      const instance = unityInstanceRef.current;
      unityInstanceRef.current = null;

      if (instance) {
        // Quit is async; don't block unmount
        instance.Quit().catch(() => {});
      }
    };
  }, []);

    useEffect(() => {
    const instance = unityInstanceRef.current;
    if (!isLoaded || !instance) return;
    if(fruitCount>0){
      instance.SendMessage("Bridge", "SetFruitCount", String(fruitCount));
      resetFruits?.();
    }
  }, [fruitCount, isLoaded]);

  const handleFullscreen = () => {
    unityInstanceRef.current?.SetFullscreen(1);
  };

  return (
    <div className="quest-game-container">
      <button
        onClick={handleFullscreen}
        className="fullscreen-icon-btn"
        disabled={!isLoaded}
        title={!isLoaded ? "Loading..." : "Fullscreen"}
      >
        ⛶
      </button>
      <div className="quest-game-frame">
        <canvas ref={canvasRef} className="unity-canvas"/>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div className="quest-controls">
        <div className="quest-instructions">
          <div className="instruction-line">
            <span>Move: </span>
            <span className="arrow-keys">
              <span className="arrow">↑</span>
              <span className="arrow">↓</span>
              <span className="arrow">←</span>
              <span className="arrow">→</span>
            </span>
          </div>
          <div className="instruction-line">Pause: P</div>
          <div className="instruction-line">Exit fullscreen: ESC</div>
        </div>
      </div>
    </div>
  );
}
