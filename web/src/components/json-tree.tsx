"use client";

import { useId } from "react";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonNodeProps = {
  name: string | null;
  value: JsonValue;
  depth: number;
  isLast: boolean;
};

const isObject = (
  value: JsonValue,
): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isArray = (value: JsonValue): value is JsonValue[] =>
  Array.isArray(value);

export function JsonTree({
  value,
  rootLabel = "root",
}: {
  value: JsonValue;
  rootLabel?: string;
}) {
  const rootId = useId();

  return (
    <div
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      data-root-id={rootId}
    >
      <JsonNode name={rootLabel} value={value} depth={0} isLast />
    </div>
  );
}

function JsonNode({ name, value, depth, isLast }: JsonNodeProps) {
  if (isObject(value)) {
    const entries = Object.entries(value);
    const sizeLabel = `${entries.length} ${entries.length === 1 ? "field" : "fields"}`;

    return (
      <details
        open={depth < 2}
        className="group border-l border-zinc-200 pl-3 dark:border-zinc-700"
      >
        <summary className="cursor-pointer select-none text-sm font-medium text-zinc-700 marker:text-zinc-500 group-open:text-zinc-900 dark:text-zinc-200 dark:group-open:text-zinc-50">
          {name ? <span className="mr-1 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{name}</span> : null}
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            Object
          </span>
          <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
            {sizeLabel}
          </span>
        </summary>
        <div className="mt-2 space-y-1">
          {entries.map(([childName, childValue], index) => (
            <JsonNode
              key={childName}
              name={childName}
              value={childValue}
              depth={depth + 1}
              isLast={index === entries.length - 1}
            />
          ))}
        </div>
      </details>
    );
  }

  if (isArray(value)) {
    return (
      <details
        open={depth < 2}
        className="group border-l border-zinc-200 pl-3 dark:border-zinc-700"
      >
        <summary className="cursor-pointer select-none text-sm font-medium text-indigo-600 marker:text-zinc-500 dark:text-indigo-300">
          {name ? (
            <span className="mr-1 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              {name}
            </span>
          ) : null}
          Array
          <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
            {value.length} {value.length === 1 ? "item" : "items"}
          </span>
        </summary>
        <div className="mt-2 space-y-1">
          {value.map((childValue, index) => (
            <JsonNode
              key={`${name ?? "item"}-${index}`}
              name={`[${index}]`}
              value={childValue}
              depth={depth + 1}
              isLast={index === value.length - 1}
            />
          ))}
        </div>
      </details>
    );
  }

  return (
    <div className="flex items-baseline gap-2 border-l border-dashed border-zinc-200 pl-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
      {name ? (
        <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {name}
        </span>
      ) : null}
      <JsonPrimitive value={value} />
      {isLast ? null : (
        <span className="text-zinc-400 dark:text-zinc-500">,</span>
      )}
    </div>
  );
}

function JsonPrimitive({ value }: { value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }> }) {
  switch (typeof value) {
    case "string":
      return (
        <span className="font-mono text-amber-600 dark:text-amber-300">
          {`"${value}"`}
        </span>
      );
    case "number":
      return (
        <span className="font-mono text-emerald-600 dark:text-emerald-300">
          {value}
        </span>
      );
    case "boolean":
      return (
        <span className="font-mono text-purple-600 dark:text-purple-300">
          {value.toString()}
        </span>
      );
    case "object":
      return <span className="font-mono text-pink-600 dark:text-pink-300">null</span>;
    default:
      return (
        <span className="font-mono text-zinc-500 dark:text-zinc-400">
          unsupported
        </span>
      );
  }
}
