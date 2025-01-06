"use client";

import { useEffect, useState } from "react";
import { defaultFooterText, defaultHeaderText } from "src/app/utils/constants";

function Form() {
  const [headerText, setHeaderText] = useState(defaultHeaderText);
  const [footerText, setFooterText] = useState(defaultFooterText);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cachedHeaderText = localStorage.getItem("headerText");
    const cachedFooterText = localStorage.getItem("footerText");

    if (cachedHeaderText) setHeaderText(cachedHeaderText);
    if (cachedFooterText) setFooterText(cachedFooterText);
  }, []); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headerText, footerText }),
      });

      if (response.ok) {
        setStatus("Report sent successfully to DM!");
        setHeaderText(headerText);
        setFooterText(footerText);
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error}`);
      }
    } catch (error) {
      console.log(error);
      setStatus("Failed to send the report.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <form className="relative w-full flex flex-col gap-4" onSubmit={handleSubmit}>
      <label htmlFor="headerText">Message Header</label>
      <textarea
        className="p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
        value={headerText}
        onChange={(e) => setHeaderText(e.target.value)}
        rows={3}
      />
       <label htmlFor="footerText">Message Footer</label>
       <textarea
        className="p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
        value={footerText}
        onChange={(e) => setFooterText(e.target.value)}
        rows={3}
        placeholder="Additional text after top receivers"
      />
      <button
        className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Weekly Report"}
      </button>
      {status && <p className="mt-4 text-green-600 absolute top-full">{status}</p>}
    </form>
  );
}

export default Form;
