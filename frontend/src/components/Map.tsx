/* ─── VANTARA — WebGIS Map Component (Light Theme) ────────── */

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchDistrictGeoJSON, fetchAIDistrictSummary } from "../api";
import type { DistrictGeoJSON, DistrictFeature, AISummary } from "../types";

interface MapProps {
  onDistrictSelect: (district: string, state: string) => void;
  selectedDistrict: string | null;
}

function getAnomalyColor(feature: DistrictFeature): string {
  const ac = feature.properties.anomaly?.anomaly_class;
  if (ac === "SYSTEMIC") return "#b91c1c";    /* red-700 */
  if (ac === "INDIVIDUAL") return "#b45309";  /* amber-700 */
  return "#15803d";                           /* green-700 */
}

function getRadius(totalClaims: number): number {
  return Math.max(9, Math.min(24, 6 + Math.sqrt(totalClaims) * 0.45));
}

export default function Map({ onDistrictSelect, selectedDistrict }: MapProps) {
  const [geojson, setGeojson] = useState<DistrictGeoJSON | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchDistrictGeoJSON().then(setGeojson);
  }, []);

  const handleDistrictClick = async (feature: DistrictFeature) => {
    const d = feature.properties.district;
    const s = feature.properties.state;
    onDistrictSelect(d, s);
    setLoadingSummary(true);
    setAiSummary(null);
    try {
      const summary = await fetchAIDistrictSummary(d);
      setAiSummary(summary);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!geojson) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <div className="animate-pulse text-sm">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[22.5, 82.5]}
        zoom={5}
        className="h-full w-full"
        style={{ background: "#f3f4f6" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {geojson.features.map((feature) => {
          const p = feature.properties;
          const coords = feature.geometry.coordinates;
          const isSelected = selectedDistrict === p.district;
          const color = getAnomalyColor(feature);

          return (
            <CircleMarker
              key={p.district}
              center={[coords[1], coords[0]]}
              radius={getRadius(p.total_claims)}
              pathOptions={{
                color: isSelected ? "#1e3a5f" : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => handleDistrictClick(feature),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
              >
                <div className="text-xs">
                  <div className="font-semibold text-gray-900">{p.district}</div>
                  <div className="text-gray-500">{p.state}</div>
                  <div className="mt-1 text-gray-700">
                    Settlement: {p.settlement_pct}% •{" "}
                    <span
                      className={
                        p.anomaly?.anomaly_class === "SYSTEMIC"
                          ? "text-red-700 font-semibold"
                          : p.anomaly?.anomaly_class === "INDIVIDUAL"
                          ? "text-amber-700 font-semibold"
                          : "text-green-700 font-semibold"
                      }
                    >
                      {p.anomaly?.anomaly_class}
                    </span>
                  </div>
                </div>
              </Tooltip>

              {isSelected && (
                <Popup className="vantara-popup">
                  <div className="bg-white text-gray-900 p-4 rounded-lg min-w-[280px] max-w-[340px] shadow-sm">
                    <h3 className="text-base font-bold text-gray-900">
                      {p.district}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{p.state}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="text-gray-500 text-xs">
                          Total Claims
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {p.total_claims.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="text-gray-500 text-xs">
                          Settlement %
                        </div>
                        <div
                          className={`font-semibold ${
                            p.settlement_pct < 40
                              ? "text-red-700"
                              : p.settlement_pct < 70
                              ? "text-amber-700"
                              : "text-green-700"
                          }`}
                        >
                          {p.settlement_pct}%
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="text-gray-500 text-xs">
                          Violations
                        </div>
                        <div className="text-red-700 font-semibold">
                          {p.statutory_violations}
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="text-gray-500 text-xs">
                          Avg SDLC Days
                        </div>
                        <div
                          className={`font-semibold ${
                            p.avg_stage2_days > 120
                              ? "text-red-700"
                              : p.avg_stage2_days > 60
                              ? "text-amber-700"
                              : "text-green-700"
                          }`}
                        >
                          {p.avg_stage2_days}d
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">
                        AI Analysis
                      </div>
                      {loadingSummary ? (
                        <div className="text-gray-400 text-xs animate-pulse">
                          Generating analysis...
                        </div>
                      ) : aiSummary ? (
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {aiSummary.summary.substring(0, 300)}
                          {aiSummary.summary.length > 300 ? "..." : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
          Anomaly Classification
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-700 inline-block" />
            <span className="text-gray-700">Systemic Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            <span className="text-gray-700">Individual Delay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-700 inline-block" />
            <span className="text-gray-700">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
