import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaRegCheckCircle, FaChevronLeft } from "react-icons/fa";
import "./AttendanceCalendar.css";

const BASE_URL =
  "https://attendance-backend-final-4.onrender.com";

/* =========================================================
   DATE HELPERS
========================================================= */

const parseApiDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    /*
      Important:
      YYYY-MM-DD must be parsed as LOCAL date.
      Otherwise JavaScript may convert it to UTC and
      shift the displayed day depending on timezone.
    */
    const dateOnlyMatch =
      value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const startOfDay = (value) => {
  const date = parseApiDate(value);

  if (!date) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

const getDateKey = (value) => {
  const date = startOfDay(value);

  if (!date) return "";

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isSameDate = (first, second) => {
  const firstKey = getDateKey(first);
  const secondKey = getDateKey(second);

  return Boolean(
    firstKey &&
      secondKey &&
      firstKey === secondKey
  );
};

/* =========================================================
   ATTENDANCE STATUS
========================================================= */

const getRecordStatus = (record) => {
  if (!record) return null;

  const rawStatus =
    record.status ??
    record.attendanceStatus ??
    record.attendance_status ??
    record.type ??
    record.markStatus ??
    record.markedAs ??
    record.state ??
    "";

  const status = String(rawStatus)
    .trim()
    .toLowerCase();

  /* =======================================================
     LATE
     Check this BEFORE present because some APIs may return
     status = "present" together with late=true.
  ======================================================= */

  const lateFlag =
    record.late === true ||
    record.isLate === true ||
    record.is_late === true ||
    record.lateStatus === true ||
    record.attendanceType === "late";

  if (
    lateFlag ||
    status === "late" ||
    status === "delayed" ||
    status === "late arrival" ||
    status === "late-arrival"
  ) {
    return "late";
  }

  /* =======================================================
     LEAVE
  ======================================================= */

  if (
    status === "leave" ||
    status === "on leave" ||
    status === "holiday leave" ||
    status === "paid leave" ||
    status === "unpaid leave"
  ) {
    return "leave";
  }

  /* =======================================================
     ABSENT
  ======================================================= */

  if (
    status === "absent" ||
    status === "absence"
  ) {
    return "absent";
  }

  /* =======================================================
     PRESENT
  ======================================================= */

  if (
    status === "present" ||
    status === "p" ||
    status === "in"
  ) {
    return "present";
  }

  /*
    Existing behavior:
    If an attendance record exists without a status,
    treat it as present.
  */
  return "present";
};

/* =========================================================
   COMPONENT
========================================================= */

const AttendanceCalendar = ({
  selectedEmployee,
  onBack,
  showNotification,
}) => {
  const today = useMemo(
    () => startOfDay(new Date()),
    []
  );

  const [attendance, setAttendance] =
    useState([]);

  const [holidays, setHolidays] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState(() =>
      startOfDay(new Date())
    );

  const [activeStartDate, setActiveStartDate] =
    useState(() => {
      const current = new Date();

      return new Date(
        current.getFullYear(),
        current.getMonth(),
        1
      );
    });

  const [
    attendanceLoading,
    setAttendanceLoading,
  ] = useState(false);

  const [
    holidaysLoading,
    setHolidaysLoading,
  ] = useState(false);

  /* =========================================================
     FETCH HOLIDAYS
  ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchHolidays = async () => {
      setHolidaysLoading(true);

      try {
        const response = await axios.get(
          `${BASE_URL}/api/holidays/get`,
          {
            signal: controller.signal,
          }
        );

        const normalizedHolidays = (
          response.data || []
        )
          .map((holiday) => ({
            ...holiday,
            date: parseApiDate(
              holiday.date
            ),
          }))
          .filter(
            (holiday) => holiday.date
          );

        setHolidays(
          normalizedHolidays
        );
      } catch (error) {
        if (
          error?.code ===
          "ERR_CANCELED"
        ) {
          return;
        }

        showNotification?.(
          "Failed to fetch holidays"
        );
      } finally {
        if (!controller.signal.aborted) {
          setHolidaysLoading(false);
        }
      }
    };

    fetchHolidays();

    return () => {
      controller.abort();
    };
  }, [showNotification]);

  /* =========================================================
     FETCH ATTENDANCE
  ========================================================= */

  useEffect(() => {
    if (!selectedEmployee) {
      setAttendance([]);
      return undefined;
    }

    const controller =
      new AbortController();

    const fetchAttendance = async () => {
      setAttendanceLoading(true);

      try {
        const response = await axios.get(
          `${BASE_URL}/api/admin/attendances`,
          {
            params: {
              empId: selectedEmployee,
            },
            signal: controller.signal,
          }
        );

        const normalizedAttendance = (
          response.data || []
        )
          .map((record) => ({
            ...record,
            date: parseApiDate(
              record.date
            ),
          }))
          .filter(
            (record) => record.date
          );

        setAttendance(
          normalizedAttendance
        );
      } catch (error) {
        if (
          error?.code ===
          "ERR_CANCELED"
        ) {
          return;
        }

        showNotification?.(
          "Failed to fetch attendance"
        );
      } finally {
        if (!controller.signal.aborted) {
          setAttendanceLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      controller.abort();
    };
  }, [
    selectedEmployee,
    showNotification,
  ]);

  /* =========================================================
     EMPLOYEE ATTENDANCE
  ========================================================= */

  const employeeAttendance = useMemo(() => {
    return attendance.filter(
      (record) =>
        String(record.empId) ===
        String(selectedEmployee)
    );
  }, [
    attendance,
    selectedEmployee,
  ]);

  /* =========================================================
     ATTENDANCE LOOKUP
  ========================================================= */

  const attendanceByDate = useMemo(() => {
    const map = new Map();

    employeeAttendance.forEach(
      (record) => {
        const key = getDateKey(
          record.date
        );

        if (!key) return;

        /*
          If duplicate records exist for the same date,
          the last record wins.
        */
        map.set(key, record);
      }
    );

    return map;
  }, [employeeAttendance]);

  /* =========================================================
     HOLIDAY LOOKUP
  ========================================================= */

  const holidayDates = useMemo(() => {
    const set = new Set();

    holidays.forEach((holiday) => {
      const key = getDateKey(
        holiday.date
      );

      if (key) {
        set.add(key);
      }
    });

    return set;
  }, [holidays]);

  /* =========================================================
     MONTH
  ========================================================= */

  const currentMonth =
    activeStartDate.getMonth();

  const currentYear =
    activeStartDate.getFullYear();

  const daysInMonth = useMemo(() => {
    return new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
  }, [
    currentMonth,
    currentYear,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let sunday = 0;
    let holidaysCount = 0;

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      const date = new Date(
        currentYear,
        currentMonth,
        day
      );

      const dateKey =
        getDateKey(date);

      /* Sunday */
      if (date.getDay() === 0) {
        sunday += 1;
        continue;
      }

      /* Holiday */
      if (
        holidayDates.has(dateKey)
      ) {
        holidaysCount += 1;
        continue;
      }

      const record =
        attendanceByDate.get(
          dateKey
        );

      if (record) {
        const status =
          getRecordStatus(record);

        if (status === "leave") {
          leave += 1;
        } else if (
          status === "absent"
        ) {
          absent += 1;
        } else {
          /*
            Late is still an attendance/present day.
            Therefore it is included in Present.
          */
          present += 1;
        }

        continue;
      }

      /*
        Past working day without attendance
        = absent.
      */
      if (
        startOfDay(date) < today
      ) {
        absent += 1;
      }
    }

    return {
      present,
      absent,
      leave,
      sunday,
      holidaysCount,
    };
  }, [
    attendanceByDate,
    currentMonth,
    currentYear,
    daysInMonth,
    holidayDates,
    today,
  ]);

  /* =========================================================
     MONTH NAVIGATION
  ========================================================= */

  const goPrevMonth = () => {
    setActiveStartDate(
      (previousDate) =>
        new Date(
          previousDate.getFullYear(),
          previousDate.getMonth() - 1,
          1
        )
    );
  };

  const goNextMonth = () => {
    setActiveStartDate(
      (previousDate) =>
        new Date(
          previousDate.getFullYear(),
          previousDate.getMonth() + 1,
          1
        )
    );
  };

  /* =========================================================
     CALENDAR TILE CLASS
  ========================================================= */

  const getCalendarTileClass = (
    date,
    view
  ) => {
    if (view !== "month") {
      return "";
    }

    const dateKey =
      getDateKey(date);

    const isCurrentMonth =
      date.getMonth() ===
        currentMonth &&
      date.getFullYear() ===
        currentYear;

    /*
      Neighboring months are hidden using
      showNeighboringMonth=false, but keep this
      defensive class for safety.
    */
    if (!isCurrentMonth) {
      return "calendar-disabled";
    }

    const classes = [];

    /* Selected */
    if (
      isSameDate(
        date,
        selectedDate
      )
    ) {
      classes.push(
        "calendar-selected"
      );
    }

    /* Sunday */
    if (date.getDay() === 0) {
      classes.push(
        "calendar-sunday"
      );

      return classes.join(" ");
    }

    /* Holiday */
    if (
      holidayDates.has(dateKey)
    ) {
      classes.push(
        "calendar-holiday"
      );

      return classes.join(" ");
    }

    /* Attendance */
    const record =
      attendanceByDate.get(
        dateKey
      );

    if (record) {
      const status =
        getRecordStatus(record);

      if (status === "late") {
        classes.push(
          "calendar-late"
        );
      } else if (
        status === "absent"
      ) {
        classes.push(
          "calendar-absent"
        );
      } else if (
        status === "leave"
      ) {
        classes.push(
          "calendar-leave"
        );
      } else {
        classes.push(
          "calendar-present"
        );
      }

      return classes.join(" ");
    }

    /*
      Past unmarked working day
      = absent.
    */
    if (
      startOfDay(date) < today
    ) {
      classes.push(
        "calendar-absent"
      );
    }

    return classes.join(" ");
  };

  /* =========================================================
     SUMMARY CARDS
  ========================================================= */

  const summaryItems = [
    {
      key: "present",
      label: "Present",
      value: summary.present,
      iconBackground: "#CEFFC7",
      iconShadow: true,
    },
    {
      key: "absent",
      label: "Absent",
      value: summary.absent,
      iconBackground: "#FADDD5",
      iconShadow: false,
    },
    {
      key: "leave",
      label: "Leave",
      value: summary.leave,
      iconBackground: "#FADDD5",
      iconShadow: false,
    },
    {
      key: "sunday",
      label: "Sunday",
      value: summary.sunday,
      iconBackground: "#FADDD5",
      iconShadow: false,
    },
    {
      key: "holidays",
      label: "Holidays",
      value: summary.holidaysCount,
      iconBackground: "#FADDD5",
      iconShadow: false,
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="attendance-page">

      {/* =====================================================
          HEADING
      ===================================================== */}

      <section className="attendance-heading">

        <button
          type="button"
          className="attendance-back-button"
          onClick={onBack}
          aria-label="Go back to attendance list"
        >
          <FaChevronLeft
            aria-hidden="true"
          />
        </button>

        <div className="attendance-heading-content">

          <h2>
            View Attendance
          </h2>

          <p>
            Scroll down to view attendance summary
          </p>

        </div>

      </section>

      {/* =====================================================
          CALENDAR
      ===================================================== */}

      <section className="calendar-card">

        <div className="calendar-header">

          <h3>
            {activeStartDate
              .toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              )
              .toUpperCase()}
          </h3>

          <div className="calendar-nav">

            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="calendar-nav-button"
            >
              <span aria-hidden="true">
                ‹
              </span>
            </button>

            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="calendar-nav-button"
            >
              <span aria-hidden="true">
                ›
              </span>
            </button>

          </div>

        </div>

        <div className="calendar-body">

          <Calendar
            value={selectedDate}
            activeStartDate={
              activeStartDate
            }

            onClickDay={(value) => {
              setSelectedDate(
                startOfDay(value)
              );
            }}

            onActiveStartDateChange={({
              activeStartDate:
                nextDate,
            }) => {
              if (!nextDate) return;

              setActiveStartDate(
                new Date(
                  nextDate.getFullYear(),
                  nextDate.getMonth(),
                  1
                )
              );
            }}

            showNavigation={false}
            showNeighboringMonth={false}

            tileClassName={({
              date,
              view,
            }) =>
              getCalendarTileClass(
                date,
                view
              )
            }

            prev2Label={null}
            next2Label={null}
            prevLabel={null}
            nextLabel={null}

            minDetail="month"
            maxDetail="month"
            locale="en-US"
          />

        </div>

      </section>

      {/* =====================================================
          ATTENDANCE SUMMARY
      ===================================================== */}

      <section className="attendance-summary">

        <h3 className="attendance-summary-title">
          Attendance Summary
        </h3>

        <div className="summary-grid">

          {summaryItems.map(
            (item) => (
              <article
                className="summary-card"
                key={item.key}
              >

                <div
                  className={`summary-icon-wrapper ${
                    item.iconShadow
                      ? "summary-icon-wrapper-present"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      item.iconBackground,
                  }}
                >

                  <FaRegCheckCircle
                    className="summary-icon"
                    aria-hidden="true"
                  />

                </div>

                <div className="summary-content">

                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {item.value}
                  </strong>

                </div>

              </article>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {(attendanceLoading ||
        holidaysLoading) && (
        <span
          className="attendance-loading"
          aria-live="polite"
        >
          Updating attendance…
        </span>
      )}

    </div>
  );
};

export default AttendanceCalendar;