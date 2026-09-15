import React, { useMemo, useState } from "react";

/* =========================================================
   ATTENDANCE LIST
========================================================= */

const AttendanceList = ({
  employees = [],
  attendanceRecords = [],
  onEmployeeClick,
  onBack,
}) => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Single Date");

  /* =======================================================
     SAFE RECORDS
  ======================================================= */

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeAttendanceRecords = Array.isArray(attendanceRecords)
    ? attendanceRecords
    : [];

  /* =======================================================
     RECORDS
  ======================================================= */

  const records = useMemo(() => {
    if (safeAttendanceRecords.length > 0) {
      return safeAttendanceRecords;
    }

    return safeEmployees.map((employee) => ({
      employeeId: employee?.empId,
      employeeName: employee?.name,
      status: "Present",
    }));
  }, [safeEmployees, safeAttendanceRecords]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return records;

    return records.filter((record) => {
      return (
        String(record?.employeeName || "")
          .toLowerCase()
          .includes(value) ||
        String(record?.employeeId || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [records, search]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const presentCount = safeAttendanceRecords.length
    ? safeAttendanceRecords.filter(
        (item) =>
          String(item?.status || "").toLowerCase() === "present"
      ).length
    : 247;

  const absentCount = safeAttendanceRecords.length
    ? safeAttendanceRecords.filter(
        (item) =>
          String(item?.status || "").toLowerCase() === "absent"
      ).length
    : 220;

  const leaveCount = safeAttendanceRecords.length
    ? safeAttendanceRecords.filter((item) => {
        const status = String(item?.status || "").toLowerCase();

        return status === "on leave" || status === "leave";
      }).length
    : 27;

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setSearch("");
    setDateFilter("Single Date");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        w-full
        min-w-0
        overflow-x-hidden
        bg-[#F5F8FA]
        px-[16px]
        pb-[40px]
      

        sm:px-[24px]
        sm:pb-[50px]
    

        lg:px-[31px]
        lg:pb-[60px]
   
      "
    >
      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <section
        className="
          mb-[22px]
          flex
          w-full
          items-start
          gap-[14px]

          sm:mb-[26px]
          sm:gap-[20px]

          lg:gap-[30px]
        "
      >
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="
            mt-[1px]
            flex
            h-[46px]
            w-[46px]
            shrink-0
            items-center
            justify-center
            rounded-[14px]
            border
            border-[#E7EBEE]
            bg-white
            text-[#111111]
            shadow-[0_1px_3px_rgba(0,0,0,0.03)]
            transition
            duration-200
            hover:bg-[#FAFAFA]
            active:scale-[0.98]

            sm:h-[50px]
            sm:w-[50px]
            sm:rounded-[15px]

            lg:h-[50px]
            lg:w-[50px]
          "
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* TITLE */}

        <div className="min-w-0 flex-1">
          <h1
            className="
              !m-0
              text-[25px]
              font-bold
              leading-[31px]
              tracking-[-0.55px]
              text-[#202020]

              sm:text-[29px]
              sm:leading-[36px]

              lg:text-[32px]
              lg:leading-[38px]
              lg:tracking-[-0.7px]
            "
          >
            View Attendance
          </h1>

          <p
            className="
              m-0
              mt-[3px]
              text-[14px]
              leading-[20px]
              text-[#626262]

              sm:text-[15px]
              sm:leading-[22px]

              lg:text-[16px]
              lg:leading-6
            "
          >
            Monitor employee attendance records
          </p>
        </div>
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section
        className="
          mb-[20px]
          grid
          grid-cols-1
          gap-[10px]

          sm:grid-cols-2
          sm:gap-[12px]

          lg:grid-cols-[minmax(0,1fr)_267px_225px]
          lg:gap-[11px]
        "
      >
        {/* SEARCH */}

        <div
          className="
            flex
            h-[52px]
            min-w-0
            items-center
            rounded-[15px]
            border
            border-[#EDF0F2]
            bg-white
            px-[15px]
            text-[#7D7D7D]

            sm:h-[55px]
            sm:rounded-[16px]
            sm:px-[17px]

            lg:col-span-1
          "
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />

            <path
              d="M16 16L21 21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee name or ID..."
            className="
              h-full
              min-w-0
              w-full
              border-0
              bg-transparent
              pl-[11px]
              text-[14px]
              text-[#222222]
              outline-none
              placeholder:text-[#A5A5A5]

              sm:pl-[13px]
            "
          />
        </div>

        {/* DATE FILTER */}

        <div
          className="
            relative
            flex
            h-[52px]
            min-w-0
            items-center
            rounded-[15px]
            border
            border-[#EDF0F2]
            bg-white

            sm:h-[55px]
            sm:rounded-[16px]

            lg:col-span-1
          "
        >
          <select
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
            className="
              h-full
              w-full
              cursor-pointer
              appearance-none
              bg-transparent
              px-[14px]
              pr-[42px]
              text-[14px]
              text-[#777777]
              outline-none

              sm:px-4
              sm:pr-11
              sm:text-[16px]
            "
          >
            <option>Single Date</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>

          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            className="
              pointer-events-none
              absolute
              right-[13px]
              text-[#999999]

              sm:right-[14px]
            "
            aria-hidden="true"
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* RESET */}

        <button
          type="button"
          onClick={handleReset}
          className="
            h-[52px]
            w-full
            rounded-[15px]
            border-0
            bg-[#064A7E]
            px-[18px]
            text-[15px]
            font-medium
            text-white
            transition
            duration-200
            hover:bg-[#064575]
            active:scale-[0.99]

            sm:h-[55px]
            sm:rounded-[16px]
            sm:text-[16px]

            lg:text-[17px]
          "
        >
          Reset List
        </button>
      </section>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section
        className="
          mb-[20px]
          grid
          grid-cols-2
          gap-[10px]

          sm:gap-[14px]

          lg:mb-[23px]
          lg:grid-cols-4
          lg:gap-[22px]
        "
      >
        <SummaryCard
          title="Present"
          value={presentCount}
        />

        <SummaryCard
          title="Absent"
          value={absentCount}
        />

        <SummaryCard
          title="On Leave"
          value={leaveCount}
        />

        <SummaryCard
          title="Attendance Rate"
          value="1.2M"
        />
      </section>

      {/* =================================================
          DESKTOP / LARGE TABLE
      ================================================= */}

      <section
        className="
          hidden
          w-full
          overflow-hidden
          rounded-[25px]
          bg-white
          shadow-[0_1px_3px_rgba(0,0,0,0.07)]

          lg:block
        "
      >
        <div className="w-full overflow-x-auto">
          <table
            className="
              w-full
              min-w-[760px]
              table-fixed
              border-separate
              border-spacing-0
            "
          >
            <thead>
              <tr className="bg-[#E8F0F5]">
                <th
                  className="
                    h-[46px]
                    w-[15%]
                    rounded-tl-[25px]
                    px-6
                    text-left
                    text-[15px]
                    font-semibold
                    text-[#202020]
                  "
                >
                  Sr. No.
                </th>

                <th
                  className="
                    w-[26%]
                    px-6
                    text-left
                    text-[15px]
                    font-semibold
                    text-[#202020]
                  "
                >
                  Employee Name
                </th>

                <th
                  className="
                    w-[24%]
                    px-6
                    text-left
                    text-[15px]
                    font-semibold
                    text-[#202020]
                  "
                >
                  Employee ID
                </th>

                <th
                  className="
                    w-[20%]
                    px-6
                    text-left
                    text-[15px]
                    font-semibold
                    text-[#202020]
                  "
                >
                  Status
                </th>

                <th
                  className="
                    w-[15%]
                    rounded-tr-[25px]
                    px-6
                    text-left
                    text-[15px]
                    font-semibold
                    text-[#202020]
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record, index) => (
                <tr
                  key={`${record?.employeeId || "employee"}-${index}`}
                >
                  <td
                    className="
                      h-[48px]
                      border-b
                      border-[#E8E8E8]
                      pl-[42px]
                      pr-6
                      text-[14px]
                      text-[#202020]
                    "
                  >
                    {index + 1}.
                  </td>

                  <td
                    className="
                      h-[48px]
                      max-w-[220px]
                      border-b
                      border-[#E8E8E8]
                      px-6
                      text-[14px]
                      font-medium
                      text-[#202020]
                    "
                  >
                    <span className="block truncate">
                      {record?.employeeName || "—"}
                    </span>
                  </td>

                  <td
                    className="
                      h-[48px]
                      border-b
                      border-[#E8E8E8]
                      px-6
                      text-[14px]
                      text-[#202020]
                    "
                  >
                    {record?.employeeId || "—"}
                  </td>

                  <td
                    className="
                      h-[48px]
                      border-b
                      border-[#E8E8E8]
                      px-6
                    "
                  >
                    <StatusBadge status={record?.status} />
                  </td>

                  <td
                    className="
                      h-[48px]
                      border-b
                      border-[#E8E8E8]
                      px-6
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onEmployeeClick?.(
                          record?.employeeId
                        )
                      }
                      className="
                        bg-transparent
                        p-0
                        text-[13px]
                        text-[#1474D4]
                        underline
                        transition
                        hover:text-[#075CAE]
                      "
                    >
                      Calendar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="
                      h-[150px]
                      text-center
                      text-[14px]
                      text-[#777777]
                    "
                  >
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =================================================
          TABLET / MOBILE ATTENDANCE CARDS
      ================================================= */}

      <section
        className="
          block
          w-full

          lg:hidden
        "
      >
        {filteredRecords.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-[10px]

              sm:grid-cols-2
              sm:gap-[14px]
            "
          >
            {filteredRecords.map((record, index) => (
              <AttendanceMobileCard
                key={`${record?.employeeId || "employee"}-${index}`}
                record={record}
                index={index}
                onEmployeeClick={onEmployeeClick}
              />
            ))}
          </div>
        ) : (
          <div
            className="
              flex
              min-h-[180px]
              w-full
              items-center
              justify-center
              rounded-[22px]
              bg-white
              px-5
              text-center
              shadow-[0_1px_3px_rgba(0,0,0,0.07)]
            "
          >
            <div>
              <p
                className="
                  m-0
                  text-[15px]
                  font-medium
                  text-[#333333]
                "
              >
                No attendance records found
              </p>

              <p
                className="
                  m-0
                  mt-[5px]
                  text-[12px]
                  text-[#777777]
                "
              >
                Try changing your search.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({ title, value }) => {
  return (
    <article
      className="
        flex
        h-[108px]
        min-w-0
        items-center
        rounded-[20px]
        bg-white
        px-[14px]
        shadow-[0_1px_3px_rgba(0,0,0,0.08)]

        max-[380px]:h-[102px]
        max-[380px]:rounded-[18px]
        max-[380px]:px-[11px]

        sm:h-[102px]
        sm:rounded-[22px]
        sm:px-[18px]

        lg:h-[102px]
        lg:rounded-[25px]
        lg:px-[23px]
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-[48px]
          w-[48px]
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          bg-[#D9F8E5]
          text-[#13A13C]

          max-[380px]:h-[43px]
          max-[380px]:w-[43px]
          max-[380px]:rounded-[12px]

          sm:h-[52px]
          sm:w-[52px]

          lg:h-[55px]
          lg:w-[55px]
          lg:rounded-[15px]
        "
        aria-hidden="true"
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          className="
            max-[380px]:h-[22px]
            max-[380px]:w-[22px]
          "
        >
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M8 12L10.7 14.7L16 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* TEXT */}

      <div
        className="
          ml-[10px]
          min-w-0
          flex-1

          sm:ml-[13px]

          lg:ml-[15px]
        "
      >
        <span
          className="
            block
            truncate
            text-[13px]
            leading-[19px]
            text-[#202020]

            max-[380px]:text-[12px]

            sm:text-[14px]
            sm:leading-5
          "
        >
          {title}
        </span>

        <strong
          className="
            block
            truncate
            text-[25px]
            font-semibold
            leading-[30px]
            tracking-[-0.5px]
            text-[#202020]

            max-[380px]:text-[23px]
            max-[380px]:leading-[28px]

            sm:text-[27px]
            sm:leading-[31px]

            lg:text-[28px]
          "
        >
          {value}
        </strong>
      </div>
    </article>
  );
};

/* =========================================================
   MOBILE / TABLET ATTENDANCE CARD
========================================================= */

const AttendanceMobileCard = ({
  record,
  index,
  onEmployeeClick,
}) => {
  const employeeName = record?.employeeName || "—";
  const employeeId = record?.employeeId || "—";

  return (
    <article
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-[20px]
        border
        border-[#E8ECEF]
        bg-white
        p-[15px]
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]

        max-[380px]:rounded-[18px]
        max-[380px]:p-[13px]

        sm:rounded-[22px]
        sm:p-[17px]
      "
    >
      {/* TOP ROW */}

      <div
        className="
          flex
          min-w-0
          items-center
          justify-between
          gap-[12px]
        "
      >
        {/* EMPLOYEE */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-[11px]
          "
        >
          <div
            className="
              flex
              h-[40px]
              w-[40px]
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              bg-[#EAF2F7]
              text-[13px]
              font-semibold
              text-[#064A7E]

              max-[380px]:h-[36px]
              max-[380px]:w-[36px]
              max-[380px]:rounded-[10px]
            "
          >
            {index + 1}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                m-0
                truncate
                text-[14px]
                font-semibold
                leading-[20px]
                text-[#202020]

                max-[380px]:text-[13px]
              "
            >
              {employeeName}
            </p>

            <p
              className="
                m-0
                mt-[2px]
                truncate
                text-[12px]
                leading-[17px]
                text-[#777777]

                max-[380px]:text-[11px]
              "
            >
              {employeeId}
            </p>
          </div>
        </div>

        {/* STATUS */}

        <StatusBadge status={record?.status} />
      </div>

      {/* DIVIDER */}

      <div className="my-[13px] h-px w-full bg-[#EDF0F2]" />

      {/* BOTTOM */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-[12px]
        "
      >
        <div className="min-w-0">
          <p
            className="
              m-0
              text-[11px]
              leading-[16px]
              text-[#8A8A8A]
            "
          >
            Employee ID
          </p>

          <p
            className="
              m-0
              mt-[2px]
              truncate
              text-[13px]
              font-medium
              leading-[18px]
              text-[#333333]
            "
          >
            {employeeId}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onEmployeeClick?.(employeeId)
          }
          className="
            inline-flex
            h-[36px]
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            bg-[#F0F6FC]
            px-[13px]
            text-[12px]
            font-medium
            text-[#1474D4]
            transition
            hover:bg-[#E5F0FA]
            active:scale-[0.98]

            sm:h-[38px]
            sm:px-[15px]
            sm:text-[13px]
          "
        >
          View Calendar
        </button>
      </div>
    </article>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const normalized = String(
    status || "Present"
  ).toLowerCase();

  let classes =
    "bg-[#DCFBE7] text-[#18BB4A]";

  if (normalized === "absent") {
    classes =
      "bg-[#FFE0E0] text-[#FF4D4D]";
  }

  if (
    normalized === "on leave" ||
    normalized === "leave"
  ) {
    classes =
      "bg-[#FFF0C9] text-[#D89300]";
  }

  const displayStatus =
    status || "Present";

  return (
    <span
      className={`
        inline-flex
        h-[23px]
        min-w-[62px]
        max-w-[100px]
        items-center
        justify-center
        rounded-full
        px-[9px]
        text-[10px]
        font-medium
        leading-none
        ${classes}

        sm:h-[24px]
        sm:text-[11px]
      `}
    >
      <span className="truncate">
        {displayStatus}
      </span>
    </span>
  );
};

export default AttendanceList;