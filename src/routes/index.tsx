import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getLatestNews, type NewsItem } from "@/lib/news.functions";
import {
  julianDateUTC,
  moonPhase,
  heliocentricEcliptic,
  interplanetDistanceAU,
  PLANET_ORDER,
} from "@/lib/astronomy";
import { fmtAU, fmtNum, lightTimeFromAU, utcClock, utcDateStr, timeAgo, safeText } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORBITEX — Space Intelligence Platform" },
      {
        name: "description",
        content:
          "Live satellite tracking, verified space weather, near-Earth object watch, and deep-space mission data from NASA, NOAA, CelesTrak, and JPL, in one research-grade dashboard.",
      },
      { property: "og:title", content: "ORBITEX — Space Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Live satellite tracking, verified space weather, near-Earth object watch, and deep-space mission data in one research-grade dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(newsQueryOptions),
  component: LandingPage,
});

const newsQueryOptions = queryOptions({
  queryKey: ["orbitex", "news", "latest"],
  queryFn: () => getLatestNews(),
});

// ----------------------------- Explore cards ------------------------------
type ExploreCard = {
  to: string;
  icon: string;
  title: string;
  blurb: string;
};
const EXPLORE: ExploreCard[] = [
  { to: "/tracker", icon: "tracker", title: "Orbit Tracker", blurb: "Live 3D globe with satellites propagated from real NORAD element sets." },
  { to: "/deepspace", icon: "deepspace", title: "Deep Space", blurb: "Real planetary orbits and live distance tracking for active probes." },
  { to: "/sky", icon: "sky", title: "Sky Tonight", blurb: "Moon phase, visible planets, and rise/set times for your location." },
  { to: "/mars", icon: "mars", title: "Mars", blurb: "Latest raw imagery from Curiosity and Perseverance." },
  { to: "/weather", icon: "weather", title: "Space Weather", blurb: "Geomagnetic index, solar wind, and aurora outlook from NOAA SWPC." },
  { to: "/neo", icon: "neo", title: "Asteroid Watch", blurb: "Upcoming close approaches, ranked by miss distance." },
  { to: "/launches", icon: "launches", title: "Launches", blurb: "Upcoming orbital launches worldwide with live countdowns." },
  { to: "/ask", icon: "ask", title: "Ask ORBITEX", blurb: "A grounded assistant that answers from this session's live data." },
];

const ICONS: Record<string, React.ReactNode> = {
  tracker: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="7.2" /><ellipse cx="12" cy="12" rx="7.2" ry="2.8" transform="rotate(28 12 12)" /></svg>
  ),
  deepspace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="9" cy="15" r="2.4" /><circle cx="17" cy="7" r="1.3" fill="currentColor" stroke="none" /><path d="M4 19 C 8 10, 16 14, 20 5" /></svg>
  ),
  sky: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17.5 15.5A7 7 0 1 1 8.7 4.2a5.6 5.6 0 0 0 8.8 11.3Z" /></svg>
  ),
  mars: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="10.5" cy="13.5" r="6" /><path d="M15 9l5-5M20 4h-4.5M20 4v4.5" /></svg>
  ),
  weather: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3.6" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" /></svg>
  ),
  neo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 5l3 1.5L14 5l3 3-1 3.3 2 2.7-2.5 2L15 19l-3.3-1L9 19l-.5-3-2.5-2 2-2.7L7 8z" /></svg>
  ),
  launches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c2.5 2 4 5.3 4 9l-4 3-4-3c0-3.7 1.5-7 4-9Z" /><path d="M8.5 14L6 15.5 6.5 12M15.5 14l2.5 1.5-.5-3.5M10.5 17.5L9 20M13.5 17.5L15 20" /></svg>
  ),
  ask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M9 10h6M9 13h4" /></svg>
  ),
};

// --------------------------- Live stats (client) --------------------------
// All values derive from the verified JPL Keplerian elements in
// astronomy.ts. Computed client-side after mount to avoid SSR/client
// hydration drift, since they depend on the current time.
type LiveStats = {
  utc: string;
  date: string;
  moonIllum: number;
  moonName: string;
  moonAgeDays: number;
  jupiterAU: number;
  jupiterLight: string;
  marsAU: number;
  marsLight: string;
};

function computeStats(now: Date): LiveStats {
  const jd = julianDateUTC(now);
  const mp = moonPhase(jd);
  const earth = heliocentricEcliptic("earth", jd);
  const jupiter = heliocentricEcliptic("jupiter", jd);
  const mars = heliocentricEcliptic("mars", jd);
  const jupAU = interplanetDistanceAU(earth, jupiter);
  const marsAU = interplanetDistanceAU(earth, mars);
  return {
    utc: utcClock(now),
    date: utcDateStr(now),
    moonIllum: Math.round(mp.illumination * 100),
    moonName: mp.name,
    moonAgeDays: mp.ageDays,
    jupiterAU: jupAU,
    jupiterLight: lightTimeFromAU(jupAU),
    marsAU: marsAU,
    marsLight: lightTimeFromAU(marsAU),
  };
}

// --------------------------- Hero orbit diagram ----------------------------
// Projects the four inner planets onto the ecliptic plane using their live
// heliocentric positions. Scale tuned so Mars (1.52 AU) sits inside the ring.
const ORBIT_AU = { mercury: 0.387, venus: 0.723, earth: 1.0, mars: 1.524 };
const ORBIT_SCALE = 26; // px per AU
const CX = 100;
const CY = 100;

function HeroOrbit() {
  const [pts, setPts] = useState<{ x: number; y: number; key: string }[] | null>(null);
  useEffect(() => {
    const jd = julianDateUTC(new Date());
    const keys = ["mercury", "venus", "earth", "mars"] as const;
    setPts(
      keys.map((k) => {
        const h = heliocentricEcliptic(k, jd);
        return { x: CX + h.x * ORBIT_SCALE, y: CY + h.y * ORBIT_SCALE, key: k };
      })
    );
    const id = setInterval(() => {
      const jd2 = julianDateUTC(new Date());
      setPts(
        keys.map((k) => {
          const h = heliocentricEcliptic(k, jd2);
          return { x: CX + h.x * ORBIT_SCALE, y: CY + h.y * ORBIT_SCALE, key: k };
        })
      );
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-orbit" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        {/* Orbit rings */}
        {Object.values(ORBIT_AU).map((r, i) => (
          <circle key={i} className="ring" cx={CX} cy={CY} r={r * ORBIT_SCALE} />
        ))}
        {/* Sun */}
        <circle className="body" cx={CX} cy={CY} r="5" />
        {/* Planets */}
        {pts?.map((p) => (
          <circle key={p.key} className={p.key === "earth" ? "body" : "body-faint"} cx={p.x} cy={p.y} r={p.key === "earth" ? 3.4 : 2.6} />
        ))}
        {/* Labels */}
        <text className="label" x={CX + 3} y={CY - 6}>SUN</text>
      </svg>
    </div>
  );
}

// ------------------------------- News card ---------------------------------
function newsTypeLabel(type: string): string {
  return type === "article" ? "Article" : type === "blog" ? "Blog / Vlog" : type === "report" ? "Report" : "News";
}

function NewsCard({ item }: { item: NewsItem }) {
  const published = item.published_at ? new Date(item.published_at) : null;
  return (
    <a className="news-card interactive" href={item.url} target="_blank" rel="noopener noreferrer">
      {item.image_url ? (
        <img className="news-img" src={item.image_url} alt="" loading="lazy" />
      ) : (
        <div className="news-img" />
      )}
      <div className="news-body">
        <span className="badge badge-accent">{newsTypeLabel(item.content_type)}</span>
        <h3>{safeText(item.title, 110)}</h3>
        {item.summary ? <p>{safeText(item.summary, 140)}</p> : null}
        <div className="news-foot">
          <span>{safeText(item.news_site, 30)}</span>
          {published ? <span> · {timeAgo(published)}</span> : null}
        </div>
      </div>
    </a>
  );
}

// ------------------------------ Landing page -------------------------------
function LandingPage() {
  const { data: newsResult } = useSuspenseQuery(newsQueryOptions);
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    const tick = () => setStats(computeStats(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const newsItems = useMemo(() => newsResult.items ?? [], [newsResult]);

  return (
    <main className="page-main">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="glass-pill hero-kicker">
              <span className="live-dot" aria-hidden="true" /> Live data from NASA, NOAA, CelesTrak & JPL
            </span>
            <h1>See beyond the <span>sky</span></h1>
            <p className="hero-lede">
              ORBITEX brings live satellite tracking, space weather, near-Earth object
              watch, and deep-space mission data into one dashboard built for
              students, researchers, and anyone who wants the real numbers, not a
              simulation.
            </p>
            <div className="hero-actions">
              <Link to="/tracker" className="btn btn-primary">Open Orbit Tracker</Link>
              <Link to="/about" className="btn">How the data works</Link>
            </div>
            <div className="hero-clock glass-pill mono" aria-live="off">
              {stats ? `${stats.utc} UTC · ${stats.date}` : "-- : -- : -- UTC"}
            </div>
          </div>
          <HeroOrbit />
        </div>
      </section>

      {/* LIVE STAT GRID */}
      <section className="tight">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Computed now</span>
            <h2>Live numbers from verified elements</h2>
          </div>
          <div className="stat-grid">
            <div className="glass glass-card stat-card">
              <div className="stat-label">Moon phase</div>
              <div className="stat-value">{stats ? `${stats.moonIllum}%` : "--"}</div>
              <div className="stat-unit">{stats ? stats.moonName : "computing"}</div>
              <div className="stat-note">{stats ? `${fmtNum(stats.moonAgeDays, 1)} days into the cycle` : "Live lunar illumination"}</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Mars · Earth distance</div>
              <div className="stat-value">{stats ? fmtAU(stats.marsAU, 2) : "--"}</div>
              <div className="stat-unit">{stats ? `${stats.marsLight} light-time` : "computing"}</div>
              <div className="stat-note">From JPL Keplerian elements</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Jupiter · Earth distance</div>
              <div className="stat-value">{stats ? fmtAU(stats.jupiterAU, 2) : "--"}</div>
              <div className="stat-unit">{stats ? `${stats.jupiterLight} light-time` : "computing"}</div>
              <div className="stat-note">From JPL Keplerian elements</div>
            </div>
            <div className="glass glass-card stat-card">
              <div className="stat-label">Tracked bodies</div>
              <div className="stat-value">{PLANET_ORDER.length}</div>
              <div className="stat-unit">major planets</div>
              <div className="stat-note">Plus the Moon, Sun, and live satellites</div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE GRID */}
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Explore</span>
            <h2>Every tool, one platform</h2>
          </div>
          <div className="explore-grid">
            {EXPLORE.map((c) => (
              <Link key={c.to} to={c.to} className="glass glass-card interactive explore-card">
                <span className="explore-icon">{ICONS[c.icon]}</span>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SPACE NEWS */}
      <section id="news">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Updated daily</span>
            <h2>Space news</h2>
          </div>
          {newsItems.length > 0 ? (
            <div className="news-grid">
              {newsItems.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted">
              {newsResult.error ?? "Space news is temporarily unavailable."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
