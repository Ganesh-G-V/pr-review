"use client";

import { useState } from "react";

type Finding = {
  id: number;
  severity: "High" | "Medium" | "Low";
  title: string;
  filePath: string;
  lineRange: string;
  explanation: string;
  suggestedFix: string;
  resolved: boolean;
};

const initialFindings: Finding[] = [
  // {
  //   id: 1,
  //   severity: "High",
  //   title: "Potential missing null validation",
  //   filePath: "src/services/userService.ts",
  //   lineRange: "42-58",
  //   explanation:
  //     "User object may be undefined before accessing nested properties, which could cause runtime exceptions.",
  //   suggestedFix:
  //     "Add null/undefined checks or use optional chaining before accessing user.profile.email.",
  //   resolved: false,
  // },
  // {
  //   id: 2,
  //   severity: "Medium",
  //   title: "Missing edge-case unit test",
  //   filePath: "tests/utils/formatters.test.ts",
  //   lineRange: "15-28",
  //   explanation:
  //     "The formatCurrency function is not tested for negative values or currency code edge cases.",
  //   suggestedFix:
  //     "Add unit tests covering negative numbers, zero values, and unsupported currency codes.",
  //   resolved: false,
  // },
];

const prData = {
  title: "Add user profile validation",
  prNumber: "#123",
  repository: "acme/web-app",
  author: "jane.doe",
  branch: {
    source: "feature/profile-validation",
    target: "main",
  },
};

export default function PRReviewPage() {
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [diff, setDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prUrl, setPrUrl] = useState("");
  const [fetching, setFetching] = useState(false);

  const toggleResolved = (id: number) => {
    setFindings((prev) =>
      prev.map((finding) =>
        finding.id === id ? { ...finding, resolved: !finding.resolved } : finding
      )
    );
  };


  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pr-review/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed");
      const mapped = (data.findings || []).map((f: { severity: Finding["severity"]; category?: string; title: string; filePath: string; lineRange?: string; evidence?: string; explanation: string; suggestedFix: string }, i: number) => ({ ...f, id: i + 1, resolved: false }));
      setFindings(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchPr = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/pr-review/fetch-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Fetch failed");
      setDiff(data.diff || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setFetching(false);
    }
  };

  const resolvedCount = findings.filter((f) => f.resolved).length;
  const totalCount = findings.length;

  const getSeverityStyles = (severity: Finding["severity"]) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Pull Request Review Assistant
          </h1>
        </header>

        <div className="mb-6 inline-flex items-center px-4 py-2 rounded-md bg-amber-50 border border-amber-200">
          <span className="text-sm font-semibold text-amber-800">
            Demo Data
          </span>
        </div>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pull Request Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="text-base text-gray-900 font-medium">
                {prData.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PR Number</p>
              <p className="text-base text-gray-900">{prData.prNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Repository</p>
              <p className="text-base text-gray-900">{prData.repository}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Author</p>
              <p className="text-base text-gray-900">{prData.author}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Branches</p>
              <p className="text-base text-gray-900">
                {prData.branch.source} → {prData.branch.target}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Review Summary
            </h2>
            <div className="text-sm text-gray-600">
              {resolvedCount} of {totalCount} findings resolved
            </div>
          </div>
        </section>


        <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GitHub Pull Request</h2>
          <input value={prUrl} onChange={(e) => setPrUrl(e.target.value)} placeholder="https://github.com/owner/repo/pull/123" className="w-full border border-gray-300 rounded-md p-3 text-sm" />
          <div className="mt-3">
            <button onClick={fetchPr} disabled={fetching} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50">{fetching ? "Fetching..." : "Fetch PR Diff"}</button>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Diff Analysis</h2>
          <textarea value={diff} onChange={(e) => setDiff(e.target.value)} rows={10} placeholder="Paste Git diff or code changes here..." className="w-full border border-gray-300 rounded-md p-3 font-mono text-sm" />
          <div className="mt-3 flex items-center gap-3">
            <button onClick={analyze} disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{loading ? "Analyzing..." : "Analyze Changes"}</button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Findings</h2>
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                finding.resolved
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityStyles(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>
                  <h3
                    className={`text-lg font-semibold ${
                      finding.resolved
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {finding.title}
                  </h3>
                </div>
                {finding.resolved && (
                  <span className="text-sm font-medium text-green-700">
                    Resolved
                  </span>
                )}
              </div>

              <div className="mb-3 text-sm text-gray-600">
                <span className="font-medium">{finding.filePath}</span>
                <span className="mx-2">•</span>
                <span>Lines {finding.lineRange}</span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Explanation
                </p>
                <p
                  className={`text-sm ${
                    finding.resolved ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {finding.explanation}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Suggested Fix
                </p>
                <p
                  className={`text-sm ${
                    finding.resolved ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {finding.suggestedFix}
                </p>
              </div>

              <button
                onClick={() => toggleResolved(finding.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  finding.resolved
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {finding.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
