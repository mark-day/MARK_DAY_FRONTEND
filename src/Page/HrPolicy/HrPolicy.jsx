import React from 'react';

function HrPolicy() {
  return (
    <div className="w-screen h-screen p-0 m-0 overflow-hidden bg-gray-100">
      <object
        data="/hr-policy.pdf"
        type="application/pdf"
        className="w-full h-full"
      >
        <p className="text-center mt-10">
          Your browser does not support PDFs.{" "}
          <a href="/hr-policy.pdf" download className="text-blue-600 underline">
            Download the PDF instead.
          </a>
        </p>
      </object>

      <a
        href="/hr-policy.pdf"
        download="HR_Policy.pdf"
        className="fixed bottom-5 right-5 bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded shadow-lg z-50"
      >
        ⬇ Download PDF
      </a>
    </div>
  );
}

export default HrPolicy;
