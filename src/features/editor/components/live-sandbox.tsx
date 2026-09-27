// src/features/editor/components/live-sandbox.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { VirtualFile } from "@/types/editor.types";
import { RefreshCw, Monitor, Tablet, Smartphone, Terminal, ShieldAlert } from "lucide-react";

interface LiveSandboxProps {
  files: VirtualFile[];
  activeFile: VirtualFile | null;
}

interface ConsoleLog {
  id: string;
  type: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: string;
}

export function LiveSandbox({ files }: LiveSandboxProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate bundled HTML payload
  const bundledHtml = useMemo(() => {
    const htmlFile = files.find((f) => f.path.endsWith(".html")) || files.find((f) => f.name.includes("index"));
    const cssFiles = files.filter((f) => f.path.endsWith(".css"));
    const jsFiles = files.filter((f) => f.path.endsWith(".js") || f.path.endsWith(".ts") || f.path.endsWith(".jsx") || f.path.endsWith(".tsx"));

    const combinedCss = cssFiles.map((f) => `/* ${f.path} */\n${f.content}`).join("\n\n");
    const combinedJs = jsFiles.map((f) => `// ${f.path}\ntry {\n${f.content}\n} catch (err) { console.error("Runtime Error in ${f.name}:", err.message); }`).join("\n\n");

    let baseHtml = htmlFile ? htmlFile.content : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sandbox Preview</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #0b0c10; color: #f6f6f8; }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

    // Script to intercept console logs and send to parent
    const consoleInterceptorScript = `
      <script>
        (function() {
          var _log = console.log, _warn = console.warn, _err = console.error;
          function send(type, args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              payload: {
                type: type,
                message: Array.from(args).map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
                timestamp: new Date().toLocaleTimeString()
              }
            }, '*');
          }
          console.log = function() { send('log', arguments); _log.apply(console, arguments); };
          console.warn = function() { send('warn', arguments); _warn.apply(console, arguments); };
          console.error = function() { send('error', arguments); _err.apply(console, arguments); };
          window.onerror = function(msg, url, line) {
            send('error', ['Error: ' + msg + ' (Line ' + line + ')']);
          };
        })();
      </script>
    `;

    // Inject interceptor, CSS, and JS into HTML
    if (baseHtml.includes("</head>")) {
      baseHtml = baseHtml.replace("</head>", `${consoleInterceptorScript}<style>${combinedCss}</style></head>`);
    } else {
      baseHtml = `${consoleInterceptorScript}<style>${combinedCss}</style>${baseHtml}`;
    }

    if (baseHtml.includes("</body>")) {
      baseHtml = baseHtml.replace("</body>", `<script>${combinedJs}</script></body>`);
    } else {
      baseHtml = `${baseHtml}<script>${combinedJs}</script>`;
    }

    return baseHtml;
  }, [files]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "SANDBOX_CONSOLE") {
        const logItem: ConsoleLog = {
          id: Math.random().toString(36).substring(7),
          ...e.data.payload,
        };
        setConsoleLogs((prev) => [...prev.slice(-49), logItem]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const viewportWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0C10] border-l border-[#232733] overflow-hidden">
      {/* Sandbox Controls Bar */}
      <div className="h-10 bg-[#16181F] border-b border-[#232733] px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-[#F6F6F8]">Live Sandbox</span>
        </div>

        {/* Viewport Resizer */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              viewport === "desktop" ? "bg-[#F59E0B] text-[#0B0C10]" : "text-neutral-400 hover:text-white"
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              viewport === "tablet" ? "bg-[#F59E0B] text-[#0B0C10]" : "text-neutral-400 hover:text-white"
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              viewport === "mobile" ? "bg-[#F59E0B] text-[#0B0C10]" : "text-neutral-400 hover:text-white"
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            setConsoleLogs([]);
            setKey((k) => k + 1);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reload</span>
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[#090A0D] flex justify-center overflow-auto p-4 relative">
        <iframe
          key={key}
          ref={iframeRef}
          srcDoc={bundledHtml}
          title="Sandbox Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
          className={`${viewportWidths[viewport]} h-full bg-white rounded-xl shadow-2xl transition-all border border-white/10`}
        />
      </div>

      {/* Interactive Sandbox Console Log Drawer */}
      <div className="h-40 border-t border-[#232733] bg-[#0E0F14] flex flex-col shrink-0">
        <div className="h-7 px-3 bg-[#16181F] border-b border-[#232733] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <Terminal className="w-3 h-3 text-[#38BDF8]" />
            Console Output ({consoleLogs.length})
          </span>
          {consoleLogs.length > 0 && (
            <button
              onClick={() => setConsoleLogs([])}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1">
          {consoleLogs.length === 0 ? (
            <div className="text-neutral-600 italic">No console logs outputted yet.</div>
          ) : (
            consoleLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 leading-relaxed ${
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "warn"
                    ? "text-[#F59E0B]"
                    : "text-neutral-300"
                }`}
              >
                <span className="text-neutral-600 text-[10px] shrink-0">{log.timestamp}</span>
                {log.type === "error" && <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                <span className="break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
