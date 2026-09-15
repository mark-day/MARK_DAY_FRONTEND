import { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineDownload } from "react-icons/ai";

const BASE_URL = "https://attendance-backend-final-4.onrender.com";

function Payslip() {
  const [form, setForm] = useState({
    empId: "",
    month: "",
    totalOfficeDays: "",
    presentDays: "",
    salary: "",
    leaveDays: "",
    absentDays: "",
    advance: "",
    food: "",
  });

  const [searchEmpId, setSearchEmpId] = useState("");
  const [payrolls, setPayrolls] = useState([]);
  const [empPayroll, setEmpPayroll] = useState(null);
  const [dMonth, setDMonth] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        month: form.month,
        totalOfficeDays: Number(form.totalOfficeDays || 0),
        presentDays: Number(form.presentDays || 0),
        salary: Number(form.salary || 0),
        leaveDays: Number(form.leaveDays || 0),
        absentDays: Number(form.absentDays || 0),
        advance: Number(form.advance || 0),
        food: Number(form.food || 0),
      };

      await axios.post(
        `${BASE_URL}/api/payroll/create-payroll/${form.empId}`,
        payload
      );

      alert("Payroll Added Successfully!");
      fetchAllPayrolls();

      setForm({
        empId: "",
        month: "",
        totalOfficeDays: "",
        presentDays: "",
        salary: "",
        leaveDays: "",
        absentDays: "",
        advance: "",
        food: "",
      });
    } catch (err) {
      alert("Error adding payroll");
    }
  };

  const handleDownload = async () => {
    if (!dMonth) {
      alert("Please select a month to download");
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/payroll/download/${dMonth}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payroll-${dMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  const fetchAllPayrolls = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/payroll`);
      setPayrolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayrollByEmpId = async () => {
    if (!searchEmpId) {
      alert("Please enter Employee ID");
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/payroll/payroll/${searchEmpId}`
      );
      setEmpPayroll(res.data);
    } catch (err) {
      alert("Error fetching payroll");
    }
  };

  useEffect(() => {
    fetchAllPayrolls();
  }, []);

  const months = [
    "January-2025", "February-2025", "March-2025", "April-2025",
    "May-2025", "June-2025", "July-2025", "August-2025",
    "September-2025", "October-2025", "November-2025", "December-2025",
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F7] px-6 pt-6 pb-10">

      {/* ================= TITLE ================= */}
      <div className="">
        <h1 className="text-[28px] font-semibold text-[#101828]">
          Payroll Management
        </h1>
        <p className="text-[14px] text-[#667085] mt-1">
          Generate and manage employee payroll
        </p>
      </div>

      {/* ================= ADD PAYROLL (UNCHANGED FIELDS) ================= */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4">

        <input
          type="text"
          name="empId"
          placeholder="Employee ID"
          value={form.empId}
          onChange={handleChange}
          required
            className="h-[44px] px-3 rounded-xl border border-[#E5E7EB] outline-none text-[14px]"
        />

          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            required
            className="h-[44px] px-3 rounded-xl border border-[#E5E7EB] outline-none text-[14px]"
          >
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          name="salary"
          placeholder="Monthly Salary"
          value={form.salary}
          onChange={handleChange}
          required
            className="h-[44px] px-3 rounded-xl border border-[#E5E7EB] outline-none text-[14px]"
          />

        <input
          type="number"
            name="presentDays"
            placeholder="Present Days"
            value={form.presentDays}
          onChange={handleChange}
            required
            className="h-[44px] px-3 rounded-xl border border-[#E5E7EB] outline-none text-[14px]"
        />



      </form>
      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">

        {/* HEADER BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-semibold text-[#101828]">
            All Employee Payroll
          </h2>

          <div className="flex gap-4 items-center ">
            <select
              value={dMonth}
              onChange={(e) => setDMonth(e.target.value)}
              className="h-[44px] px-4 rounded-xl bg-[#F2F4F7] text-[14px]"
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <button
              type="submit"
              className="h-[44px] max-w-[205px] w-full bg-[#023A6A] text-white rounded-xl text-[14px] font-medium"
            >
              + Add Payroll
            </button>

            <button
              onClick={handleDownload}
              className="h-[44px] flex gap-1.5 items-center rounded-xl bg-[#F2F4F7] text-[14px] whitespace-nowrap px-[39px]"
            >
              <AiOutlineDownload /> Download Sheet
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">

            <thead>
              <tr className="bg-[#EEF2F6] text-[#101828] font-semibold">
                <th className="px-4 py-3 text-left">Employee ID</th>
                <th className="px-4 py-3 text-left">Employee Name</th>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-left">Present</th>
                <th className="px-4 py-3 text-left">Leave</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-left">Advance</th>
                <th className="px-4 py-3 text-left">Net Pay</th>
              </tr>
            </thead>

            <tbody>
              {(empPayroll || payrolls).map((p, i) => (
                <tr
                  key={p._id || i}
                  className="border-b border-[#EAECF0]"
                >
                  <td className="px-4 py-3">10245</td>
                  <td className="px-4 py-3">John Agron</td>
                  <td className="px-4 py-3">{p.month}</td>
                  <td className="px-4 py-3">{p.presentDays}</td>
                  <td className="px-4 py-3">{p.leaveDays}</td>
                  <td className="px-4 py-3">₹{p.salary}</td>
                  <td className="px-4 py-3 text-red-500">₹{p.advance}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    ₹{p.netPayable?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}

export default Payslip;