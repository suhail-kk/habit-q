"use client";
import { fetchQuestions } from "@/services/questions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import QuestionsList from "@/component/QuestionsList";
import GlassQuestionSkeleton from "@/component/Skelton";
import Link from "next/link";

export default function Home() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["questions", page, limit],
    queryFn: () => fetchQuestions(page, limit),
    keepPreviousData: true,
  });

  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen flex flex-col items-start p-2 sm:p-3 md:p-6 landing-bg">
      <h1
        className="text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-transparent leading-tight z-0 select-none"
        style={{ fontSize: "clamp(6rem, 20vw, 20rem)", width: "80vw" }}
      >
        HabitQ
      </h1>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      {isLoading ? (
        <GlassQuestionSkeleton count={limit} /> // show skeleton while loading
      ) : (
        <QuestionsList
          data={data}
          answers={answers}
          submitted={submitted}
          handleSelect={(qid, option) =>
            setAnswers((prev) => ({ ...prev, [qid]: option }))
          }
          handleSubmit={(qid) =>
            setSubmitted((prev) => ({ ...prev, [qid]: true }))
          }
          setAnswers={setAnswers}
          setSubmitted={setSubmitted}
          page={page}
          setPage={setPage}
          limit={limit}
        />
      )}

      <Link target="_blank" href='https://suhailkk.web.app/' className="absolute bottom-2 right-2 text-xs text-gray-500">Credits:- SKK</Link>
    </div>
  );
}
