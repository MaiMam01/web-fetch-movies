/**
 * Hero3DBackdrop
 * Pure CSS-3D decorative shapes rendered with `transform-style: preserve-3d`
 * and CSS keyframe rotations. Zero JS runtime cost; respects `prefers-reduced-motion`.
 */
export default function Hero3DBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* 3D wireframe cube */}
      <div className="absolute right-[18%] top-[12%] hidden lg:block">
        <div className="hero3d-cube">
          {["front", "back", "right", "left", "top", "bottom"].map((face) => (
            <div key={face} className={`cube-face cube-${face}`} />
          ))}
        </div>
      </div>

      {/* 3D wireframe ring (torus made of stacked circles) */}
      <div className="absolute left-[6%] bottom-[15%] hidden md:block">
        <div className="hero3d-ring">
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <span
              key={deg}
              className="ring-band"
              style={{ transform: `rotateY(${deg}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Diamond / octahedron floating top-left */}
      <div className="absolute left-[14%] top-[10%] hidden md:block">
        <div className="hero3d-diamond">
          <span className="diamond-face top" />
          <span className="diamond-face bottom" />
        </div>
      </div>

      {/* Floor grid receding into the distance (synthwave style) */}
      <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-48">
        <div className="hero3d-grid" />
      </div>

      <style>{`
        @keyframes spinXY {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        @keyframes spinY {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes spinXZ {
          0% { transform: rotateX(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateZ(360deg); }
        }

        .hero3d-cube {
          position: relative;
          width: 110px;
          height: 110px;
          transform-style: preserve-3d;
          animation: spinXY 22s linear infinite;
          filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.45));
        }
        .cube-face {
          position: absolute;
          inset: 0;
          border: 1.5px solid rgba(168, 85, 247, 0.55);
          background: linear-gradient(
            135deg,
            rgba(232, 121, 249, 0.04),
            rgba(34, 211, 238, 0.04)
          );
        }
        .cube-front  { transform: translateZ(55px); }
        .cube-back   { transform: rotateY(180deg) translateZ(55px); border-color: rgba(34, 211, 238, 0.55); }
        .cube-right  { transform: rotateY( 90deg) translateZ(55px); border-color: rgba(232, 121, 249, 0.55); }
        .cube-left   { transform: rotateY(-90deg) translateZ(55px); border-color: rgba(232, 121, 249, 0.55); }
        .cube-top    { transform: rotateX( 90deg) translateZ(55px); border-color: rgba(163, 230, 53, 0.45); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(55px); border-color: rgba(251, 191, 36, 0.45); }

        .hero3d-ring {
          position: relative;
          width: 130px;
          height: 130px;
          transform-style: preserve-3d;
          animation: spinY 18s linear infinite;
          filter: drop-shadow(0 0 22px rgba(34, 211, 238, 0.4));
        }
        .ring-band {
          position: absolute;
          inset: 0;
          border: 1.5px solid rgba(34, 211, 238, 0.45);
          border-radius: 50%;
          background: transparent;
        }

        .hero3d-diamond {
          position: relative;
          width: 90px;
          height: 90px;
          transform-style: preserve-3d;
          animation: spinXZ 28s linear infinite;
          filter: drop-shadow(0 0 18px rgba(232, 121, 249, 0.5));
        }
        .diamond-face {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border: 45px solid transparent;
          transform: translate(-50%, -50%);
        }
        .diamond-face.top    { border-bottom-color: rgba(232, 121, 249, 0.55); margin-top: -22px; }
        .diamond-face.bottom { border-top-color:    rgba(168, 85, 247, 0.55);  margin-top:  22px; }

        .hero3d-grid {
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(to right, rgba(232, 121, 249, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.18) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: perspective(600px) rotateX(60deg) translateY(20%);
          transform-origin: bottom center;
          mask-image: linear-gradient(to top, black 0%, transparent 85%);
          -webkit-mask-image: linear-gradient(to top, black 0%, transparent 85%);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero3d-cube,
          .hero3d-ring,
          .hero3d-diamond {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
