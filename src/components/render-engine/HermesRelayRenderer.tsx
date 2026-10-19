"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Zap,
  Send,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  Activity,
  ChevronDown,
} from "lucide-react";
import { SandboxAutoFixLens } from "@/components/ai/SandboxAutoFixLens";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "GRAPHQL";
export type RelayMode = "live" | "mock";
export type RequestTab = "headers" | "params" | "body" | "curl";
export type ResponseTab = "json" | "raw" | "headers";

export interface HeaderEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParamEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface HermesResponse {
  status: number;
  statusText: string;
  latencyMs: number;
  sizeBytes: number;
  timestamp: string;
  headers: Record<string, string>;
  data: unknown;
  rawText: string;
  error?: string | null;
}

interface HermesRelayRendererProps {
  initialCode?: string;
  language?: string;
  className?: string;
  onCodeChange?: (newCode: string) => void;
}

// Pre-seeded celestial presets for instant evaluation
export const HERMES_PRESETS: Record<string, { label: string; code: string; language: string }> = {
  telemetry_get: {
    label: "⚡ GET /api/celestial/telemetry",
    language: "http",
    code: `GET /api/celestial/telemetry?cluster=olympus-prime&node=alpha-01 HTTP/1.1
Host: api.olympus.celestial
Authorization: Bearer hermes_astral_token_99182
Accept: application/json
X-Hermes-Relay: celestial-gateway-v4`,
  },
  dispatch_post: {
    label: "⚡ POST /api/olympus/relay (cURL)",
    language: "curl",
    code: `curl -X POST https://api.olympus.celestial/api/v1/dispatch \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer selene_herald_token_482" \\
  -H "X-Hermes-Priority: high" \\
  -d '{
    "mission": "Apollo-Zephyr-IX",
    "target": "Mare Tranquillitatis",
    "burnDurationSeconds": 142.5,
    "thrustPercent": 96.8,
    "payloadStatus": "nominal"
  }'`,
  },
  graphql_query: {
    label: "⚡ GraphQL OrbitalGuidance Query",
    language: "graphql",
    code: `query GetOrbitalGuidance($missionId: ID!, $includeTelemetry: Boolean!) {
  mission(id: $missionId) {
    id
    name
    trajectory
    fuelReserveKg
    telemetry @include(if: $includeTelemetry) {
      velocityKmS
      angularMomentum
      thermalShieldStatus
    }
    crewManifest {
      name
      role
    }
  }
}

# Variables:
# {
#   "missionId": "selene-artemis-4",
#   "includeTelemetry": true
# }`,
  },
  selene_health: {
    label: "⚡ GET /api/health (Local Selene API)",
    language: "http",
    code: `GET /api/health HTTP/1.1
Host: localhost:3000
Accept: application/json
User-Agent: Selene-Hermes-Relay/1.0`,
  },
};

/**
 * Parses raw code into structured HTTP/GraphQL request components.
 */
function parseRequestCode(raw: string, lang = "http") {
  const code = raw.trim();
  let method: HttpMethod = "GET";
  let url = "/api/celestial/telemetry";
  const headers: HeaderEntry[] = [];
  const params: ParamEntry[] = [];
  let body = "";

  const isCurl = lang === "curl" || code.startsWith("curl");
  const isGraphQL = lang === "graphql" || code.includes("query ") || code.includes("mutation ");

  if (isGraphQL) {
    method = "GRAPHQL";
    url = "https://api.olympus.celestial/graphql";
    headers.push(
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      { id: "h2", key: "X-Hermes-Gateway", value: "olympus-federation", enabled: true }
    );

    // Extract query and variables
    const varSplit = code.split(/#\s*Variables:/i);
    body = varSplit[0].trim();
    return { method, url, headers, params, body, isGraphQL: true };
  }

  if (isCurl) {
    // Parse cURL command
    const methodMatch = code.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase() as HttpMethod;
    }

    const urlMatch = code.match(/curl(?:\s+-[A-Za-z]+|\s+--[A-Za-z0-9-]+)*(?:\s+['"]?)(https?:\/\/[^\s'"\\]+|\/[^\s'"\\]+)/i);
    if (urlMatch) {
      url = urlMatch[1];
    } else {
      const genericUrl = code.match(/https?:\/\/[^\s'"\\]+/i);
      if (genericUrl) url = genericUrl[0];
    }

    // Parse -H headers
    const headerRegex = /-H\s+["']([^"':]+):\s*([^"']+)["']/g;
    let hMatch: RegExpExecArray | null;
    let hId = 1;
    while ((hMatch = headerRegex.exec(code)) !== null) {
      headers.push({
        id: `h${hId++}`,
        key: hMatch[1].trim(),
        value: hMatch[2].trim(),
        enabled: true,
      });
    }

    // Parse -d / --data body
    const dataMatch = code.match(/(?:-d|--data(?:-raw)?)\s+['"]([\s\S]*?)['"](?:\s*\\|\s*$)/);
    if (dataMatch) {
      body = dataMatch[1].trim();
      if (!methodMatch) method = "POST";
    }

    // Extract query params from URL if present
    const qIndex = url.indexOf("?");
    if (qIndex !== -1) {
      const qString = url.slice(qIndex + 1);
      url = url.slice(0, qIndex);
      const searchParams = new URLSearchParams(qString);
      let pId = 1;
      searchParams.forEach((val, key) => {
        params.push({ id: `p${pId++}`, key, value: val, enabled: true });
      });
    }

    return { method, url, headers, params, body, isGraphQL: false };
  }

  // Parse RFC 7230 HTTP request
  const lines = code.split("\n");
  const firstLine = lines[0] ? lines[0].trim() : "";
  const firstMatch = firstLine.match(/^([A-Z]+)\s+([^\s]+)(?:\s+HTTP\/[0-9.]+)?$/i);

  if (firstMatch) {
    method = firstMatch[1].toUpperCase() as HttpMethod;
    url = firstMatch[2];
  } else if (firstLine.startsWith("http://") || firstLine.startsWith("https://") || firstLine.startsWith("/")) {
    url = firstLine;
  }

  let inBody = false;
  const bodyLines: string[] = [];
  let hId = 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (inBody) {
      bodyLines.push(line);
      continue;
    }

    if (line.trim() === "") {
      inBody = true;
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key.toLowerCase() !== "host") {
        headers.push({ id: `h${hId++}`, key, value: val, enabled: true });
      } else if (!url.startsWith("http")) {
        // Prepend host to relative URL
        url = `https://${val}${url.startsWith("/") ? "" : "/"}${url}`;
      }
    }
  }

  body = bodyLines.join("\n").trim();

  // Extract query params from URL if present
  const qIndex = url.indexOf("?");
  if (qIndex !== -1) {
    const qString = url.slice(qIndex + 1);
    url = url.slice(0, qIndex);
    const searchParams = new URLSearchParams(qString);
    let pId = 1;
    searchParams.forEach((val, key) => {
      params.push({ id: `p${pId++}`, key, value: val, enabled: true });
    });
  }

  return { method, url, headers, params, body, isGraphQL: false };
}

/**
 * Builds formatted cURL string from current request state.
 */
function buildCurlCommand(method: HttpMethod, url: string, headers: HeaderEntry[], params: ParamEntry[], body: string): string {
  let fullUrl = url;
  const enabledParams = params.filter((p) => p.enabled && p.key.trim());
  if (enabledParams.length > 0) {
    const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }

  let cmd = `curl -X ${method === "GRAPHQL" ? "POST" : method} "${fullUrl}"`;
  for (const h of headers.filter((h) => h.enabled && h.key.trim())) {
    cmd += ` \\\n  -H "${h.key}: ${h.value}"`;
  }
  if (body && (method === "POST" || method === "PUT" || method === "PATCH" || method === "GRAPHQL")) {
    const escaped = body.replace(/"/g, '\\"');
    cmd += ` \\\n  -d "${escaped}"`;
  }
  return cmd;
}

/**
 * Synthesizes mock celestial response for offline / Olympus Gateway mode.
 */
function synthesizeCelestialResponse(method: HttpMethod, url: string, body: string): unknown {
  const timestamp = new Date().toISOString();

  if (url.includes("graphql") || method === "GRAPHQL") {
    return {
      data: {
        mission: {
          id: "selene-artemis-4",
          name: "Artemis-Zephyr Trans-Lunar Injector",
          trajectory: "Hyperbolic Insertion (Apoapsis 384,400 km)",
          fuelReserveKg: 28450.4,
          telemetry: {
            velocityKmS: 10.92,
            angularMomentum: "0.002 rad/s",
            thermalShieldStatus: "nominal",
          },
          crewManifest: [
            { name: "Cmdr. Elena Vance", role: "Mission Commander" },
            { name: "Dr. Theron Thorne", role: "Astrodynamics Specialist" },
            { name: "Lt. Selene Brooks", role: "Telemetry & Systems Lead" },
          ],
        },
      },
      extensions: {
        gateway: "Hermes-Federated-GraphQL-v3",
        cost: 4,
        complexity: 12,
        cacheStatus: "HIT (ETS)",
      },
    };
  }

  if (url.includes("telemetry")) {
    return {
      gateway: "Hermes Olympus Gateway • Core Relay",
      cluster: "Olympus-Prime-Alpha",
      status: "OPTIMAL",
      relayTimestamp: timestamp,
      telemetry: {
        activeNodes: 16,
        throughput: "48,200 msg/s",
        packetDropRate: 0.00001,
        latencyAverageMs: 0.18,
        meshRouting: "Hermes-UDP-Multiplex",
        spacecraft: {
          vessel: "Apollo-Zephyr-IX",
          orbitAltitudeKm: 384400,
          inclinationDeg: 28.5,
          batteryLevelPct: 98.4,
          ionThrusterOutputPct: 94.2,
        },
      },
      audit: {
        authorizedBy: "Olympus-Federated-IAM",
        tokenScope: ["telemetry:read", "astrodynamics:execute"],
      },
    };
  }

  if (method === "POST" || method === "PUT") {
    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = { rawPayload: body };
    }

    return {
      success: true,
      transactionId: `hermes-tx-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      status: "DISPATCHED_TO_ORBIT",
      dispatchedAt: timestamp,
      acknowledgedNodes: ["node-alpha", "node-beta", "core-relay"],
      receivedPayload: parsedBody,
      receipt: {
        signature: "ed25519-hermes-olympus-verified",
        estimatedArrivalSeconds: 0.042,
      },
    };
  }

  return {
    message: "Hermes Relay • Gateway Request Acknowledged",
    url,
    method,
    timestamp,
    status: 200,
    headersReceived: {
      "x-hermes-relay": "olympus-core",
      "x-selene-engine": "hermes-relay-v1",
    },
  };
}

export function HermesRelayRenderer({
  initialCode = HERMES_PRESETS.telemetry_get.code,
  language = "http",
  className = "",
  onCodeChange,
}: HermesRelayRendererProps) {
  const parsedInit = useMemo(() => parseRequestCode(initialCode, language), [initialCode, language]);

  const [method, setMethod] = useState<HttpMethod>(parsedInit.method);
  const [url, setUrl] = useState<string>(parsedInit.url);
  const [headers, setHeaders] = useState<HeaderEntry[]>(parsedInit.headers);
  const [params, setParams] = useState<ParamEntry[]>(parsedInit.params);
  const [body, setBody] = useState<string>(parsedInit.body);
  const [mode, setMode] = useState<RelayMode>("live");

  const [activeReqTab, setActiveReqTab] = useState<RequestTab>(parsedInit.isGraphQL ? "body" : "headers");
  const [activeResTab, setActiveResTab] = useState<ResponseTab>("json");
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Response state
  const [response, setResponse] = useState<HermesResponse | null>(() => {
    // Default initial synthesized preview response
    const mockData = synthesizeCelestialResponse(parsedInit.method, parsedInit.url, parsedInit.body);
    return {
      status: 200,
      statusText: "OK",
      latencyMs: 14,
      sizeBytes: JSON.stringify(mockData).length,
      timestamp: new Date().toLocaleTimeString(),
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-hermes-gateway": "olympus-core-v4",
        "x-latency-ms": "14",
      },
      data: mockData,
      rawText: JSON.stringify(mockData, null, 2),
      error: null,
    };
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state back to raw code for parent editor
  const syncToEditor = (
    newMethod: HttpMethod,
    newUrl: string,
    newHeaders: HeaderEntry[],
    newParams: ParamEntry[],
    newBody: string
  ) => {
    if (!onCodeChange) return;

    if (newMethod === "GRAPHQL") {
      onCodeChange(newBody);
      return;
    }

    if (language === "curl") {
      onCodeChange(buildCurlCommand(newMethod, newUrl, newHeaders, newParams, newBody));
      return;
    }

    // Default HTTP
    let fullUrl = newUrl;
    const enabledParams = newParams.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length > 0) {
      const qs = enabledParams.map((p) => `${p.key}=${p.value}`).join("&");
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
    }

    let code = `${newMethod} ${fullUrl} HTTP/1.1\n`;
    for (const h of newHeaders.filter((h) => h.enabled && h.key.trim())) {
      code += `${h.key}: ${h.value}\n`;
    }
    if (newBody && (newMethod === "POST" || newMethod === "PUT" || newMethod === "PATCH")) {
      code += `\n${newBody}`;
    }
    onCodeChange(code);
  };

  // Dispatch API Request
  const handleDispatch = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build URL with query params
    let fullUrl = url;
    const enabledParams = params.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length > 0) {
      const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
    }

    // Headers map
    const headersMap: Record<string, string> = {};
    for (const h of headers.filter((h) => h.enabled && h.key.trim())) {
      headersMap[h.key] = h.value;
    }

    // Check if URL is simulated or mock mode is active
    const isMockUrl =
      mode === "mock" ||
      fullUrl.includes("api.olympus.celestial") ||
      (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://") && !fullUrl.startsWith("/"));

    if (isMockUrl) {
      // Simulate realistic network round-trip latency
      await new Promise((r) => setTimeout(r, 60 + Math.random() * 80));
      const endTime = performance.now();
      const mockData = synthesizeCelestialResponse(method, fullUrl, body);
      const rawText = JSON.stringify(mockData, null, 2);

      setResponse({
        status: method === "POST" ? 201 : 200,
        statusText: method === "POST" ? "Created" : "OK",
        latencyMs: Math.round(endTime - startTime),
        sizeBytes: new Blob([rawText]).size,
        timestamp: new Date().toLocaleTimeString(),
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-hermes-gateway": "olympus-core-v4",
          "x-powered-by": "Selene-Hermes-Relay",
          "access-control-allow-origin": "*",
        },
        data: mockData,
        rawText,
        error: null,
      });
      setIsLoading(false);
      return;
    }

    try {
      const fetchOptions: RequestInit = {
        method: method === "GRAPHQL" ? "POST" : method,
        headers: headersMap,
        signal: controller.signal,
      };

      if (body && (method === "POST" || method === "PUT" || method === "PATCH" || method === "GRAPHQL")) {
        fetchOptions.body = body;
      }

      const res = await fetch(fullUrl, fetchOptions);
      const endTime = performance.now();
      const rawText = await res.text();

      let parsedJson: unknown = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = null;
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        latencyMs: Math.round(endTime - startTime),
        sizeBytes: new Blob([rawText]).size,
        timestamp: new Date().toLocaleTimeString(),
        headers: resHeaders,
        data: parsedJson,
        rawText,
        error: !res.ok ? `HTTP ${res.status}: ${res.statusText}` : null,
      });
    } catch (err: unknown) {
      const endTime = performance.now();
      // On network failure or CORS block, fallback gracefully with diagnostic error
      const errMsg = err instanceof Error ? err.message : "Network Request Failed";

      // If CORS or local offline, provide helpful Hermes fallback
      const fallbackMock = synthesizeCelestialResponse(method, fullUrl, body);
      setResponse({
        status: 0,
        statusText: "Relay Notice / CORS Filtered",
        latencyMs: Math.round(endTime - startTime),
        sizeBytes: 0,
        timestamp: new Date().toLocaleTimeString(),
        headers: { "x-hermes-notice": "CORS restricted or target offline. Hermes Simulation shown." },
        data: fallbackMock,
        rawText: JSON.stringify(fallbackMock, null, 2),
        error: `${errMsg} — (Switch to Hermes Mock mode or check target endpoint CORS)`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = HERMES_PRESETS[presetKey];
    if (!preset) return;
    const parsed = parseRequestCode(preset.code, preset.language);
    setMethod(parsed.method);
    setUrl(parsed.url);
    setHeaders(parsed.headers);
    setParams(parsed.params);
    setBody(parsed.body);
    if (parsed.isGraphQL) setActiveReqTab("body");
    syncToEditor(parsed.method, parsed.url, parsed.headers, parsed.params, parsed.body);
  };

  const handleCopyCurl = () => {
    const cmd = buildCurlCommand(method, url, headers, params, body);
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyJson = () => {
    if (!response?.rawText) return;
    navigator.clipboard.writeText(response.rawText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Header operations
  const addHeader = () => {
    const next: HeaderEntry[] = [...headers, { id: `h${Date.now()}`, key: "", value: "", enabled: true }];
    setHeaders(next);
    syncToEditor(method, url, next, params, body);
  };

  const updateHeader = (id: string, field: "key" | "value" | "enabled", val: string | boolean) => {
    const next = headers.map((h) => (h.id === id ? { ...h, [field]: val } : h));
    setHeaders(next);
    syncToEditor(method, url, next, params, body);
  };

  const removeHeader = (id: string) => {
    const next = headers.filter((h) => h.id !== id);
    setHeaders(next);
    syncToEditor(method, url, next, params, body);
  };

  // Param operations
  const addParam = () => {
    const next: ParamEntry[] = [...params, { id: `p${Date.now()}`, key: "", value: "", enabled: true }];
    setParams(next);
    syncToEditor(method, url, headers, next, body);
  };

  const updateParam = (id: string, field: "key" | "value" | "enabled", val: string | boolean) => {
    const next = params.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    setParams(next);
    syncToEditor(method, url, headers, next, body);
  };

  const removeParam = (id: string) => {
    const next = params.filter((p) => p.id !== id);
    setParams(next);
    syncToEditor(method, url, headers, next, body);
  };

  // Prettify JSON Body
  const handlePrettifyBody = () => {
    try {
      const parsed = JSON.parse(body);
      const pretty = JSON.stringify(parsed, null, 2);
      setBody(pretty);
      syncToEditor(method, url, headers, params, pretty);
    } catch {
      // Keep as-is if invalid JSON
    }
  };

  // Method badge colors
  const methodColor = {
    GET: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    POST: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    PUT: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    DELETE: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    PATCH: "text-violet-400 bg-violet-500/10 border-violet-500/30",
    GRAPHQL: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
  }[method];

  // Filtered response text for search
  const displayedJson = useMemo(() => {
    if (!response?.rawText) return "";
    if (!searchFilter.trim()) return response.rawText;
    const lines = response.rawText.split("\n");
    return lines.filter((l) => l.toLowerCase().includes(searchFilter.toLowerCase())).join("\n");
  }, [response, searchFilter]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className={`relative flex flex-col rounded-2xl border border-amber-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl overflow-hidden font-sans text-slate-100 ${className}`}>
      {/* ⚡ Top Header Bar: Hermes Branding & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/25 text-slate-950 font-bold">
            <Zap className="h-5 w-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-white">⚡ Hermes Relay</span>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
                Olympus Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Interactive API & REST / GraphQL Playground</p>
          </div>
        </div>

        {/* Presets and Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Preset selector */}
          <div className="relative">
            <select
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="appearance-none rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 pr-7 text-xs text-slate-300 font-medium hover:border-amber-500/40 focus:outline-none focus:border-amber-500 transition-colors"
              defaultValue=""
            >
              <option value="" disabled>Load Preset...</option>
              {Object.entries(HERMES_PRESETS).map(([k, p]) => (
                <option key={k} value={k}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Live vs Mock Gateway Mode */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-medium">
            <button
              onClick={() => setMode("live")}
              className={`rounded-md px-2 py-1 transition-all flex items-center gap-1 ${
                mode === "live" ? "bg-amber-500 text-slate-950 font-semibold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="h-3 w-3" />
              Live Relay
            </button>
            <button
              onClick={() => setMode("mock")}
              className={`rounded-md px-2 py-1 transition-all flex items-center gap-1 ${
                mode === "mock" ? "bg-amber-500 text-slate-950 font-semibold shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3 w-3" />
              Celestial Mock
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 URL & Method Dispatch Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          {/* Method Selector */}
          <select
            value={method}
            onChange={(e) => {
              const m = e.target.value as HttpMethod;
              setMethod(m);
              syncToEditor(m, url, headers, params, body);
            }}
            aria-label="HTTP Method"
            className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all ${methodColor}`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="GRAPHQL">GRAPHQL</option>
          </select>

          {/* URL Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                syncToEditor(method, e.target.value, headers, params, body);
              }}
              placeholder="https://api.olympus.celestial/v1/telemetry"
              aria-label="Request URL"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Dispatch Button */}
          <button
            onClick={handleDispatch}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Dispatch Relay</span>
          </button>
        </div>
      </div>

      {/* 🧭 Main Two-Column Console: Request Config (Left) + Response Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 min-h-[380px]">
        {/* Left Column: Request Configuration */}
        <div className="flex flex-col bg-slate-950/40">
          {/* Request Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-3 pt-2 bg-slate-900/30">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveReqTab("headers")}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeReqTab === "headers"
                    ? "bg-slate-900 text-amber-300 border-t-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Headers ({headers.filter((h) => h.enabled).length})
              </button>
              <button
                onClick={() => setActiveReqTab("params")}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeReqTab === "params"
                    ? "bg-slate-900 text-amber-300 border-t-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Params ({params.filter((p) => p.enabled).length})
              </button>
              <button
                onClick={() => setActiveReqTab("body")}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeReqTab === "body"
                    ? "bg-slate-900 text-amber-300 border-t-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {method === "GRAPHQL" ? "Query & Variables" : "Payload (Body)"}
              </button>
              <button
                onClick={() => setActiveReqTab("curl")}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeReqTab === "curl"
                    ? "bg-slate-900 text-amber-300 border-t-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                cURL Snippet
              </button>
            </div>

            {activeReqTab === "body" && method !== "GET" && (
              <button
                onClick={handlePrettifyBody}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-mono pb-1"
              >
                Format JSON
              </button>
            )}
          </div>

          {/* Request Tab Contents */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[360px]">
            {/* Headers Tab */}
            {activeReqTab === "headers" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                  <span>KEY-VALUE HEADERS</span>
                  <button
                    onClick={addHeader}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Header
                  </button>
                </div>
                {headers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No request headers configured.</p>
                ) : (
                  headers.map((h) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => updateHeader(h.id, "enabled", e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                      <input
                        type="text"
                        value={h.key}
                        onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                        placeholder="Header Key (e.g. Content-Type)"
                        className="flex-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        type="text"
                        value={h.value}
                        onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                        placeholder="Value (e.g. application/json)"
                        className="flex-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                      <button
                        onClick={() => removeHeader(h.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Params Tab */}
            {activeReqTab === "params" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                  <span>URL QUERY PARAMETERS</span>
                  <button
                    onClick={addParam}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Param
                  </button>
                </div>
                {params.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No query parameters added to URL.</p>
                ) : (
                  params.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={(e) => updateParam(p.id, "enabled", e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                      <input
                        type="text"
                        value={p.key}
                        onChange={(e) => updateParam(p.id, "key", e.target.value)}
                        placeholder="Parameter Name"
                        className="flex-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => updateParam(p.id, "value", e.target.value)}
                        placeholder="Value"
                        className="flex-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                      <button
                        onClick={() => removeParam(p.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Body / Query Tab */}
            {activeReqTab === "body" && (
              <div className="h-full flex flex-col">
                <textarea
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    syncToEditor(method, url, headers, params, e.target.value);
                  }}
                  rows={10}
                  placeholder={
                    method === "GRAPHQL"
                      ? "query GetSpacecraft { spacecraft { id name } }"
                      : '{\n  "mission": "Apollo-Zephyr",\n  "status": "nominal"\n}'
                  }
                  className="w-full flex-1 rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs font-mono text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 leading-relaxed resize-none"
                />
              </div>
            )}

            {/* cURL Snippet Tab */}
            {activeReqTab === "curl" && (
              <div className="relative h-full">
                <pre className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
                  <code>{buildCurlCommand(method, url, headers, params, body)}</code>
                </pre>
                <button
                  onClick={handleCopyCurl}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Response Viewer & Telemetry */}
        <div className="flex flex-col bg-slate-950/60">
          {/* Response Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-2 bg-slate-900/40">
            <div className="flex items-center gap-2">
              {response?.status !== undefined && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold border ${
                    response.status >= 200 && response.status < 300
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : response.status >= 400
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
              )}
              {response && (
                <>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {response.latencyMs} ms
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {(response.sizeBytes / 1024).toFixed(2)} KB
                  </span>
                </>
              )}
            </div>

            {/* Response Sub-tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveResTab("json")}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  activeResTab === "json" ? "bg-slate-800 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setActiveResTab("raw")}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  activeResTab === "raw" ? "bg-slate-800 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                Raw
              </button>
              <button
                onClick={() => setActiveResTab("headers")}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  activeResTab === "headers" ? "bg-slate-800 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                Headers ({response ? Object.keys(response.headers).length : 0})
              </button>
            </div>
          </div>

          {/* Response Filter & Action Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5 bg-slate-900/20">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2 top-2 h-3 w-3 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search response keys or values..."
                className="w-full rounded-md bg-slate-900/90 border border-slate-800 pl-7 pr-2 py-0.5 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              onClick={handleCopyJson}
              disabled={!response}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors ml-2"
            >
              {copiedJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedJson ? "Copied" : "Copy Payload"}</span>
            </button>
          </div>

          {/* Response Content View */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[330px] font-mono text-xs">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <RefreshCw className="h-6 w-6 text-amber-400 animate-spin" />
                <span className="text-xs font-medium">Relaying request through Hermes celestial gateway...</span>
              </div>
            ) : response?.error && response.status === 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-amber-300 text-xs">
                  <span className="font-bold block mb-1">⚡ Hermes Relay Diagnostics</span>
                  <p>{response.error}</p>
                </div>
                {/* Fallback mock data */}
                <pre className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{displayedJson}</code>
                </pre>
              </div>
            ) : activeResTab === "headers" ? (
              <div className="space-y-1.5">
                {response && Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between border-b border-slate-900/80 pb-1 text-[11px]">
                    <span className="font-semibold text-amber-300/80">{k}:</span>
                    <span className="text-slate-300 text-right max-w-[280px] break-all">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-3 text-amber-200/90 overflow-x-auto leading-relaxed">
                <code>{displayedJson || response?.rawText || "No response received yet."}</code>
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Fix Lens overlay if any syntax error occurs */}
      {response?.error && response.status >= 400 && (
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <SandboxAutoFixLens
            errorMessage={response.error}
            code={body || url}
            language="http"
            onApplyFix={(fixed) => {
              setBody(fixed);
              syncToEditor(method, url, headers, params, fixed);
            }}
          />
        </div>
      )}
    </div>
  );
}
