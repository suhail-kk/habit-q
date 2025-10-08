"use client";
import { formatRelativeDate } from "@/utils/helper";

export default function QuestionsList({
    data,
    answers,
    submitted,
    handleSelect,
    handleSubmit,
    setAnswers,
    setSubmitted,
    page,
    setPage,
    limit,
}) {
    return (
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4 md:space-y-6 hide-scrollbar overflow-y-auto p-2">
            {data?.questions?.map((q, idx) => {
                const isSubmitted = submitted[idx];
                const selected = answers[idx];
                return (
                    <div key={idx} className="p-3 md:p-6 shadow glass-effect relative">
                        <p className="absolute top-2 right-3 text-xs text-white/70">
                            {formatRelativeDate(q?.date)}
                        </p>
                        <h2 className="font-semibold text-lg text-white mb-2">
                            {q?.question}
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            {q?.options?.map((opt, i) => {
                                let selectedClass = "";
                                if (isSubmitted) {
                                    if (opt === q.answer) selectedClass = "border-green-500 bg-green-50";
                                    else if (opt === selected) selectedClass = "border-red-500 bg-red-50";
                                    else selectedClass = "border-gray-300";
                                } else {
                                    selectedClass = selected === opt ? "border-blue-500 bg-blue-50" : "border-gray-300";
                                }

                                return (
                                    <li
                                        key={i}
                                        className={`p-2 border glass-effect-1 cursor-pointer text-white ${selectedClass}`}
                                        onClick={() => !isSubmitted && handleSelect(idx, opt)}
                                    >
                                        {opt}
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Reset button */}
                        {isSubmitted && (
                            <button
                                onClick={() => {
                                    setAnswers((prev) => ({ ...prev, [idx]: undefined }));
                                    setSubmitted((prev) => ({ ...prev, [idx]: false }));
                                }}
                                className="mt-4 px-6 py-2 w-full rounded-2xl font-medium text-white backdrop-blur-md bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_6px_30px_rgba(0,0,0,0.2)] active:scale-95"
                            >
                                Reset
                            </button>
                        )}

                        {!isSubmitted ? (
                            <button
                                onClick={() => handleSubmit(idx)}
                                disabled={!selected}
                                className="mt-4 px-6 py-2 w-full rounded-2xl font-medium text-white backdrop-blur-md bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_6px_30px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
                            >
                                Submit
                            </button>
                        ) : (
                            <div className="mt-4">
                                <p className="mt-2 text-sm text-white">
                                    Reason:- <i>{q?.reason}</i>
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Empty data message  */}
            {data?.questions?.length === 0 && (
                <div className="text-center text-white/70">
                    No questions available. Please check back later.
                </div>
            )}

            {/* Pagination Controls show only if data exist*/}
            {data?.questions?.length > 0 && (
                <div className="flex justify-center gap-2 items-center mt-4">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-6 py-2 rounded-2xl font-medium text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_6px_30px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
                    >
                        Previous
                    </button>

                    <span className="text-white">
                        Page {page} of {Math.ceil(data?.total / limit)}
                    </span>

                    <button
                        onClick={() =>
                            setPage((prev) =>
                                prev < Math.ceil(data?.total / limit) ? prev + 1 : prev
                            )
                        }
                        disabled={page >= Math.ceil(data?.total / limit)}
                        className="px-6 py-2 rounded-2xl font-medium text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_6px_30px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
