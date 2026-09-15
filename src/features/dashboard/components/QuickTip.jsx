import React from "react";
import { Lightbulb } from "lucide-react";

function QuickTip({
  title = "Quick Tip",
  message = "Mark your attendance before 10:00 AM to avoid being marked as late. Don't forget to mark out when leaving for the day!",
}) {
  return (
    <aside
      className="
        w-full
        rounded-[30px]
        border
        border-[#D1E4FF]
        bg-[#F2F7FF]
        px-5
        py-5
        shadow-[1px_1px_4px_0px_#0000001A]
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-6
      "
      aria-label={title}
    >
      <div
        className="
          flex
          w-full
          items-start
          gap-3
          sm:gap-3.5
        "
      >
        {/* =====================================================
            ICON
        ====================================================== */}
        <div
          className="
            flex
            text-[20px]
            shrink-0
            items-center
            justify-center
          "
          aria-hidden="true"
        >
          💡
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div
          className="
            min-w-0
            flex-1
            text-left
          "
        >
          <h3
            className="
              !m-0
              !text-left
              text-[20px]
              font-normal
              leading-[100%]
              tracking-[0%]
              text-[#222222]
              sm:text-[21px]
              sm:leading-[28px]
            "
          >
            {title} 
          </h3>

          <p
            className="
              m-0
              mt-[6px]
              max-w-[760px]
              text-left
              text-[14px]
              font-normal
              leading-[21px]
              text-[#606060]
              sm:text-[15px]
              sm:leading-[22px]
            "
          >
            {message}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default QuickTip;