"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";

type QRGeneratorProps = {
    value: string;
    status: "dirty" | "ready" | "generating";
};

type DownloadFormat = "svg" | "png" | "jpg";

const QRGenerator = ({ value, status }: QRGeneratorProps) => {
    const qrContainerRef = useRef<HTMLDivElement | null>(null);
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("svg");
    const isReady = status === "ready";
    const isGenerating = status === "generating";

    const downloadSvg = (svgElement: SVGElement) => {
        const svgMarkup = new XMLSerializer().serializeToString(svgElement);
        const downloadUrl = URL.createObjectURL(new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }));
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = "qr-code.svg";
        link.click();

        URL.revokeObjectURL(downloadUrl);
    };

    const downloadRaster = async (svgElement: SVGElement, format: "png" | "jpg") => {
        const svgUrl = URL.createObjectURL(
            new Blob([new XMLSerializer().serializeToString(svgElement)], { type: "image/svg+xml;charset=utf-8" }),
        );

        try {
            const image = new Image();

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error("Unable to load the QR image."));
                image.src = svgUrl;
            });

            const canvas = document.createElement("canvas");
            const size = 1024;
            canvas.width = size;
            canvas.height = size;

            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            if (format === "jpg") {
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, size, size);
            }

            context.drawImage(image, 0, 0, size, size);

            const exportUrl = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
            const link = document.createElement("a");

            link.href = exportUrl;
            link.download = `qr-code.${format}`;
            link.click();
        } finally {
            URL.revokeObjectURL(svgUrl);
        }
    };

    const handleDownload = async () => {
        if (!value || !qrContainerRef.current) {
            return;
        }

        const svgElement = qrContainerRef.current.querySelector("svg");

        if (!svgElement) {
            return;
        }

        if (downloadFormat === "svg") {
            downloadSvg(svgElement);
            return;
        }

        await downloadRaster(svgElement, downloadFormat);
    };

    return (
        <aside className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Live preview</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {isReady ? "Generated and ready to download." : isGenerating ? "Updating the QR." : "Generate to refresh the preview."}
                    </p>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isReady ? "bg-emerald-100 text-emerald-700" : isGenerating ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                    {isReady ? "Generated" : isGenerating ? "Generating" : "Stale"}
                </span>
            </div>

            <div className={`mt-6 flex min-h-[20rem] items-center justify-center rounded-[2rem] border p-6 ${isReady ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"}`}>
                {value ? (
                    <div ref={qrContainerRef} className="w-full max-w-xs rounded-[1.5rem] bg-white p-5 shadow-sm">
                        <QRCode
                            size={256}
                            bgColor="#ffffff"
                            fgColor="#111827"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={value}
                            viewBox="0 0 256 256"
                        />
                    </div>
                ) : (
                    <div className="max-w-xs text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            <span className="text-xl font-semibold">QR</span>
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">Nothing to preview</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Add a value and generate to create the first QR code.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:w-36">
                    <span className="mr-3 text-slate-400 dark:text-slate-500">Format</span>
                    <select
                        value={downloadFormat}
                        onChange={(event) => setDownloadFormat(event.target.value as DownloadFormat)}
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                    >
                        <option value="svg">SVG</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!value}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white"
                >
                    Download {downloadFormat.toUpperCase()}
                </button>
            </div>
        </aside>
    );
};

export default QRGenerator;