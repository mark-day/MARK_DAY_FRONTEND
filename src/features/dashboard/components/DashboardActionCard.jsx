import React from "react";
import { ArrowRight } from "lucide-react";

function DashboardActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onClick,
}) {
  return (
    <article
      className="
        flex
        min-h-[248px]
        max-w-[326px]
        w-full
        flex-col
        rounded-[30px]
        bg-white
        p-[26px]
        shadow-[1px_1px_4px_0px_#0000001A]

        /* =====================================================
           TABLET — 769px to 1023px
           ===================================================== */

        min-[769px]:max-[1023px]:max-w-full
        min-[769px]:max-[1023px]:min-h-[220px]
        min-[769px]:max-[1023px]:rounded-[28px]
        min-[769px]:max-[1023px]:p-[22px]

        /* =====================================================
           MOBILE — 390px to 768px
           Same existing mobile design
           ===================================================== */

        max-[768px]:max-w-full
        max-[768px]:min-h-[178px]
        max-[768px]:rounded-[24px]
        max-[768px]:p-4

        /* =====================================================
           SMALL MOBILE — 346px to 389px
           Keep mobile design, only tighten spacing slightly
           ===================================================== */

        max-[389px]:min-h-[174px]
        max-[389px]:rounded-[23px]
        max-[389px]:p-[14px]

        /* =====================================================
           VERY SMALL — 345px and below
           ===================================================== */

        max-[345px]:min-h-[170px]
        max-[345px]:rounded-[22px]
        max-[345px]:p-[13px]
      "
    >
      {/* =====================================================
          ICON
      ====================================================== */}
      <div
        className="
          flex
          h-[56px]
          w-[56px]
          shrink-0
          items-center
          justify-center
          rounded-[15px]
          bg-[#EFF6FC]
          text-[#003059]
          shadow-[1px_0.5px_1px_0px_#0000001A]

          /* TABLET */
          min-[769px]:max-[1023px]:h-[52px]
          min-[769px]:max-[1023px]:w-[52px]
          min-[769px]:max-[1023px]:rounded-[14px]

          /* MOBILE — 390px to 768px */
          max-[768px]:!h-[40px]
          max-[768px]:!w-[40px]
          max-[768px]:rounded-[12px]

          /* SMALL MOBILE */
          max-[389px]:!h-[38px]
          max-[389px]:!w-[38px]
          max-[389px]:rounded-[11px]

          /* VERY SMALL */
          max-[345px]:!h-[36px]
          max-[345px]:!w-[36px]
          max-[345px]:rounded-[10px]
        "
        aria-hidden="true"
      >
        {Icon ? (
          <Icon
            size={27}
            strokeWidth={1.9}
            className="
              shrink-0

              /* TABLET */
              min-[769px]:max-[1023px]:!h-[25px]
              min-[769px]:max-[1023px]:!w-[25px]

              /* MOBILE */
              max-[768px]:!h-[16px]
              max-[768px]:!w-[16px]

              /* SMALL MOBILE */
              max-[389px]:!h-[16px]
              max-[389px]:!w-[16px]

              /* VERY SMALL */
              max-[345px]:!h-[15px]
              max-[345px]:!w-[15px]
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
          mt-8

          /* TABLET */
          min-[769px]:max-[1023px]:mt-6

          /* MOBILE */
          max-[768px]:mt-4

          /* SMALL MOBILE */
          max-[389px]:mt-[14px]

          /* VERY SMALL */
          max-[345px]:mt-[12px]
        "
      >
        <h3
          className="
            text-[22px]
            font-semibold
            !text-left
            leading-[100%]
            tracking-[0%]
            !text-[#222222]
            !m-0

            /* TABLET */
            min-[769px]:max-[1023px]:!text-[19px]
            min-[769px]:max-[1023px]:!leading-[23px]

            /* MOBILE */
            max-[768px]:!text-[14px]
            max-[768px]:!leading-[18px]

            /* SMALL MOBILE */
            max-[389px]:!text-[14px]
            max-[389px]:!leading-[17px]

            /* VERY SMALL */
            max-[345px]:!text-[12px]
            max-[345px]:!leading-[14px]
          "
        >
          {title}
        </h3>

        <p
          className="
            !mt-4
            max-w-[290px]
            text-[12px]
            font-normal
            leading-[100%]
            text-[#555555]

            /* TABLET */
            min-[769px]:max-[1023px]:!mt-3
            min-[769px]:max-[1023px]:max-w-[260px]
            min-[769px]:max-[1023px]:!text-[12px]
            min-[769px]:max-[1023px]:!leading-[16px]

            /* MOBILE */
            max-[768px]:!mt-4
            max-[768px]:!text-[10px]
            max-[768px]:!leading-[13px]

            /* SMALL MOBILE */
            max-[389px]:!mt-[12px]
            max-[389px]:!text-[10px]
            max-[389px]:!leading-[13px]
            max-[389px]:max-w-full

            /* VERY SMALL */
            max-[345px]:!mt-[8px]
            max-[345px]:!text-[9px]
            max-[345px]:!leading-[11px]
            max-[345px]:max-w-full
          "
        >
          {description}
        </p>
      </div>

      {/* =====================================================
          CTA
      ====================================================== */}
      <div
        className="
          mt-auto
          pt-8

          /* TABLET */
          min-[769px]:max-[1023px]:pt-6

          /* MOBILE */
          max-[768px]:!mt-0
          max-[768px]:!pt-[14px]

          /* SMALL MOBILE */
          max-[389px]:!pt-[12px]

          /* VERY SMALL */
          max-[345px]:!pt-[10px]
        "
      >
        <button
          type="button"
          onClick={onClick}
          className="
            inline-flex
            h-[44px]
            min-w-[157px]
            items-center
            justify-center
            gap-2
            rounded-[12px]
            bg-[#023A6A]
            px-5
            text-[14px]
            font-medium
            leading-[20px]
            text-white
            outline-none
            transition-colors
            duration-150
            hover:bg-[#00345C]
            focus-visible:ring-2
            focus-visible:ring-[#003F70]/30
            focus-visible:ring-offset-2
            active:bg-[#002F54]

            /* =================================================
               TABLET
            ================================================== */
            min-[769px]:max-[1023px]:h-[42px]
            min-[769px]:max-[1023px]:min-w-[145px]
            min-[769px]:max-[1023px]:rounded-[11px]
            min-[769px]:max-[1023px]:text-[13px]

            /* =================================================
               MOBILE — 390px to 768px
            ================================================== */
            max-[768px]:min-w-[136px]
            max-[768px]:h-[36px]
            max-[768px]:text-[12px]

            /* SMALL MOBILE */
            max-[389px]:min-w-[132px]
            max-[389px]:h-[35px]
            max-[389px]:text-[12px]
            max-[389px]:rounded-[11px]

            /* VERY SMALL */
            max-[345px]:!min-w-0
            max-[345px]:!w-full
            max-[345px]:!h-[32px]
            max-[345px]:!rounded-[9px]
            max-[345px]:!px-[8px]
            max-[345px]:!gap-[5px]
            max-[345px]:!text-[10px]
            max-[345px]:!leading-[13px]
          "
        >
          <span className="whitespace-nowrap">
            {buttonLabel}
          </span>

          <ArrowRight
            size={18}
            strokeWidth={2}
            className="
              shrink-0

              /* TABLET */
              min-[769px]:max-[1023px]:!h-[17px]
              min-[769px]:max-[1023px]:!w-[17px]

              /* MOBILE */
              max-[768px]:!h-[16px]
              max-[768px]:!w-[16px]

              /* VERY SMALL */
              max-[345px]:!h-[15px]
              max-[345px]:!w-[15px]
            "
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}

export default DashboardActionCard;