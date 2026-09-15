import React from "react";
import { X, User, Mail, Phone, CalendarDays, Save } from "lucide-react";
import "../Admin.css";

const EditEmployeeModal = ({
  form,
  setForm,
  onSubmit,
  onCancel,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#101828]/45
        px-[16px]
        py-[24px]
        backdrop-blur-[2px]

        sm:px-[24px]
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <div
        className="
          relative
          box-border
          w-full
          max-w-[540px]
          overflow-hidden
          rounded-[24px]
          border
          border-[#E7EBF0]
          bg-white
          shadow-[0px_20px_60px_rgba(16,24,40,0.18)]

          sm:rounded-[28px]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-employee-title"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-[#EEF1F4]
            px-[20px]
            py-[20px]

            sm:px-[28px]
            sm:py-[24px]
          "
        >
          <div className="min-w-0 pr-[16px]">
            <div
              className="
                flex
                h-[44px]
                w-[44px]
                items-center
                justify-center
                rounded-[13px]
                bg-[#EEF5FF]
                text-[#013C74]

                sm:h-[48px]
                sm:w-[48px]
                sm:rounded-[14px]
              "
            >
              <User
                size={23}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <h3
              id="edit-employee-title"
              className="
                mt-[16px]
                text-[21px]
                font-[600]
                leading-[26px]
                tracking-[-0.025em]
                text-[#1F1F1F]

                sm:text-[25px]
                sm:leading-[30px]
              "
            >
              Edit Employee
            </h3>

            <p
              className="
                mt-[6px]
                text-[13px]
                font-[400]
                leading-[19px]
                text-[#667085]

                sm:text-[14px]
                sm:leading-[21px]
              "
            >
              Update employee information and save your changes.
            </p>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="
              flex
              h-[36px]
              w-[36px]
              shrink-0
              items-center
              justify-center
              rounded-[10px]
              border
              border-[#E7EBF0]
              bg-white
              text-[#667085]
              transition
              duration-150
              hover:border-[#D5DCE3]
              hover:bg-[#F7F9FB]
              hover:text-[#1F1F1F]
              focus:outline-none
              focus:ring-2
              focus:ring-[#013C74]/20

              sm:h-[40px]
              sm:w-[40px]
              sm:rounded-[11px]
            "
          >
            <X
              size={19}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div
          className="
            px-[20px]
            py-[20px]

            sm:px-[28px]
            sm:py-[24px]
          "
        >
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-[16px] sm:gap-y-[20px]">

            {/* NAME */}

            <div className="sm:col-span-2">
              <label
                htmlFor="employee-name"
                className="
                  mb-[7px]
                  block
                  text-[13px]
                  font-[500]
                  leading-[18px]
                  text-[#344054]
                "
              >
                Employee Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    left-[14px]
                    top-1/2
                    -translate-y-1/2
                    text-[#98A2B3]
                  "
                  aria-hidden="true"
                />

                <input
                  id="employee-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  className="
                    box-border
                    h-[46px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#D0D5DD]
                    bg-white
                    pl-[43px]
                    pr-[14px]
                    text-[14px]
                    font-[400]
                    text-[#1F1F1F]
                    outline-none
                    transition
                    placeholder:text-[#98A2B3]
                    focus:border-[#013C74]
                    focus:ring-4
                    focus:ring-[#013C74]/10

                    sm:h-[48px]
                  "
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="employee-email"
                className="
                  mb-[7px]
                  block
                  text-[13px]
                  font-[500]
                  leading-[18px]
                  text-[#344054]
                "
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    left-[14px]
                    top-1/2
                    -translate-y-1/2
                    text-[#98A2B3]
                  "
                  aria-hidden="true"
                />

                <input
                  id="employee-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@email.com"
                  className="
                    box-border
                    h-[46px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#D0D5DD]
                    bg-white
                    pl-[43px]
                    pr-[14px]
                    text-[14px]
                    font-[400]
                    text-[#1F1F1F]
                    outline-none
                    transition
                    placeholder:text-[#98A2B3]
                    focus:border-[#013C74]
                    focus:ring-4
                    focus:ring-[#013C74]/10

                    sm:h-[48px]
                  "
                />
              </div>
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="employee-phone"
                className="
                  mb-[7px]
                  block
                  text-[13px]
                  font-[500]
                  leading-[18px]
                  text-[#344054]
                "
              >
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    left-[14px]
                    top-1/2
                    -translate-y-1/2
                    text-[#98A2B3]
                  "
                  aria-hidden="true"
                />

                <input
                  id="employee-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="
                    box-border
                    h-[46px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#D0D5DD]
                    bg-white
                    pl-[43px]
                    pr-[14px]
                    text-[14px]
                    font-[400]
                    text-[#1F1F1F]
                    outline-none
                    transition
                    placeholder:text-[#98A2B3]
                    focus:border-[#013C74]
                    focus:ring-4
                    focus:ring-[#013C74]/10

                    sm:h-[48px]
                  "
                />
              </div>
            </div>

            {/* JOIN DATE */}

            <div className="sm:col-span-2">
              <label
                htmlFor="employee-hire-date"
                className="
                  mb-[7px]
                  block
                  text-[13px]
                  font-[500]
                  leading-[18px]
                  text-[#344054]
                "
              >
                Joining Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    left-[14px]
                    top-1/2
                    -translate-y-1/2
                    text-[#98A2B3]
                  "
                  aria-hidden="true"
                />

                <input
                  id="employee-hire-date"
                  type="date"
                  name="hireDate"
                  value={form.hireDate}
                  onChange={handleChange}
                  className="
                    box-border
                    h-[46px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#D0D5DD]
                    bg-white
                    pl-[43px]
                    pr-[14px]
                    text-[14px]
                    font-[400]
                    text-[#1F1F1F]
                    outline-none
                    transition
                    focus:border-[#013C74]
                    focus:ring-4
                    focus:ring-[#013C74]/10

                    sm:h-[48px]
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <div
          className="
            flex
            flex-col-reverse
            gap-[10px]
            border-t
            border-[#EEF1F4]
            bg-[#FAFBFC]
            px-[20px]
            py-[16px]

            sm:flex-row
            sm:justify-end
            sm:px-[28px]
            sm:py-[18px]
          "
        >
          {/* CANCEL */}

          <button
            type="button"
            onClick={onCancel}
            className="
              inline-flex
              h-[44px]
              w-full
              items-center
              justify-center
              rounded-[11px]
              border
              border-[#D0D5DD]
              bg-white
              px-[20px]
              text-[14px]
              font-[500]
              leading-[20px]
              text-[#344054]
              transition
              duration-150
              hover:bg-[#F7F9FB]
              focus:outline-none
              focus:ring-2
              focus:ring-[#013C74]/20

              sm:w-auto
              sm:min-w-[105px]
            "
          >
            Cancel
          </button>

          {/* UPDATE */}

          <button
            type="button"
            onClick={onSubmit}
            className="
              inline-flex
              h-[44px]
              w-full
              items-center
              justify-center
              gap-[8px]
              rounded-[11px]
              bg-[#013C74]
              px-[22px]
              text-[14px]
              font-[500]
              leading-[20px]
              text-white
              shadow-[0px_1px_2px_rgba(16,24,40,0.08)]
              transition
              duration-150
              hover:bg-[#02345F]
              active:scale-[0.99]
              focus:outline-none
              focus:ring-4
              focus:ring-[#013C74]/15

              sm:w-auto
              sm:min-w-[145px]
            "
          >
            <Save
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Update Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;