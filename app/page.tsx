"use client";

import { useEffect, useRef, useState } from "react";
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
        document.documentElement.classList.toggle("dark", theme === "dark");
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
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-8">
                <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            QR code generator
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
                            Build a clean QR code in one focused step.
                        </h1>
                        <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                            Add one or more values, generate when you are ready, and download the final QR in the format you need.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/85 dark:text-slate-50 dark:hover:bg-slate-900"
                    >
                        <span className="text-base">{theme === "dark" ? "☀" : "☾"}</span>
                        {theme === "dark" ? "Light" : "Dark"} theme
                    </button>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <form
                        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_20px_70px_rgba(2,6,23,0.35)]"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleGenerate();
                        }}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Value inputs</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Start with one value. Add more only if you need them.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addField}
                                className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Add value
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <label htmlFor={`value-${field.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            Value {index + 1}
                                        </label>
                                        {fields.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => removeField(field.id)}
                                                className="text-sm font-medium text-slate-400 transition hover:text-rose-500"
                                            >
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>
                                    <input
                                        id={`value-${field.id}`}
                                        type="text"
                                        value={field.value}
                                        onChange={(event) => updateField(field.id, event.target.value)}
                                        placeholder={index === 0 ? "Enter text, URL, or any data" : "Additional value"}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                disabled={!draftValue || isGenerating}
                                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
                                        Generating
                                    </>
                                ) : (
                                    "Generate QR"
                                )}
                            </button>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Editing a field keeps the preview stale until you generate again.
                            </p>
                        </div>
                    </form>

                    <QRGenerator value={generatedValue} status={status} />
                </section>
            </div>
        </main>
    );
}