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
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("jpg");
    const [downloadMessage, setDownloadMessage] = useState("");
    const isReady = status === "ready";
    const isGenerating = status === "generating";

    const showDownloadMessage = (format: DownloadFormat) => {
        setDownloadMessage(`Downloaded as ${format.toUpperCase()}.`);

        window.setTimeout(() => {
            setDownloadMessage("");
        }, 2000);
    };

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
            const padding = 50;
            canvas.width = size + padding * 2;
            canvas.height = size + padding * 2;

            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.drawImage(image, padding, padding, size, size);

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
            showDownloadMessage(downloadFormat);
            return;
        }

        await downloadRaster(svgElement, downloadFormat);
        showDownloadMessage(downloadFormat);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-gray-700">
                <h2 className="font-semibold text-slate-950 dark:text-gray-50">Preview</h2>
            </div>

            <div className={`flex min-h-64 items-center justify-center p-4 ${isReady ? "bg-emerald-100 dark:bg-gray-800" : "bg-slate-50 dark:bg-gray-800"}`}>
                {value ? (
                    <div ref={qrContainerRef} className="w-full max-w-xs rounded-lg bg-white p-4 shadow-sm">
                        <QRCode
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#111827"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={value}
                            viewBox="0 0 256 256"
                        />
                    </div>
                ) : (
                    <div className="text-center text-slate-400 dark:text-gray-400">
                        <p className="text-sm">No QR generated yet</p>
                    </div>
                )}
            </div>

            <div className="border-t border-slate-200 px-4 py-3 dark:border-gray-700">
                <div className="flex gap-2">
                    <select
                        value={downloadFormat}
                        onChange={(event) => setDownloadFormat(event.target.value as DownloadFormat)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                    >
                        <option value="svg">SVG</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!value}
                        className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
                    >
                        Download
                    </button>
                </div>
                <p className="mt-2 min-h-5 text-xs text-slate-500 dark:text-gray-400">{downloadMessage || "The QR code is saved with a white background."}</p>
            </div>
        </div>
    );
};

export default QRGenerator;