"use client";

import { useState } from "react";

function Form() {
  const [customText, setCustomText] = useState(
     "🌮 *Weekly HeyTaco Report* 🌮\n\n*Top Taco Receivers:*\n1. User1 - 10 tacos\n2. User2 - 8 tacos\n3. User3 - 7 tacos\n"
  );
  const [additionalText, setAdditionalText] = useState("Great job, team! 🎉");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sendReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/taco-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customText, additionalText }),
      });

      if (response.ok) {
        setStatus("Report sent successfully to Slack!");
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
    <form onSubmit={sendReport}>
      <textarea
        className="w-full p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        rows={8}
      />
       <textarea
        className="w-full p-2 border border-gray-700 rounded mb-4 bg-black/30 text-white"
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
      {status && <p className="mt-4 text-green-600">{status}</p>}
    </form>
  );
}

export default Form;
