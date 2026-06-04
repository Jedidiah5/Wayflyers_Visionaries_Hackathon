export type ParsedStat =
  | { kind: "currency"; prefix: "£"; value: number; decimals: number }
  | { kind: "percent"; value: number; decimals: number }
  | { kind: "multiplier"; value: number; decimals: number }
  | { kind: "integer"; value: number };

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function parseStatValue(raw: string): ParsedStat {
  if (raw.endsWith("%")) {
    return {
      kind: "percent",
      value: parseFloat(raw.replace("%", "")),
      decimals: raw.includes(".") ? 1 : 0,
    };
  }

  if (raw.endsWith("x")) {
    return {
      kind: "multiplier",
      value: parseFloat(raw.replace("x", "")),
      decimals: (raw.split(".")[1] ?? "").replace("x", "").length || 2,
    };
  }

  if (raw.startsWith("£")) {
    let numeric = raw.slice(1).replace(/,/g, "").trim().toLowerCase();
    let scale = 1;

    if (numeric.endsWith("m")) {
      scale = 1_000_000;
      numeric = numeric.slice(0, -1);
    } else if (numeric.endsWith("k")) {
      scale = 1_000;
      numeric = numeric.slice(0, -1);
    }

    const base = parseFloat(numeric);
    const value = Number.isFinite(base) ? base * scale : 0;
    const decimals =
      scale === 1 && numeric.includes(".")
        ? numeric.split(".")[1]?.length ?? 0
        : 0;

    return {
      kind: "currency",
      prefix: "£",
      value,
      decimals,
    };
  }

  return {
    kind: "integer",
    value: parseInt(raw.replace(/,/g, ""), 10),
  };
}

function formatWithCommas(value: number, decimals: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatStatAtProgress(parsed: ParsedStat, progress: number): string {
  const current = parsed.value * progress;

  switch (parsed.kind) {
    case "currency":
      return `${parsed.prefix}${formatWithCommas(current, parsed.decimals)}`;
    case "percent":
      return `${formatWithCommas(current, parsed.decimals)}%`;
    case "multiplier":
      return `${formatWithCommas(current, parsed.decimals)}x`;
    case "integer":
      return formatWithCommas(Math.round(current), 0);
  }
}
