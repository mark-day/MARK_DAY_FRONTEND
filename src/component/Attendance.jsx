import axios from "axios";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

const MARK_API = `${BASE_URL}/api/attendanc/mark`;

function istDateString() {
  return new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
}

function istTimeString() {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function useIsDesktopLg() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches; // lg
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return isDesktop;
}

export default function Attendance() {
  const navigate = useNavigate();
  const user = useMemo(() => safeUser(), []);
  const isDesktop = useIsDesktopLg();

  const empId = user?.empId || localStorage.getItem("empId") || "";
  const empName = user?.name || localStorage.getItem("empName") || "";

  const todayISO = new Date().toISOString().split("T")[0];
  const todayKey = `attendance_${todayISO}`;

  const [serverToday, setServerToday] = useState(null);
  const [attendanceState, setAttendanceState] = useState(() => {
    try {
  return (
        JSON.parse(localStorage.getItem(todayKey)) || { in: false, out: false }
      );
    } catch {
      return { in: false, out: false };
    }
  });

  const [isLoading, setIsLoading] = useState(false);


  const [photoIn, setPhotoIn] = useState(null);
  const [photoOut, setPhotoOut] = useState(null);


  const [coords, setCoords] = useState(null);
  const [locationText, setLocationText] = useState("Fetching location...");
  const [currentTime, setCurrentTime] = useState(istTimeString());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // live IST time
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(istTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const getLocation = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: Number(pos.coords.latitude),
            lng: Number(pos.coords.longitude),
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
      );
    });
  }, []);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getLocation();
        if (!mounted) return;
        setCoords(p);


        setLocationText("Spaze IT Gurgaon");
      } catch {
        if (mounted) setLocationText("Location unavailable");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getLocation]);


  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        if (!hasCamera) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: 16 / 9,
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Camera unavailable:", err?.message || err);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback((type) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const W = video.videoWidth;
    const H = video.videoHeight;

    canvas.width = W;
    canvas.height = H;

    ctx.drawImage(video, 0, 0, W, H);

    const img = canvas.toDataURL("image/jpeg", 0.95);

    if (type === "in") setPhotoIn(img);
    else setPhotoOut(img);
  }, []);


  useEffect(() => {
    let mounted = true;
    if (!empId) return;

    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/attendances`, {
          params: { empId, limit: 1000 },
        });

        const list = res.data || [];
        const today = istDateString();
        const found =
          list.find((a) => String(a.date) === String(today)) || null;

        if (!mounted) return;

        setServerToday(found);

        const next = { in: !!found?.inTime, out: !!found?.outTime };
        setAttendanceState(next);
        localStorage.setItem(todayKey, JSON.stringify(next));
      } catch (e) {
        console.error("Fetch today attendance failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [empId, todayKey]);


  const banner = useMemo(() => {
    const inTime = serverToday?.inTime;
    const outTime = serverToday?.outTime;

    if (inTime && outTime) {
      return {
        show: true,
        title: "Attendance Complete",
        subtitle: `You marked in at ${inTime} and marked out at ${outTime}`,
      };
    }

    if (inTime && !outTime) {
      return {
        show: true,
        title: "Marked IN",
        subtitle: `You marked in at ${inTime}. Don't forget to mark out when leaving.`,
      };
    }

    return { show: false, title: "", subtitle: "" };
  }, [serverToday]);

  const markAttendance = useCallback(
    async (type) => {
      if (!empId || !empName) {
        alert("User not found. Please login again.");
      return;
    }

      // QA: OUT blocked before IN
      if (type === "out" && !attendanceState.in) {
        alert("You must mark IN before you can mark OUT.");
      return;
    }

      const photo = type === "in" ? photoIn : photoOut;
    if (!photo) {
        alert("Capture photo first");
      return;
    }

    setIsLoading(true);

    try {
        const p = coords || (await getLocation());


        const payload = {
          empId,
          name: empName,
        type,
          location: `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`,
        photo,
        };

        const res = await axios.post(MARK_API, payload);

        // refresh truth
        const refresh = await axios.get(`${BASE_URL}/api/admin/attendances`, {
          params: { empId, limit: 1000 },
        });

        const list = refresh.data || [];
        const today = istDateString();
        const found =
          list.find((a) => String(a.date) === String(today)) || null;

        setServerToday(found);
        const next = { in: !!found?.inTime, out: !!found?.outTime };
        setAttendanceState(next);
        localStorage.setItem(todayKey, JSON.stringify(next));

        alert(res.data?.message || "Marked successfully");
      } catch (err) {
        alert(err?.response?.data?.error || "Failed to mark attendance");
    } finally {
      setIsLoading(false);
    }
    },
    [attendanceState.in, coords, empId, empName, getLocation, photoIn, photoOut, todayKey]
  );

  if (!user && (!empId || !empName)) return null;

  const inDisabled = attendanceState.in;
  const outDisabled = attendanceState.out;
  const outLocked = !attendanceState.in;

  const inTheme = inDisabled
    ? { head: "bg-[#A3A3A3]", btn: "bg-[#A3A3A3]" }
    : { head: "bg-[#16A34A]", btn: "bg-[#16A34A]" };

  const outTheme = outDisabled
    ? { head: "bg-[#A3A3A3]", btn: "bg-[#A3A3A3]" }
    : outLocked
      ? { head: "bg-[#A3A3A3]", btn: "bg-[#A3A3A3]" }
      : { head: "bg-[#EF4444]", btn: "bg-[#EF4444]" };

  const isComplete = !!serverToday?.inTime && !!serverToday?.outTime;
  const isMarkedInOnly = !!serverToday?.inTime && !serverToday?.outTime;


  const renderMobileFlow = () => {
    return (
      <>
        {/* Title row (mobile) */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white rounded-2xl  border border-[#EDF2F7] shadow-[1px_0.5px_1px_0_#0000001A] flex items-center justify-center"
          >
            <FaChevronLeft />
          </button>

          {!isComplete ? (
            <h1 className="text-[28px] font-semibold text-[#111827]">
              Mark Attendance
            </h1>
          ) : null}
        </div>

        {/* Banner */}
        {banner.show ? (
          <div className="mt-6 bg-[#E9FFE8] border border-[#22C55E] rounded-[26px] !px-6  !py-6 flex items-start gap-4">
            <div className="lg:w-16 lg:h-16 w-12 h-12 rounded-full border-[4px] border-[#15803D] flex items-center justify-center bg-white max-[768px]:!px-[6px]">
              <CheckCircle2 className="text-[#15803D] text-[30px]" size={30} />
            </div>
            <div>
              <p className="text-[22px] font-semibold text-[#15803D]">
                {banner.title}
              </p>
              <p className="text-[15px] text-[#374151] mt-2 leading-snug">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ) : null}

        {/* Cards for mobile based on process */}
        {!isComplete ? (
          <div className="mt-8">
            {isMarkedInOnly ? (
              <AttendanceCard
                title="Mark OUT"
                subtitle="Check-OUT when you leave"
                headerClass={outTheme.head}
                buttonClass={outTheme.btn}
                disabled={outDisabled || outLocked}
                lockReason={
                  outLocked ? "You must mark in before you can mark out" : null
                }
                empName={empName}
                empId={empId}
                photo={photoOut}
                onCapture={() =>
                  !(outDisabled || outLocked) && capturePhoto("out")
                }
                locationLabel={locationText}
                currentTime={currentTime}
                onMark={() => markAttendance("out")}
                markText={"Mark OUT"}
                videoRef={videoRef}
              />
            ) : (
              <AttendanceCard
                title="Mark IN"
                subtitle="Check-in for the day"
                headerClass={inTheme.head}
                buttonClass={inTheme.btn}
                disabled={inDisabled}
                lockReason={null}
                empName={empName}
                empId={empId}
                photo={photoIn}
                onCapture={() => !inDisabled && capturePhoto("in")}
                locationLabel={locationText}
                currentTime={currentTime}
                onMark={() => markAttendance("in")}
                markText={"Mark IN"}
                videoRef={videoRef}
              />
            )}
          </div>
        ) : null}

        {/* Instructions (always visible like screenshots) */}
        <div className="mt-8 bg-[#F1F5FF] border border-[#C7D7FF] rounded-[24px] p-6 shadow-[0_10px_30px_rgba(16,24,40,0.06)]">
          <h3 className="text-[22px] font-semibold text-[#111827]">
            Instructions
          </h3>
          <ul className="mt-5 space-y-4 text-[15px] text-[#4B5563] list-disc pl-6 leading-relaxed">
            <li>Mark in before 10:00 AM to avoid being marked as late</li>
            <li>You must mark in before you can mark out</li>
            <li>Photo verification is mandatory for both check-in and check-out</li>
            <li>Make sure your face is clearly visible in the photo</li>
          </ul>
        </div>
      </>
    );
  };


  const renderDesktopFlow = () => {
  return (
      <>
        {/* TITLE */}
        <div className="mt-8 flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white rounded-2xl shadow-[0_6px_18px_rgba(16,24,40,0.06)] border border-[#EDF2F7] flex items-center justify-center"
          >
            <FaChevronLeft />
          </button>

          <div>
            <h1 className="text-[26px] sm:text-[34px] font-semibold text-[#111827]">
              Mark Attendance
            </h1>
            <p className="text-[14px] text-[#6B7280] mt-1">
              Record your check-in & check-out time with photo verification
            </p>
          </div>
        </div>

        {/* STATUS BANNER */}
        {banner.show ? (
          <div className="mt-6 bg-[#E9FFE8] border border-[#22C55E] rounded-[22px] px-6 py-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#15803D] flex items-center justify-center bg-white">
              <CheckCircle2 className="text-[#15803D]" />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-[#15803D]">
                {banner.title}
              </p>
              <p className="text-[14px] text-[#374151] mt-1">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ) : null}

        {/* DESKTOP CARDS GRID */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceCard
            title="Mark IN"
            subtitle="Check-in for the day"
            headerClass={inTheme.head}
            buttonClass={inTheme.btn}
            disabled={inDisabled}
            lockReason={null}
            empName={empName}
            empId={empId}
            photo={photoIn}
            onCapture={() => !inDisabled && capturePhoto("in")}
            locationLabel={locationText}
            currentTime={currentTime}
            onMark={() => markAttendance("in")}
            markText={"Mark IN"}
            videoRef={videoRef}
          />

          <AttendanceCard
            title="Mark OUT"
            subtitle="Check-out when leave"
            headerClass={outTheme.head}
            buttonClass={outTheme.btn}
            disabled={outDisabled || outLocked}
            lockReason={outLocked ? "You must mark in before you can mark out" : null}
            empName={empName}
            empId={empId}
            photo={photoOut}
            onCapture={() => !(outDisabled || outLocked) && capturePhoto("out")}
            locationLabel={locationText}
            currentTime={currentTime}
            onMark={() => markAttendance("out")}
            markText={"Mark OUT"}
            videoRef={videoRef}
          />
        </div>

        {/* INSTRUCTIONS */}
        <div className="mt-8 bg-[#F1F5FF] border border-[#C7D7FF] rounded-[24px] p-6">
          <h3 className="text-[18px] font-semibold text-[#111827]">Instructions</h3>
          <ul className="mt-4 space-y-2 text-[14px] text-[#4B5563] list-disc pl-5">
            <li>Mark in before 10:00 AM to avoid being marked as late</li>
            <li>You must mark in before you can mark out</li>
            <li>Photo verification is mandatory for both check-in and check-out</li>
            <li>Make sure your face is clearly visible in the photo</li>
          </ul>
      </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">

        {/* TOP BAR (same for mobile/desktop) */}
        <div className="bg-white rounded-full px-6 py-4 flex justify-between items-center shadow-[0_8px_24px_rgba(16,24,40,0.06)] border border-[#EDF2F7]">
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-[#0D4CBA]">
            Athratech Pvt Limited
          </h2>

          <div className="flex items-center gap-3">
            <img
              src={
                user?.photo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || empName || "User")}`
              }
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
            />
          </div>
        </div>

        {/* FLOW */}
        {isDesktop ? renderDesktopFlow() : renderMobileFlow()}

        <canvas ref={canvasRef} className="hidden" />

        {/* LOADING OVERLAY */}
        {isLoading ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
              <p className="font-semibold text-[#111827]">Processing...</p>
              <p className="text-[13px] text-[#6B7280] mt-1">Please wait</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */
function AttendanceCard({
  title,
  subtitle,
  headerClass,
  buttonClass,
  disabled,
  lockReason,
  empName,
  empId,
  photo,
  onCapture,
  locationLabel,
  currentTime,
  onMark,
  markText,
  videoRef,
}) {
  return (
    <div className="bg-white rounded-[26px] border border-[#EDF2F7] shadow-[0_10px_30px_rgba(16,24,40,0.06)] overflow-hidden">
      {/* Header */}
      <div className={`${headerClass} text-white px-6 py-5 flex items-start gap-4`}>
        <div className="w-10 h-10 rounded-xl bg-white/25 border border-white/30" />
        <div>
          <h3 className="text-[20px] font-semibold leading-tight">{title}</h3>
          <p className="text-[13px] text-white/90 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {lockReason ? (
          <div className="mb-4 text-[13px] text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-3">
            {lockReason}
          </div>
        ) : null}

        {/* Mobile: stacked fields exactly like screenshot.
            Desktop: still fine (2 columns from sm+). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employee Name" value={empName} />
          <Field label="Employee ID" value={empId} />
        </div>

        {/* Capture */}
        <div className="mt-5">
          <p className="text-[14px] font-semibold text-[#111827] mb-2">Capture Photo</p>

          <div
            onClick={disabled ? undefined : onCapture}
            className={[
              "relative rounded-[18px] border border-[#E5E7EB] bg-[#F3F4F6]",
              "h-[280px] sm:h-[190px] overflow-hidden flex items-center justify-center",
              disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer",
            ].join(" ")}
          >
            {photo ? (
              <img src={photo} alt="captured" className="w-full h-full object-cover" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/90 border border-[#E5E7EB] flex items-center justify-center">
                    <Camera className="text-[#6B7280]" size={20} />
                  </div>
                  <p className="mt-3 text-[14px] text-[#6B7280]">Click to capture photo</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Location & time */}
        <div className="mt-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[18px] px-5 py-4">
          <p className="text-[13px] text-[#6B7280]">Current Time & Location :</p>
          <p className="text-[18px] font-semibold text-[#111827] mt-1">
            {locationLabel}, {currentTime}
          </p>
        </div>

        {/* Button */}
        <button
          disabled={disabled}
          onClick={disabled ? undefined : onMark}
          className={[
            "mt-6 w-full h-[56px] sm:h-[48px] rounded-[16px] text-white font-semibold text-[16px]",
            "shadow-[0_10px_20px_rgba(16,24,40,0.06)]",
            buttonClass,
            disabled ? "opacity-70 cursor-not-allowed" : "hover:brightness-[1.02] active:scale-[0.99]",
          ].join(" ")}
        >
          {markText} <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[16px] sm:text-[13px] font-semibold text-[#111827] mb-2">
        {label}
      </p>
      <input
        value={value || ""}
        disabled
        className="w-full h-[54px] sm:h-[44px] rounded-[14px] bg-[#F9FAFB] border border-[#E5E7EB] px-4 text-[16px] sm:text-[14px] text-[#111827] outline-none"
      />
    </div>
  );
}