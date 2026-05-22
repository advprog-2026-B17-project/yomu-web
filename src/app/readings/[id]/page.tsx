"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import Header from "@/components/Header";
import {
  apiRequest,
  apiRoutes,
  formatApiError,
  isApiError,
  QuestionDTO,
  QuizResultDTO,
  ReadingDTO,
} from "@/lib/api";

type Step = "reading" | "quiz" | "result";

export default function ReadingDetailPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [reading, setReading] = useState<ReadingDTO | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [step, setStep] = useState<Step>("reading");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResultDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [readingData, questionsData] = await Promise.all([
          apiRequest<ReadingDTO>(apiRoutes.readings.byId(id), { token }),
          apiRequest<QuestionDTO[]>(apiRoutes.readings.questions(id), {
            token,
          }),
        ]);

        setReading(readingData);
        setQuestions(questionsData);
        setAnswers(new Array(questionsData.length).fill(-1));
      } catch (err) {
        if (isApiError(err) && err.status === 401) {
          showToast(formatApiError(err, "Session expired"), "error");
          router.push("/login");
        } else if (isApiError(err) && err.status === 404) {
          showToast(formatApiError(err, "Bacaan tidak ditemukan"), "error");
        } else {
          showToast(formatApiError(err, "Gagal memuat data"), "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, id, router, showToast]);

  const submitQuiz = async () => {
    if (isSubmitting) return;
    if (answers.some((a) => a === -1)) {
      showToast("Jawab semua pertanyaan terlebih dahulu", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<QuizResultDTO>(
        apiRoutes.readings.submit(id),
        {
          method: "POST",
          token,
          body: { readingId: id, answers },
        },
      );
      setResult(data);
      setStep("result");
      showToast("Kuis berhasil disubmit!", "success");
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        showToast(formatApiError(err, "Session expired"), "error");
        router.push("/login");
      } else {
        showToast(formatApiError(err, "Gagal submit kuis"), "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  if (!reading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Bacaan tidak ditemukan
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {step === "reading" && (
          <div className="bg-white rounded-xl border p-8">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
              {reading.category?.name || "Umum"}
            </span>
            <h2 className="text-2xl font-bold mt-2 mb-6">{reading.title}</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{reading.content}</p>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep("quiz")}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Mulai Kuis
              </button>
            </div>
          </div>
        )}

        {step === "quiz" && (
          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-xl font-bold mb-6">Kuis: {reading.title}</h2>
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div key={q.id} className="border-b pb-4">
                  <p className="font-medium mb-3">
                    {qi + 1}. {q.questionText}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          answers[qi] === oi
                            ? "border-primary-500 bg-primary-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => {
                            const newAnswers = [...answers];
                            newAnswers[qi] = oi;
                            setAnswers(newAnswers);
                          }}
                          className="mr-3"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={submitQuiz}
                disabled={isSubmitting || answers.some((a) => a === -1)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mengirim..." : "Submit Kuis"}
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="text-6xl mb-4">
              {result.accuracy >= 0.8
                ? "🎉"
                : result.accuracy >= 0.5
                  ? "👍"
                  : "📚"}
            </div>
            <h2 className="text-2xl font-bold mb-2">Kuis Selesai!</h2>
            <p className="text-slate-600 mb-6">Skor kamu: {result.score}/100</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {result.score}
                </div>
                <div className="text-sm text-slate-500">Skor</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
                <div className="text-sm text-slate-500">Benar</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {(result.accuracy * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-slate-500">Akurasi</div>
              </div>
            </div>
            <button
              onClick={() => router.push("/readings")}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Pilih Bacaan Lain
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
