function GlassQuestionSkeleton({ count = 3 }) {
    return (
        <div className="w-full max-w-2xl space-y-6 p-2">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="p-6 relative space-y-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_4px_20px_rgba(0,0,0,0.1)] animate-pulse"
                >
                    {/* Date */}
                    <div className="absolute top-2 right-3 h-4 w-16 bg-white/20 rounded"></div>

                    {/* Question */}
                    <div className="h-6 w-3/4 bg-white/20 rounded"></div>

                    {/* Options */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <li
                                key={i}
                                className="h-10 w-full bg-white/20 rounded-2xl border border-white/20"
                            ></li>
                        ))}
                    </ul>

                    {/* Submit/Reset Button */}
                    <div className="mt-4 h-10 w-full bg-white/20 rounded-2xl border border-white/20"></div>
                </div>
            ))}
        </div>
    );
}
export default GlassQuestionSkeleton;