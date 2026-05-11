"use client";

import { useEffect, useRef, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import QRGenerator from "./components/QRGenerator";

type Theme = "light" | "dark";

type QRField = {
    id: number;
    value: string;
};

const createField = (id: number): QRField => ({
    id,
    value: "",
});

export default function Home() {
    const [fields, setFields] = useState<QRField[]>([createField(1)]);
    const [generatedValue, setGeneratedValue] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [theme, setTheme] = useState<Theme>("light");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const draftValue = fields
        .map((field) => field.value.trim())
        .filter(Boolean)
        .join("\n");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) {
            setTheme(saved);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const status = isGenerating
        ? "generating"
        : generatedValue && generatedValue === draftValue
            ? "ready"
            : "dirty";

    const updateField = (id: number, value: string) => {
        setFields((currentFields) =>
            currentFields.map((field) => (field.id === id ? { ...field, value } : field)),
        );
    };

    const addField = () => {
        setFields((currentFields) => [...currentFields, createField(Date.now())]);
    };

    const removeField = (id: number) => {
        setFields((currentFields) =>
            currentFields.length === 1 ? currentFields : currentFields.filter((field) => field.id !== id),
        );
    };

    const handleGenerate = () => {
        if (!draftValue || isGenerating) {
            return;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setIsGenerating(true);

        timerRef.current = setTimeout(() => {
            setGeneratedValue(draftValue);
            setIsGenerating(false);
            timerRef.current = null;
        }, 250);
    };

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl space-y-2">
                        <h1 className="text-2xl font-bold text-slate-950 dark:text-gray-50">QREye</h1>
                        <p className="text-sm leading-6 text-slate-600 dark:text-gray-400">
                            QREye is a simple QR code generator for text and links. Type your content, generate the code,
                            and download it in the format you need.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700"
                    >
                        {theme === "dark" ? <FiSun className="text-base" /> : <FiMoon className="text-base" />}
                    </button>
                </div>

                <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                    <form
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleGenerate();
                        }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-950 dark:text-gray-50">Input</h2>
                            <button
                                type="button"
                                onClick={addField}
                                className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            id={`value-${field.id}`}
                                            type="text"
                                            value={field.value}
                                            onChange={(event) => updateField(field.id, event.target.value)}
                                            placeholder="Enter text or URL"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-600"
                                        />
                                    </div>
                                    {fields.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeField(field.id)}
                                            className="rounded-lg border border-slate-300 bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={!draftValue || isGenerating}
                            className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
                                    Generating...
                                </>
                            ) : (
                                "Generate"
                            )}
                        </button>
                    </form>

                    <QRGenerator value={generatedValue} status={status} />
                </section>
            </div>
        </main>
    );
}