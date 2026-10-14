interface Props {
    title: string;
    value: string;
    tone: "green" | "red" | "indigo";
    hint?: string;
}

const tones = {
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
};

export default function StatCard({ title, value, tone, hint }: Props) {
    return (
        <div className="card p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {title}
            </p>
            <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
            {hint && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            )}
        </div>
    );
}
