import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * FINAL AUDIT GENERATOR (offline)
 *
 * Reads every file in the repository (except excluded dirs and binary files),
 * applies deterministic static checks, and emits a markdown report with:
 * - per-file verdict: CLEAN or PROBLEMATIC
 * - exact line evidence (line numbers + matched excerpts)
 * - fix recommendations
 *
 * NOTE: "CLEAN" here means "no issues matched by these checks".
 * It does NOT imply functional correctness.
 */

const REPO_ROOT = path.resolve(process.cwd());

const OUT_PATH = path.join(REPO_ROOT, "docs", "FINAL_PRODUCTION_AUDIT_FRONTEND.md");

const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".vercel",
  ".vscode",
  ".idea",
  ".cursor",
]);

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB safety cap for text inspection

function isProbablyBinary(buffer) {
  // Null byte is a strong binary indicator.
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) return true;
  }
  return false;
}

function walk(dirAbs, out) {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dirAbs, ent.name);
    const rel = path.relative(REPO_ROOT, abs).replace(/\\/g, "/");

    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      // Also exclude nested node_modules/dist/build anywhere.
      if (EXCLUDE_DIRS.has(path.basename(abs))) continue;
      walk(abs, out);
      continue;
    }

    if (ent.isFile()) {
      out.push({ abs, rel });
    }
  }
}

function splitLines(text) {
  // Keep stable numbering across platforms.
  return text.replace(/\r\n/g, "\n").split("\n");
}

function matchRegex(lines, regex, label, maxMatches = 40) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (regex.test(line)) {
      hits.push({ line: i + 1, text: line, label });
      if (hits.length >= maxMatches) break;
    }
  }
  return hits;
}

function analyzeFile(rel, text) {
  const lines = splitLines(text);
  const findings = [];

  // Auth/session risks
  findings.push(
    ...matchRegex(lines, /\bwindow\.location\.(reload|replace|href)\b/, "Hard navigation/remount risk")
  );
  findings.push(
    ...matchRegex(lines, /__logout_initiated__/i, "Logout restore-prevention flag usage")
  );
  findings.push(
    ...matchRegex(lines, /\blocalStorage\.setItem\(\s*["'](access_token|token|refresh_token)["']/i, "Token persisted to storage (security)")
  );
  findings.push(
    ...matchRegex(lines, /\bapiClient\b.*\binterceptors\b/, "Axios interceptor present (refresh/cancel complexity)")
  );
  findings.push(
    ...matchRegex(lines, /\btryRefreshToken\b|\brefreshAccessToken\b/, "Custom token refresh implementation")
  );

  // React Query risks
  findings.push(
    ...matchRegex(lines, /\bqueryKey\s*:\s*\[[^\]]*\{/, "Query key contains object literal (stability risk)")
  );
  findings.push(
    ...matchRegex(lines, /\binvalidateQueries\(\s*\)/, "Global invalidateQueries() (over-invalidation risk)")
  );
  findings.push(
    ...matchRegex(lines, /\brefetchQueries\(/, "Manual refetchQueries() (storm risk)")
  );
  findings.push(
    ...matchRegex(lines, /\benabled\s*:\s*true\b|\benabled\s*:\s*!!/, "Enabled guard present (review for correctness)")
  );

  // Fetch/Api parsing risks
  findings.push(
    ...matchRegex(lines, /\bresponseType\s*:\s*['"]blob['"]/, "responseType passed (may be wrong for fetch-based client)")
  );

  // UI freeze/perf risks
  findings.push(
    ...matchRegex(lines, /from\s+["']exceljs["']|require\(["']exceljs["']\)/, "ExcelJS import (bundle + freeze risk)")
  );
  findings.push(
    ...matchRegex(lines, /from\s+["']framer-motion["']|<motion\./, "Framer-motion usage (perf review)")
  );
  findings.push(
    ...matchRegex(lines, /JSON\.stringify\(/, "JSON.stringify usage (perf + key stability review)")
  );

  // Forms/a11y
  findings.push(
    ...matchRegex(lines, /\btabIndex\s*=\s*\{-1\}/, "Keyboard accessibility suppression (tabIndex=-1)")
  );
  findings.push(
    ...matchRegex(lines, /aria-label\s*=\s*["'][^"']*["']/, "ARIA label present (spot-check)")
  );
  findings.push(
    ...matchRegex(lines, /<select\b(?![^>]*aria-label)/, "Select without aria-label (a11y risk)")
  );

  // Debug leftovers
  findings.push(
    ...matchRegex(lines, /\bconsole\.(log|debug|trace)\(/, "Console logging (prod noise / potential perf)")
  );

  // Deduplicate (same line/label)
  const seen = new Set();
  const deduped = [];
  for (const f of findings) {
    const key = `${f.line}:${f.label}:${f.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(f);
  }

  return {
    file: rel,
    verdict: deduped.length === 0 ? "CLEAN" : "PROBLEMATIC",
    findings: deduped,
  };
}

function mdEscape(s) {
  return s.replace(/\|/g, "\\|");
}

function render() {
  const files = [];
  walk(REPO_ROOT, files);

  const results = [];
  const skippedBinary = [];
  const skippedLarge = [];

  for (const f of files) {
    let stat;
    try {
      stat = fs.statSync(f.abs);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;

    if (stat.size > MAX_FILE_BYTES) {
      skippedLarge.push({ file: f.rel, size: stat.size });
      continue;
    }

    let buf;
    try {
      buf = fs.readFileSync(f.abs);
    } catch {
      continue;
    }
    if (isProbablyBinary(buf)) {
      skippedBinary.push({ file: f.rel, size: buf.length });
      continue;
    }

    const text = buf.toString("utf8");
    results.push(analyzeFile(f.rel, text));
  }

  // Sort by verdict then file path.
  results.sort((a, b) => {
    if (a.verdict !== b.verdict) return a.verdict === "PROBLEMATIC" ? -1 : 1;
    return a.file.localeCompare(b.file);
  });

  const problematic = results.filter((r) => r.verdict === "PROBLEMATIC");
  const clean = results.filter((r) => r.verdict === "CLEAN");

  const now = new Date();
  const header = [
    "# FINAL PRODUCTION AUDIT — Nexzen ERP Frontend",
    "",
    "> Generated offline by `tools/final-audit.mjs`.",
    `> Timestamp: ${now.toISOString()}`,
    `> Repo root: \`${REPO_ROOT.replace(/\\/g, "/")}\``,
    "",
    "## Methodology (non-negotiable constraints)",
    "",
    "- **Repository-wide read**: this report enumerates every file reachable under the repo root, excluding common build/deps folders, and skips binary/oversized files (listed explicitly).",
    "- **Deterministic static checks**: findings are based on concrete text matches with line evidence. No guesswork.",
    "- **Important limitation**: A file marked **CLEAN** only means **no issues were matched by these checks**; it does not prove functional correctness.",
    "",
    "## Coverage Summary",
    "",
    `- **Files analyzed (text)**: ${results.length}`,
    `- **Files flagged (problematic)**: ${problematic.length}`,
    `- **Files clean (by these checks)**: ${clean.length}`,
    `- **Files skipped (binary)**: ${skippedBinary.length}`,
    `- **Files skipped (too large > ${MAX_FILE_BYTES} bytes)**: ${skippedLarge.length}`,
    "",
  ];

  const coverage = [];
  if (skippedBinary.length > 0) {
    coverage.push("### Skipped binary files");
    coverage.push("");
    coverage.push("| File | Size (bytes) |");
    coverage.push("|---|---:|");
    for (const b of skippedBinary.sort((x, y) => x.file.localeCompare(y.file))) {
      coverage.push(`| \`${mdEscape(b.file)}\` | ${b.size} |`);
    }
    coverage.push("");
  }

  if (skippedLarge.length > 0) {
    coverage.push("### Skipped oversized files");
    coverage.push("");
    coverage.push("| File | Size (bytes) |");
    coverage.push("|---|---:|");
    for (const b of skippedLarge.sort((x, y) => x.file.localeCompare(y.file))) {
      coverage.push(`| \`${mdEscape(b.file)}\` | ${b.size} |`);
    }
    coverage.push("");
  }

  const riskTable = [];
  riskTable.push("## Production Risk Table (file-level)");
  riskTable.push("");
  riskTable.push("| File / Module | Issue (detected) | Severity | Impact | Fix Priority |");
  riskTable.push("|---|---|---|---|---|");
  for (const r of problematic) {
    const top = r.findings[0];
    const issue = top ? `${top.label} (line ${top.line})` : "Issues detected";
    // Default severity heuristic: auth/refresh/blob → Critical, reload/replace → High, others → Medium.
    const lc = (top?.label || "").toLowerCase();
    let severity = "Medium";
    if (lc.includes("token") || lc.includes("refresh") || lc.includes("logout")) severity = "Critical";
    if (lc.includes("responseType".toLowerCase())) severity = "Critical";
    if (lc.includes("hard navigation")) severity = "High";
    const impact = top ? top.label : "Multiple risks detected";
    const priority = severity === "Critical" ? "P0" : severity === "High" ? "P1" : "P2";
    riskTable.push(`| \`${mdEscape(r.file)}\` | ${mdEscape(issue)} | ${severity} | ${mdEscape(impact)} | ${priority} |`);
  }
  riskTable.push("");

  const perFile = [];
  perFile.push("## Per-file Findings (explicit CLEAN vs PROBLEMATIC)");
  perFile.push("");
  for (const r of results) {
    perFile.push(`### \`${r.file}\``);
    perFile.push("");
    perFile.push(`- **Verdict**: **${r.verdict}**`);
    if (r.findings.length === 0) {
      perFile.push("- **Evidence**: No matches for the configured zero-tolerance checks.");
      perFile.push("");
      continue;
    }
    perFile.push("- **Evidence**:");
    for (const f of r.findings.slice(0, 60)) {
      perFile.push(`  - **${f.label}**: line ${f.line} — \`${f.text.trim().slice(0, 220)}\``);
    }
    if (r.findings.length > 60) {
      perFile.push(`  - **…truncated**: ${r.findings.length - 60} more matches`);
    }
    perFile.push("");
    perFile.push("- **Safest fix direction**:");
    perFile.push("  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.");
    perFile.push("");
  }

  const out = [
    ...header,
    ...coverage,
    ...riskTable,
    ...perFile,
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, out, "utf8");

  return {
    outPath: OUT_PATH,
    analyzed: results.length,
    problematic: problematic.length,
    clean: clean.length,
    skippedBinary: skippedBinary.length,
    skippedLarge: skippedLarge.length,
  };
}

const summary = render();
process.stdout.write(
  JSON.stringify(
    {
      ok: true,
      ...summary,
      platform: process.platform,
      node: process.version,
      cpus: os.cpus()?.length ?? null,
    },
    null,
    2
  ) + "\n"
);

