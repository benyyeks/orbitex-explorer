// ORBITEX Orbit Tracker: browser-only 3D globe (three.js via react-three-fiber).
// Loaded exclusively through React.lazy behind a client-only gate in
// src/routes/tracker.tsx; never import this module from an SSR path.
//
// Coordinates: satellite geodetic lat/lon/alt come from the Kepler+J2
// propagator in src/lib/satellite.ts and are mapped onto the globe with the
// standard equirectangular-texture transform, so markers line up with the
// Earth imagery. The globe is rendered in the ECEF frame (Earth-fixed), so
// no counter-rotation is needed.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Line, Html, useTexture } from "@react-three/drei";
import { propagateSat, RE_EARTH, type TLE } from "@/lib/satellite";
import { DEG } from "@/lib/astronomy";

const EARTH_R = 2;
const KM_PER_UNIT = RE_EARTH / EARTH_R;

// Altitude compression for high-orbit regimes. MEO (20,200 km) and GEO
// (35,786 km) are so far beyond LEO that at true scale they'd sit well
// outside the default camera frame. The scale factor compresses the
// visual ring while telemetry continues to show true values.
let _altScale = 1;

function geoToScene(lat: number, lon: number, altKm: number): [number, number, number] {
  const r = EARTH_R + (altKm * _altScale) / KM_PER_UNIT;
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

// Soft round sprite for satellite points (avoids square gl.POINTS look).
function makeDotTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function Earth() {
  const textures = useTexture([
    "/textures/earth-blue-marble.jpg",
    "/textures/earth-topology.png",
  ]) as THREE.Texture[];
  const dayMap = textures[0]!;
  const bumpMap = textures[1]!;
  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = 4;
    dayMap.needsUpdate = true;
  }, [dayMap]);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_R, 72, 72]} />
        <meshStandardMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      {/* Inner haze */}
      <mesh scale={1.012}>
        <sphereGeometry args={[EARTH_R, 48, 48]} />
        <meshBasicMaterial color="#7fa8d9" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* Outer atmosphere glow, rendered inside-out */}
      <mesh scale={1.07}>
        <sphereGeometry args={[EARTH_R, 48, 48]} />
        <meshBasicMaterial
          color="#3f6fb4"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

type SatellitesProps = {
  tles: TLE[];
  color: string;
  selectedId: string | null;
  onSelect: (tle: TLE | null) => void;
  altitudeScale: number;
  pointSize: number;
};

function Satellites({ tles, color, selectedId, onSelect, altitudeScale, pointSize }: SatellitesProps) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const acc = useRef(1);
  const sprite = useMemo(() => makeDotTexture(), []);
  const positions = useMemo(() => new Float32Array(tles.length * 3), [tles]);

  // Seed positions once so the first frame is not a clump at the origin.
  useEffect(() => {
    _altScale = altitudeScale;
    const now = new Date();
    for (let i = 0; i < tles.length; i++) {
      const tle = tles[i]!;
      const s = propagateSat(tle, now);
      const [x, y, z] = geoToScene(s.lat, s.lon, s.alt);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const attr = geomRef.current?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (attr) attr.needsUpdate = true;
    geomRef.current?.computeBoundingSphere();
  }, [tles, positions, altitudeScale]);

  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < 0.25) return; // propagate at 4 Hz; LEO drift is smooth at this rate
    acc.current = 0;
    _altScale = altitudeScale;
    const now = new Date();
    for (let i = 0; i < tles.length; i++) {
      const s = propagateSat(tles[i]!, now);
      const [x, y, z] = geoToScene(s.lat, s.lon, s.alt);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const attr = geomRef.current?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (attr) attr.needsUpdate = true;
    geomRef.current?.computeBoundingSphere();
  });

  return (
    <points
      onPointerDown={(e) => {
        e.stopPropagation();
        const idx = e.index;
        onSelect(idx !== undefined ? (tles[idx] ?? null) : null);
      }}
    >
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        sizeAttenuation
        map={sprite}
        color={selectedId ? color : color}
        transparent
        alphaTest={0.35}
        depthWrite={false}
        opacity={0.95}
      />
    </points>
  );
}

function SelectedSatellite({ tle, altitudeScale }: { tle: TLE; altitudeScale: number }) {
  const markerRef = useRef<THREE.Group>(null);
  const [orbitPts, setOrbitPts] = useState<[number, number, number][]>([]);
  const [trackPts, setTrackPts] = useState<[number, number, number][]>([]);

  // Sample one full revolution for the orbit path and its ground track.
  useEffect(() => {
    _altScale = altitudeScale;
    const now = Date.now();
    const n = 180;
    const orbit: [number, number, number][] = [];
    const track: [number, number, number][] = [];
    for (let k = 0; k <= n; k++) {
      const t = new Date(now + (k / n) * tle.periodMin * 60000);
      const s = propagateSat(tle, t);
      orbit.push(geoToScene(s.lat, s.lon, s.alt));
      track.push(geoToScene(s.lat, s.lon, Math.max(40, s.alt) * 0 + 30));
    }
    setOrbitPts(orbit);
    setTrackPts(track);
  }, [tle, altitudeScale]);

  useFrame(() => {
    if (!markerRef.current) return;
    _altScale = altitudeScale;
    const s = propagateSat(tle, new Date());
    markerRef.current.position.set(...geoToScene(s.lat, s.lon, s.alt));
  });

  return (
    <>
      {orbitPts.length > 1 && (
        <Line points={orbitPts} color="#f0b35e" lineWidth={1.5} transparent opacity={0.85} />
      )}
      {trackPts.length > 1 && (
        <Line points={trackPts} color="#f0b35e" lineWidth={1} transparent opacity={0.3} dashed dashSize={0.06} gapSize={0.05} />
      )}
      <group ref={markerRef}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ffd489" />
        </mesh>
        <Html center zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
          <div className="scene-label">{tle.name}</div>
        </Html>
      </group>
    </>
  );
}

// Keeps the whole Earth in frame when the canvas aspect changes (portrait
// phones, fullscreen): pull the camera back when the viewport is narrow.
function FitCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / size.height;
    const dist = Math.max(5.8, 5.6 / Math.min(aspect, 1.4));
    const dir = camera.position.clone().normalize();
    camera.position.copy(dir.multiplyScalar(dist));
    camera.lookAt(0, 0, 0);
  }, [camera, size]);
  return null;
}

export type TrackerGlobeProps = {
  tles: TLE[];
  color: string;
  selected: TLE | null;
  autoRotate: boolean;
  onSelect: (tle: TLE | null) => void;
  altitudeScale?: number;
  pointSize?: number;
};

export default function TrackerGlobe({
  tles,
  color,
  selected,
  autoRotate,
  onSelect,
  altitudeScale = 1,
  pointSize = 0.075,
}: TrackerGlobeProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.3, 5.8], fov: 42, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ raycaster }) => {
        raycaster.params.Points = { threshold: 0.05 };
      }}
      onPointerMissed={() => onSelect(null)}
    >
      <FitCamera />
      <color attach="background" args={["#04060d"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 3, 8]} intensity={2.6} />
      <Stars radius={90} depth={50} count={4200} factor={3.2} saturation={0} fade speed={0.4} />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <Satellites
        tles={tles}
        color={color}
        selectedId={selected?.noradId ?? null}
        onSelect={onSelect}
        altitudeScale={altitudeScale}
        pointSize={pointSize}
      />
      {selected ? <SelectedSatellite tle={selected} altitudeScale={altitudeScale} /> : null}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.7}
        maxDistance={30}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
