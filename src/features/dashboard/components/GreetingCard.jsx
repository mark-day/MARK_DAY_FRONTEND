import React from "react";

function GreetingCard({
  name = "User",
  greeting = "Good Morning",
}) {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section
      className="
        
        w-[413px]
        rounded-[24px]
        lg:rounded-[30px]
        xl:rounded-[30px]
        border
        border-[#E9EDF1]
        bg-white
        px-[40px]

        py-[27px]
        max-[768px]:!p-3
        max-[768px]:w-[277px]
        max-[768px]:max-h-[76px]
        min-[980px]:h-[104px]
        max-[768px]:mt-[12px]
       shadow-[1px_1px_4px_0px_#0000001A]

       
      "
    >
      {/* =====================================================
          GREETING
      ====================================================== */}
      <h1
        className="
          break-words
          flex
          !m-0
          max-[768px]:!text-[20px]
          min-[980px]:text-[32px]
          
          font-semibold
          leading-[32px]
          tracking-[-0.025em]
          text-[#161616]
          leading-[100%]
          lg:leading-[100%]
        "
      >
        {greeting}, {name}!{"  "}
       
          👋
        
      </h1>

      {/* =====================================================
          DATE
      ====================================================== */}
      <p
        className="
          mt-1
          text-[15px]
          max-[768px]:text-[12px]
          max-[768px]:font-400
          font-normal
          leading-[22px]
          text-[#666666]
          sm:text-[16px]
          sm:leading-6
          lg:text-[17px]
        "
      >
        {formattedDate}
      </p>
    </section>
  );
}

export default GreetingCard;