import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  FiChevronLeft,
  FiMapPin,
  FiNavigation2,
} from "react-icons/fi";
import "leaflet/dist/leaflet.css";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

/* Fix Leaflet marker */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

/* Custom red map dot like design */
const dotIcon = L.divIcon({
  className: "custom-location-dot",
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:999px;
      background:#F33636;
      border:3px solid #FFFFFF;
      box-shadow:0 2px 8px rgba(0,0,0,0.14);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function LocationHistoryItem({ loc, isCurrent }) {
  return (
    <div
      className={
        isCurrent
          ? "rounded-[22px] border border-[#4B84FF] bg-[#F5F8FF] px-[22px] py-[18px] shadow-[0px_1px_2px_rgba(16,24,40,0.02)]"
          : "rounded-[22px] border border-[#E5E7EB] bg-[#FAFAFA] px-[22px] py-[18px] shadow-[0px_1px_2px_rgba(16,24,40,0.02)]"
      }
    >
      <div className="mb-[10px] flex items-center gap-[12px]">
        {isCurrent && (
          <div className="inline-flex h-[24px] items-center gap-[6px] rounded-[999px] bg-[#EEF8F0] px-[10px]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#1FBC45]" />
            <span className="text-[13px] font-[500] leading-[16px] text-[#1FBC45]">
              Current
            </span>
          </div>
        )}
        <span className="text-[13px] font-[400] leading-[16px] text-[#8C8C8C]">
          {loc?.updatedAt ? timeAgo(loc.updatedAt) : ""}
        </span>
      </div>

      <div className="flex items-start gap-[12px]">
        <FiMapPin className="mt-[3px] shrink-0 text-[16px] text-[#4B84FF]" />
        <div className="min-w-0 flex-1">
          <p className="break-words text-[16px] font-[500] leading-[24px] tracking-[-0.01em] text-[#1F1F1F]">
            {loc.locationName || "Unknown location"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TrackEmployees({ onBack }) {
  const [rows, setRows] = useState([]);           
  const [searchId, setSearchId] = useState("");   
  const [trackingId, setTrackingId] = useState(""); 

  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);

  const todayKeyUTC = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
  }, []);

  const clearAll = useCallback(() => {
    stopInterval();
    setTracking(false);
    setTrackingId("");
    setSearchId("");
    setRows([]);
    setError("");
    setLoading(false);
  }, [stopInterval]);

  const fetchById = useCallback(
    async (empId) => {
      const id = empId?.trim();
      if (!id) return;

      setError("");

    try {
        setLoading(true);

        const res = await axios.get(
          `${BASE_URL}/api/track-location/track-location/${id}`,
          { timeout: 60000 }
        );

        const { latest, history = {} } = res.data || {};
        const todayList = history[todayKeyUTC] || [];

        const combined = [...todayList].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        if (latest) combined.unshift({ ...latest, _isLatest: true });

        setRows(combined);
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch location";
        setRows([]);
        setError(msg);
      } finally {
        setLoading(false);
    }
    },
    [todayKeyUTC]
  );

  const startTracking = useCallback(
    async (empId) => {
      const id = empId?.trim();
      if (!id) {
        setError("Please enter Employee ID");
      return;
    }

      setTracking(true);
      setTrackingId(id);
    stopInterval();

      await fetchById(id);

    intervalRef.current = setInterval(() => {
        fetchById(id);
    }, 5000); 
    },
    [fetchById, stopInterval]
  );

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  const latest = rows?.[0];
  const lastUpdatedText = latest?.updatedAt ? timeAgo(latest.updatedAt) : "";

  const mapCenter = useMemo(() => {
    if (latest?.latitude && latest?.longitude) {
      return [latest.latitude, latest.longitude];
    }
    return [28.6139, 77.209];
  }, [latest]);

  const mapRows = useMemo(() => {
    return rows.filter((loc) => loc?.latitude && loc?.longitude);
  }, [rows]);

  const employeeDisplayName =
    latest?.name ||
    latest?.employeeName ||
    latest?.fullName ||
    trackingId ||
    "John Doe";

  const employeeDesignation =
    latest?.designation || latest?.des || "Senior Developer";

  const employeePhone =
    latest?.phone ||
    latest?.mobile ||
    latest?.contact ||
    "+91 99999-99999";

  return (
    <div className="w-full">
      <div className="mb-[28px] flex items-start gap-[16px] sm:mb-[32px] sm:gap-[20px] lg:mb-[40px] lg:gap-[28px]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_1px_3px_rgba(16,24,40,0.05)] transition hover:bg-[#FAFAFA] sm:h-[52px] sm:w-[52px]"
        >
          <FiChevronLeft className="text-[26px]" />
        </button>

        <div className="pt-[2px]">
          <h1 className="text-[24px] font-[600] leading-[30px] tracking-[-0.03em] text-[#1F1F1F] sm:text-[28px] sm:leading-[34px] lg:text-[34px] lg:leading-[41px]">
            Employee Location Tracking
          </h1>
          <p className="mt-[4px] text-[14px] font-[400] leading-[20px] tracking-[-0.01em] text-[#666666] sm:text-[15px] sm:leading-[22px] lg:text-[16px] lg:leading-[24px]">
            Monitor real-time employee locations on map
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#E7EBF0] bg-white px-[16px] py-[18px] shadow-[0px_1px_3px_rgba(16,24,40,0.05)] sm:rounded-[30px] sm:px-[24px] sm:py-[24px] lg:rounded-[32px] lg:px-[32px] lg:py-[28px]">
        <label className="mb-[12px] block text-[18px] font-[500] leading-[28px] tracking-[-0.01em] text-[#4A4A4A]">
          Enter Employee ID
        </label>

        <div className="grid grid-cols-1 gap-[14px] xl:grid-cols-[minmax(0,1fr)_436px_196px] xl:gap-[18px]">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
            className="h-[56px] w-full rounded-[18px] border border-[#E3E6EB] bg-[#F7F8FA] px-[20px] text-[16px] font-[400] leading-[24px] text-[#1F1F1F] outline-none placeholder:text-[#A0A0A0] focus:border-[#D2D7DE] sm:h-[60px] sm:px-[22px] lg:h-[64px] lg:rounded-[20px] lg:px-[24px]"
        />

        <button
            type="button"
          onClick={() => startTracking(searchId)}
            disabled={loading}
            className="inline-flex h-[56px] w-full items-center justify-center gap-[10px] rounded-[18px] bg-[#063F78] px-[24px] text-[18px] font-[600] leading-[24px] tracking-[-0.02em] text-white shadow-[0px_1px_2px_rgba(16,24,40,0.02)] transition hover:bg-[#073766] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[60px] lg:h-[64px] lg:rounded-[20px]"
        >
            <FiNavigation2 className="text-[18px]" />
            <span>{loading ? "Tracking..." : "Track Location"}</span>
        </button>

          <button
            type="button"
            onClick={clearAll}
            className="h-[56px] w-full rounded-[18px] bg-[#B9B9BB] px-[24px] text-[18px] font-[500] leading-[24px] tracking-[-0.02em] text-white transition hover:bg-[#ADADAF] sm:h-[60px] lg:h-[64px] lg:rounded-[20px]"
          >
            Clear
          </button>
      </div>

        {error ? (
          <div className="mt-[14px] rounded-[16px] border border-[#FFD8D8] bg-[#FFF5F5] px-[16px] py-[12px] text-[14px] font-[500] leading-[20px] text-[#D92D20]">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-[24px] grid grid-cols-1 gap-[16px] xl:grid-cols-[minmax(0,1fr)_516px] xl:gap-[16px]">
        <div className="overflow-hidden rounded-[32px] border border-[#E7EBF0] bg-white shadow-[0px_1px_3px_rgba(16,24,40,0.05)]">
          <div className="h-[340px] sm:h-[420px] lg:h-[520px] xl:h-[618px]">
            {latest?.latitude && latest?.longitude ? (
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <MapCenterUpdater center={mapCenter} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {mapRows.map((loc, i) => (
                  <Marker
                    key={`${loc?.updatedAt || "loc"}-${i}`}
                    position={[loc.latitude, loc.longitude]}
                    icon={dotIcon}
                  >
                    <Popup>
                      {loc.locationName || "Unknown location"}
                      <br />
                    {loc.updatedAt
                      ? new Date(loc.updatedAt).toLocaleString()
                        : ""}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center px-[24px] text-center text-[16px] font-[500] leading-[24px] text-[#9CA3AF]">
                {tracking
                  ? loading
                    ? "Fetching location..."
                    : "No Location Available"
                  : "Start tracking to view map"}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <div className="rounded-[32px] border border-[#E7EBF0] bg-white px-[22px] py-[24px] shadow-[0px_1px_3px_rgba(16,24,40,0.05)] sm:px-[28px] sm:py-[28px] lg:px-[38px] lg:py-[32px]">
            <div className="flex items-center gap-[16px]">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-[#D9C4A8] sm:h-[76px] sm:w-[76px] lg:h-[82px] lg:w-[82px]">
                {latest?.photo ? (
                  <img
                    src={latest.photo}
                    alt="employee"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[24px] font-[600] text-[#5C4630]">
                    {String(employeeDisplayName).trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[26px] font-[600] leading-[32px] tracking-[-0.03em] text-[#3B3B3B]">
                  {employeeDisplayName}
                </h2>
                <div className="mt-[6px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
                  <span className="text-[13px] font-[500] leading-[16px] text-[#A0A0A0]">
                    Last updated
                  </span>
                  <span className="text-[13px] font-[600] leading-[16px] text-[#16C348]">
                    • {lastUpdatedText || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-[30px] grid grid-cols-2 gap-x-[20px] gap-y-[16px]">
              <div>
                <p className="text-[14px] font-[400] leading-[20px] text-[#A0A0A0] sm:text-[15px] sm:leading-[22px] lg:text-[16px] lg:leading-[24px]">
                  Designation
                </p>
                <p className="mt-[2px] text-[18px] font-[500] leading-[28px] tracking-[-0.02em] text-[#3B3B3B] sm:text-[19px] lg:text-[20px]">
                  {employeeDesignation}
                </p>
              </div>

              <div>
                <p className="text-[14px] font-[400] leading-[20px] text-[#A0A0A0] text-left sm:text-[15px] sm:leading-[22px] lg:text-[16px] lg:leading-[24px]">
                  Phone
                </p>
                <p className="mt-[2px] break-words text-[18px] font-[500] leading-[28px] tracking-[-0.02em] text-[#3B3B3B] sm:text-[19px] lg:text-[20px]">
                  {employeePhone}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E7EBF0] bg-white px-[22px] py-[24px] shadow-[0px_1px_3px_rgba(16,24,40,0.05)] sm:px-[28px] sm:py-[28px] lg:px-[38px] lg:py-[32px]">
            <h3 className="text-[24px] font-[600] leading-[32px] tracking-[-0.03em] text-[#3B3B3B]">
              Current Location
            </h3>

            {!rows?.length ? (
              <div className="pt-[18px] text-[15px] font-[500] leading-[22px] text-[#A0A0A0]">
                {tracking
                  ? loading
                    ? "Loading history..."
                    : "No history found for today."
                  : "No data yet."}
              </div>
            ) : (
              <div className="mt-[18px] space-y-[14px]">
                {rows.map((loc, idx) => (
                  <LocationHistoryItem
                    key={`${loc?.updatedAt || "history"}-${idx}`}
                    loc={loc}
                    isCurrent={idx === 0}
                  />
                ))}
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}