import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { satnogsProfileQuery, satnogsTransmittersQuery } from "@/lib/sat-queries";
import { SkeletonImage } from "@/components/site/skeleton-image";
import { safeText, utcDateStr } from "@/lib/format";

// Community mission profile and radio transmitter records for a catalog
// object, sourced from the SatNOGS DB. Rendered on the shared satellite
// detail template beneath the orbital element data. Every field is
// rendered only when the community record actually contains it; nothing
// is invented for objects with sparse records.

type SatnogsSat = {
  name?: string;
  names?: string;
  image?: string;
  status?: string;
  launched?: string;
  deployed?: string;
  decayed?: string;
  website?: string;
  operator?: string;
  countries?: string;
};

type SatnogsTx = {
  uuid?: string;
  description?: string;
  type?: string;
  alive?: boolean;
  status?: string;
  downlink_low?: number | null;
  downlink_high?: number | null;
  uplink_low?: number | null;
  uplink_high?: number | null;
  mode?: string;
  baud?: number | null;
  service?: string;
  invert?: boolean;
  unconfirmed?: boolean;
};

function fmtDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : utcDateStr(d);
}

// The community record stores literal placeholder strings such as "None"
// for empty fields. Treat those as absent so they never reach the page.
function cleanField(value: unknown, maxLen = 120): string {
  const text = safeText(value, maxLen);
  return /^(none|n\/a|null|unknown)$/i.test(text) ? "" : text;
}

function fmtFreq(hz: number | null | undefined): string | null {
  if (typeof hz !== "number" || !Number.isFinite(hz) || hz <= 0) return null;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(3)} GHz`;
  return `${(hz / 1e6).toFixed(3)} MHz`;
}

function fmtFreqRange(low: number | null | undefined, high: number | null | undefined): string | null {
  const lo = fmtFreq(low);
  const hi = fmtFreq(high);
  if (!lo) return hi;
  if (!hi || lo === hi) return lo;
  return `${lo} to ${hi}`;
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-cell">
      <div className="stat-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}

// Compose a short factual profile paragraph from the fields the community
// record actually carries. No detail is guessed; sparse records produce a
// shorter paragraph.
function buildWriteUp(sat: SatnogsSat, displayName: string, noradId: string): string {
  const name = safeText(sat.name, 120) || displayName;
  const alt = safeText(sat.names, 160);
  const sentences: string[] = [];
  sentences.push(
    `${name}${alt ? `, also catalogued as ${alt},` : ""} is tracked in the public catalog as NORAD ${noradId}.`
  );

  const operator = safeText(sat.operator, 120);
  const countries = safeText(sat.countries, 120);
  const launched = fmtDate(sat.launched);
  let mission = "";
  if (operator) mission = `It is operated by ${operator}${countries ? ` (${countries})` : ""}`;
  else if (countries) mission = `It is registered to ${countries}`;
  if (mission && launched) mission += ` and was launched on ${launched}.`;
  else if (mission) mission += ".";
  else if (launched) mission = `It was launched on ${launched}.`;
  if (mission) sentences.push(mission);

  const deployed = fmtDate(sat.deployed);
  if (deployed) sentences.push(`Deployment followed on ${deployed}.`);
  const decayed = fmtDate(sat.decayed);
  if (decayed) sentences.push(`The object reentered the atmosphere on ${decayed}.`);
  const status = safeText(sat.status, 40);
  if (status && !decayed) sentences.push(`Observers currently report its status as ${status}.`);
  return sentences.join(" ");
}

function TransmitterRow({ tx }: { tx: SatnogsTx }) {
  const description = safeText(tx.description, 120) || "Unnamed transmitter";
  const downlink = fmtFreqRange(tx.downlink_low, tx.downlink_high);
  const uplink = fmtFreqRange(tx.uplink_low, tx.uplink_high);
  const mode = safeText(tx.mode, 40);
  const service = safeText(tx.service, 60);
  const active = tx.alive === true || tx.status === "active";

  const meta: string[] = [];
  if (downlink) meta.push(`Downlink ${downlink}${tx.invert ? " (inverted)" : ""}`);
  if (uplink) meta.push(`Uplink ${uplink}`);
  if (mode) meta.push(mode);
  if (typeof tx.baud === "number" && tx.baud > 0) meta.push(`${tx.baud.toLocaleString("en-US")} baud`);
  if (service) meta.push(service);

  return (
    <li className="tx-row">
      <div className="tx-row-top">
        <span className="tx-name">{description}</span>
        <span className="tx-badges">
          {tx.type ? <span className="badge badge-muted">{safeText(tx.type, 20)}</span> : null}
          <span className={`badge ${active ? "badge-success" : "badge-muted"}`}>
            {active ? "Active" : "Inactive"}
          </span>
          {tx.unconfirmed ? <span className="badge badge-warning">Unconfirmed</span> : null}
        </span>
      </div>
      {meta.length ? <div className="tx-meta mono">{meta.join("  ·  ")}</div> : null}
    </li>
  );
}

export function ObjectProfile({ noradId, displayName }: { noradId: string; displayName: string }) {
  const profileQuery = useQuery(satnogsProfileQuery(noradId));
  const txQuery = useQuery(satnogsTransmittersQuery(noradId));
  const [showInactive, setShowInactive] = useState(false);

  const sat: SatnogsSat | null = profileQuery.data?.data ?? null;
  const allTx: SatnogsTx[] = useMemo(() => {
    const rows = txQuery.data?.data;
    return Array.isArray(rows) ? rows : [];
  }, [txQuery.data]);

  const sortedTx = useMemo(() => {
    const rows = showInactive ? allTx : allTx.filter((tx) => tx.alive === true || tx.status === "active");
    return [...rows].sort((a, b) => (a.downlink_low ?? 0) - (b.downlink_low ?? 0));
  }, [allTx, showInactive]);

  const inactiveCount = allTx.filter((tx) => !(tx.alive === true || tx.status === "active")).length;
  const writeUp = sat ? buildWriteUp(sat, displayName, noradId) : null;
  const profilePending = profileQuery.isPending;
  const txPending = txQuery.isPending;

  return (
    <div className="sat-detail-grid" style={{ marginTop: 18 }}>
      <div className="glass glass-card side-card">
        <div className="side-item-top">
          <h3>Mission profile</h3>
          {sat?.website ? (
            <a
              href={sat.website}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link"
              style={{ marginTop: 0 }}
            >
              Official mission site
            </a>
          ) : null}
        </div>

        {profilePending ? (
          <p className="detail-note">Loading the community mission record.</p>
        ) : sat ? (
          <>
            {sat.image ? (
              <div className="profile-figure">
                <SkeletonImage src={sat.image} className="profile-img" alt={`${displayName} spacecraft`} />
              </div>
            ) : null}
            <p className="profile-lede">{writeUp}</p>
            <div className="detail-rows">
              {sat.operator ? <DetailCell label="Operator" value={safeText(sat.operator, 80)} /> : null}
              {sat.countries ? <DetailCell label="Countries" value={safeText(sat.countries, 80)} /> : null}
              {sat.status ? <DetailCell label="Status" value={safeText(sat.status, 40)} /> : null}
              {fmtDate(sat.launched) ? <DetailCell label="Launched" value={fmtDate(sat.launched)!} /> : null}
              {fmtDate(sat.deployed) ? <DetailCell label="Deployed" value={fmtDate(sat.deployed)!} /> : null}
              {fmtDate(sat.decayed) ? <DetailCell label="Reentered" value={fmtDate(sat.decayed)!} /> : null}
            </div>
          </>
        ) : (
          <p className="detail-note">
            No community mission record exists for this object yet. The orbital elements and
            live telemetry above remain complete; many small payloads and debris objects
            simply have no published profile.
          </p>
        )}
        <p className="detail-note">
          Profile maintained by the SatNOGS observer community.
        </p>
      </div>

      <div className="glass glass-card side-card">
        <div className="side-item-top">
          <h3>Radio transmitters</h3>
          {allTx.length ? (
            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>
              {allTx.length} on record
            </span>
          ) : null}
        </div>

        {txPending ? (
          <p className="detail-note">Loading transmitter records.</p>
        ) : allTx.length === 0 ? (
          <p className="detail-note">
            No radio transmitter records are published for this object. Crewed stations,
            amateur satellites, and science missions are the best documented.
          </p>
        ) : (
          <>
            <div className="tx-controls">
              <button
                type="button"
                className="tx-toggle"
                aria-pressed={showInactive}
                onClick={() => setShowInactive((v) => !v)}
              >
                {showInactive ? "Showing all records" : `Show ${inactiveCount} inactive`}
              </button>
            </div>
            {sortedTx.length ? (
              <ul className="tx-list" aria-label="Known radio transmitters for this object">
                {sortedTx.map((tx, i) => (
                  <TransmitterRow key={tx.uuid ?? i} tx={tx} />
                ))}
              </ul>
            ) : (
              <p className="detail-note">Every transmitter on record is currently reported inactive.</p>
            )}
          </>
        )}
        <p className="detail-note">
          Frequencies are the published downlink and uplink values reported by ground
          observers, useful if you want to listen for this object during a pass.
        </p>
      </div>
    </div>
  );
}
