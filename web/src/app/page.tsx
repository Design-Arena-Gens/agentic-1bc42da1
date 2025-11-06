"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { JsonTree, type JsonValue } from "@/components/json-tree";

const sampleData: JsonValue = {
  fileName: "fromj.json",
  lastSynced: "2024-06-28T22:17:00Z",
  customer: {
    id: "CUS-4185",
    name: "Skyline Bistro",
    contact: {
      name: "Morgan Patel",
      email: "morgan@skylinebistro.com",
      phone: "+1-415-555-0198",
    },
    location: {
      address: "201 Market Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
    },
    preferences: {
      currency: "USD",
      timezone: "America/Los_Angeles",
      notifications: ["email", "slack"],
    },
  },
  orders: [
    {
      orderId: "PO-78421",
      createdAt: "2024-06-27T14:05:00Z",
      status: "packing",
      expectedShipDate: "2024-06-29",
      lineItems: [
        {
          sku: "HB-12",
          title: "House Blend Beans",
          quantity: 18,
          unitPrice: 12.5,
          unit: "lb",
        },
        {
          sku: "FM-03",
          title: "French Press 1L",
          quantity: 6,
          unitPrice: 38,
        },
      ],
    },
    {
      orderId: "PO-78422",
      createdAt: "2024-06-28T17:42:00Z",
      status: "submitted",
      expectedShipDate: "2024-07-01",
      lineItems: [
        {
          sku: "SY-01",
          title: "Vanilla Syrup",
          quantity: 12,
          unitPrice: 9.75,
          unit: "bottle",
        },
        {
          sku: "SY-04",
          title: "Seasonal Maple Syrup",
          quantity: 10,
          unitPrice: 11.25,
          unit: "bottle",
        },
      ],
    },
  ],
  integrations: {
    quickbooks: {
      enabled: true,
      lastSync: "2024-06-28T12:11:00Z",
    },
    squarespace: {
      enabled: false,
      lastSync: null,
    },
  },
  tags: ["priority", "restaurant", "west-coast"],
};

const sampleText = JSON.stringify(sampleData, null, 2);

type JsonStats = {
  nodeCount: number;
  objectCount: number;
  arrayCount: number;
  primitiveCount: number;
  maxDepth: number;
};

const buildStats = (value: JsonValue, depth = 0): JsonStats => {
  if (value === null) {
    return {
      nodeCount: 1,
      objectCount: 0,
      arrayCount: 0,
      primitiveCount: 1,
      maxDepth: depth,
    };
  }

  if (Array.isArray(value)) {
    return value.reduce<JsonStats>(
      (acc, entry) => {
        const stats = buildStats(entry, depth + 1);
        return {
          nodeCount: acc.nodeCount + stats.nodeCount,
          objectCount: acc.objectCount + stats.objectCount,
          arrayCount: acc.arrayCount + stats.arrayCount,
          primitiveCount: acc.primitiveCount + stats.primitiveCount,
          maxDepth: Math.max(acc.maxDepth, stats.maxDepth),
        };
      },
      {
        nodeCount: 1,
        objectCount: 0,
        arrayCount: 1,
        primitiveCount: 0,
        maxDepth: depth,
      },
    );
  }

  if (typeof value === "object") {
    return Object.values(value).reduce<JsonStats>(
      (acc, entry) => {
        const stats = buildStats(entry, depth + 1);
        return {
          nodeCount: acc.nodeCount + stats.nodeCount,
          objectCount: acc.objectCount + stats.objectCount,
          arrayCount: acc.arrayCount + stats.arrayCount,
          primitiveCount: acc.primitiveCount + stats.primitiveCount,
          maxDepth: Math.max(acc.maxDepth, stats.maxDepth),
        };
      },
      {
        nodeCount: 1,
        objectCount: 1,
        arrayCount: 0,
        primitiveCount: 0,
        maxDepth: depth,
      },
    );
  }

  return {
    nodeCount: 1,
    objectCount: 0,
    arrayCount: 0,
    primitiveCount: 1,
    maxDepth: depth,
  };
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function Home() {
  const [jsonText, setJsonText] = useState(sampleText);
  const [data, setData] = useState<JsonValue>(sampleData);
  const [activeLabel, setActiveLabel] = useState("Sample dataset");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const stats = useMemo(() => buildStats(data), [data]);

  const parseAndLoad = (text: string, label: string) => {
    try {
      const parsed = JSON.parse(text) as JsonValue;
      setData(parsed);
      setActiveLabel(label);
      setError(null);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? `Unable to parse JSON: ${err.message}`
          : "Unable to parse JSON content.",
      );
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? "");
      setJsonText(text);
      parseAndLoad(text, file.name);
    };

    reader.onerror = () => {
      setError("Unable to read the selected file.");
    };

    reader.readAsText(file);
  };

  const handleTextParse = () => parseAndLoad(jsonText, "Manual input");

  const handleUseSample = () => {
    setJsonText(sampleText);
    parseAndLoad(sampleText, "Sample dataset");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-emerald-400">
            JSON workspace
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            fromj.json Visual Explorer
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            Load the data from{" "}
            <span className="font-semibold text-emerald-300">
              C:\Users\sbari\OneDrive\Desktop\fromj.json
            </span>{" "}
            or paste its contents to inspect structure, totals, and nested
            values.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Data Source
                  </h2>
                  <p className="text-sm text-slate-300">
                    Active:{" "}
                    <span className="font-medium text-emerald-300">
                      {activeLabel}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Updated {updatedAt.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-slate-100 shadow-sm transition hover:border-emerald-300/70 hover:text-emerald-200">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    Upload JSON
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSample}
                    className="rounded-full border border-transparent bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Load sample
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <textarea
                  value={jsonText}
                  onChange={(event) => setJsonText(event.target.value)}
                  spellCheck={false}
                  className="h-60 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-emerald-100 shadow-inner focus:border-emerald-400 focus:outline-none"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {error ? (
                    <p className="text-sm text-rose-300">{error}</p>
                  ) : (
                    <p className="text-sm text-slate-300">
                      Paste or edit JSON above, then parse to refresh the
                      explorer.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleTextParse}
                    className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                  >
                    Parse JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Structure</h2>
              <p className="mb-4 text-sm text-slate-300">
                Expand nodes to understand the nested hierarchy inside the file.
              </p>
              <JsonTree value={data} rootLabel="fromj.json" />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">
                Quick Snapshot
              </h2>
              <p className="mb-4 text-sm text-slate-300">
                Automatic metrics generated from the current document.
              </p>
              <dl className="grid gap-4">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">
                    Nodes scanned
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {formatNumber(stats.nodeCount)}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">
                    Objects
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {formatNumber(stats.objectCount)}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">
                    Arrays
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {formatNumber(stats.arrayCount)}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">
                    Primitive values
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {formatNumber(stats.primitiveCount)}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-300">
                    Max depth
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {stats.maxDepth}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-6 text-emerald-100 backdrop-blur">
              <h2 className="text-lg font-semibold text-emerald-100">
                Pro Tip
              </h2>
              <p className="text-sm leading-6">
                Drag and drop your production{" "}
                <span className="font-semibold">fromj.json</span> into the
                uploader, or paste an updated payload directly into the editor.
                The viewer refreshes instantly and preserves your previous input
                for quick iteration.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
