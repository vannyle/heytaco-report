"use client";

import { useState } from "react";

function Form() {
  const [customText, setCustomText] = useState(
     "🌮 *Weekly HeyTaco Report* 🌮\n\n*Top Taco Receivers:*"
  );
  const [additionalText, setAdditionalText] = useState("Great job, team! 🎉");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/taco-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customText, additionalText }),
      });

      if (response.ok) {
        setStatus("Report sent successfully to DM!");
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
      <label htmlFor="customText">Message Header</label>
      <textarea
        className="p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        rows={3}
      />
       <label htmlFor="additionalText">Message Footer</label>
       <textarea
        className="p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
        value={additionalText}
        onChange={(e) => setAdditionalText(e.target.value)}
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
