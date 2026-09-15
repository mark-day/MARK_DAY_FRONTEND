import React from "react";

/**
 * AttendanceStatCard
 *
 * Dashboard attendance statistic card.
 *
 * Responsive behavior:
 * - Desktop: compact horizontal card
 * - Mobile: matches supplied Figma 2-column layout
 * - Never causes horizontal overflow
 * - Icon size scales with available card width
 *
 * Figma mobile:
 * - White background
 * - 24px radius
 * - 114px card height
 * - Large status icon block
 * - 15px label
 * - 30px value
 */

function AttendanceStatCard({
  icon: Icon,
  label,
  value,
  iconBackground = "#F0F6FC",
  iconColor = "#003F70",
}) {
  return (
    <article
      className="
        box-border
        flex
        h-[114px]
        w-full
        min-w-0
        items-center
        gap-4
        overflow-hidden
        rounded-[24px]
        border
        border-[#E9EDF1]
        bg-white
        px-4
        py-3
        shadow-[1px_1px_4px_0px_#0000001A]


        sm:px-5

        lg:px-6
        xl:px-7
      "
    >
      {/* =====================================================
          ICON
      ====================================================== */}

      <div
        className="
          flex
          h-[84px]
          w-[84px]
          min-w-[84px]
          shrink-0
          items-center
          justify-center
          rounded-[17px]

          max-[380px]:h-[70px]
          max-[380px]:w-[70px]
          max-[380px]:min-w-[70px]
          max-[380px]:rounded-[15px]

          sm:h-[72px]
          sm:w-[72px]
          sm:min-w-[72px]
          sm:rounded-[16px]

          lg:h-[60px]
          lg:w-[60px]
          lg:min-w-[60px]
          lg:rounded-[15px]
        "
        style={{
          backgroundColor: iconBackground,
          color: iconColor,
        }}
        aria-hidden="true"
      >
        {Icon ? (
          <Icon
            size={28}
            strokeWidth={1.9}
            className="
              shrink-0
              max-[380px]:h-6
              max-[380px]:w-6
              sm:h-[27px]
              sm:w-[27px]
            "
            aria-hidden="true"
          />
        ) : null}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          min-w-0
          flex-1
          overflow-hidden
        "
      >
        <p
          className="
            m-0
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
            text-[14px]
            font-normal
            leading-[21px]
            text-[#1A1A1A]

            max-[380px]:text-[14px]
            max-[380px]:leading-5
          "
        >
          {label}
        </p>

        <p
          className="
            m-0
            mt-[1px]
            truncate
            text-[28px]
            font-semibold
            leading-[36px]
            tracking-[-0.025em]
            text-[#222222]

            max-[380px]:text-[27px]
            max-[380px]:leading-8
          "
        >
          {value}
        </p>
      </div>
    </article>
  );
}

export default AttendanceStatCard;