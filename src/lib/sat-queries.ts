// Shared query option factories for CelesTrak-backed satellite data so the
// tracker, the object detail template, and compare mode all read from the
// same cache entries.
import { queryOptions } from "@tanstack/react-query";
import {
  getSatellite,
  getSatellites,
  getSatellitesSSO,
  getSatnogsSatellite,
  getSatnogsTransmitters,
} from "@/lib/orbitex-data.functions";

export type SatGroup =
  | "stations"
  | "active"
  | "starlink"
  | "gps-ops"
  | "glo-ops"
  | "galileo"
  | "beidou"
  | "geo"
  | "iridium-NEXT"
  | "resource"
  | "weather"
  | "science"
  | "cosmos-2251-debris"
  | "iridium-33-debris"
  | "19820"
  | "sso";

export function satGroupQuery(group: SatGroup) {
  if (group === "sso") return satSSOQuery();
  return queryOptions({
    queryKey: ["orbitex", "sats", group],
    queryFn: () => getSatellites({ data: { group } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

export function satSSOQuery() {
  return queryOptions({
    queryKey: ["orbitex", "sats", "sso"],
    queryFn: () => getSatellitesSSO(),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

export function satByIdQuery(noradId: string) {
  return queryOptions({
    queryKey: ["orbitex", "sat", noradId],
    queryFn: () => getSatellite({ data: { noradId } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

// SatNOGS community catalog: mission profile and radio transmitter records
// for a single catalog object. Long stale time; entries change rarely.
export function satnogsProfileQuery(noradId: string) {
  return queryOptions({
    queryKey: ["orbitex", "satnogs", noradId],
    queryFn: () => getSatnogsSatellite({ data: { noradId } }),
    staleTime: 6 * 60 * 60_000,
    retry: 1,
  });
}

export function satnogsTransmittersQuery(noradId: string) {
  return queryOptions({
    queryKey: ["orbitex", "satnogs-tx", noradId],
    queryFn: () => getSatnogsTransmitters({ data: { noradId } }),
    staleTime: 6 * 60 * 60_000,
    retry: 1,
  });
}
