"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BiArrowBack, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { createClient } from "@supabase/supabase-js";

// IMPORT UTILITY BARU
import { getQuestionsForModule, selectRandomQuestions, QuizQuestion } from '@/lib/quiz-utils'; 

// --- KONFIGURASI KUIS KHUSUS BAB INI ---
const MODULE_KEY = "mtk_6_8"; // Kunci unik modul
const PAGE_TITLE = "Urutan dan Kombinasi";
const DISPLAY_COUNT = 10;
const localStorageKey_Answers = `${MODULE_KEY}_answers_v3`; 
const localStorageKey_Score = `${MODULE_KEY}_score_v3`; 
const localStorageKey_Questions = `${MODULE_KEY}_questions_v3`; 

export default function MateriMatematikaKelas6Bab8Page() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState<QuizQuestion[]>([]); 
  
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  const fullQuestionPool: QuizQuestion[] = getQuestionsForModule(MODULE_KEY);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- LOGIKA UTAMA KUIS (MEMUAT/MERESET SOAL) ---
  const loadNewQuiz = (savedQuestionsJson: string | null = null) => {
    let questionsToDisplay;
    if (savedQuestionsJson) {
      questionsToDisplay = JSON.parse(savedQuestionsJson);
    } else {
      questionsToDisplay = selectRandomQuestions(fullQuestionPool, DISPLAY_COUNT);
    }

    setDisplayedQuestions(questionsToDisplay);
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey_Questions, JSON.stringify(questionsToDisplay));
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setShowAnswers(false);
    
    localStorage.removeItem(localStorageKey_Answers);
    localStorage.removeItem(localStorageKey_Score);
    localStorage.removeItem(localStorageKey_Questions);
    
    loadNewQuiz(null); // Muat 10 soal acak yang baru (Redeem Soal)
  };
  // ----------------------------------------------------

  // === FETCH VIDEO DARI SUPABASE ===
  useEffect(() => {
    async function fetchVideo() {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from("videos")
        .select("youtube_url")
        .eq("kelas", "6")
        .eq("pelajaran", "Matematika")
        .eq("bab", "Bab 8")
        .single();

      if (error) { console.error("⚠️ Gagal ambil video:", error); } 
      else if (data) { setVideoUrl(data.youtube_url); }
      setLoadingVideo(false);
    }
    fetchVideo();
  }, []);

  // === LOGIKA LOCAL STORAGE (LOAD) ===
  useEffect(() => {
    setIsClient(true);
    const savedAnswers = localStorage.getItem(localStorageKey_Answers);
    const savedScore = localStorage.getItem(localStorageKey_Score);
    const savedQuestions = localStorage.getItem(localStorageKey_Questions);
    
    if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers));
    if (savedScore) setScore(JSON.parse(savedScore));
    
    loadNewQuiz(savedQuestions);
  }, []); 

  // === LOGIKA LOCAL STORAGE (SAVE) ===
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(localStorageKey_Answers, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, isClient]);

  useEffect(() => {
    if (isClient && score !== null) {
      localStorage.setItem(localStorageKey_Score, JSON.stringify(score));
    }
  }, [score, isClient]);

  const handleAnswerChange = (index: number, answer: string) => {
    if (score !== null) return;
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score !== null) return;
    let newScore = 0;
    displayedQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) newScore++;
    });
    setScore(newScore);
    setShowAnswers(false);
  };
  
  if (!fullQuestionPool.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: Data soal kuis tidak ditemukan untuk modul ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="py-10 md:py-16 flex-grow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
            Pusat Akademik Siswa
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 text-center mb-10 md:mb-12">
            Materi Bab 8: {PAGE_TITLE}
          </h2>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
              Video Pembelajaran
            </h3>

            <div className="aspect-video w-full mb-10 rounded-lg shadow-xl overflow-hidden border border-gray-200">
              {loadingVideo ? (
                <div className="flex justify-center items-center h-full text-slate-500">
                  Memuat video...
                </div>
              ) : videoUrl ? (
                <iframe
                  src={videoUrl}
                  title={`Video Pembelajaran: ${PAGE_TITLE}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="flex justify-center items-center h-full text-slate-500">
                  Video belum tersedia.
                </div>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
              Uji Pemahaman 
            </h3>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 border rounded-lg shadow-lg bg-white"
            >
              {displayedQuestions.map((q, qIndex) => (
                <div
                  key={`question-${qIndex}`}
                  className="mb-6 pb-4 border-b last:border-b-0"
                >
                  <p className="font-semibold text-lg mb-3 text-gray-900">
                    {qIndex + 1}. {q.question.replace(/^\d+\. /, '')}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      const isCorrect = q.correctAnswer === option;
                      const isSelected = selectedAnswers[qIndex] === option;
                      let labelClass = "text-slate-700";

                      if (score !== null) {
                        if (isCorrect) labelClass = "text-green-600 font-bold";
                        if (isSelected && !isCorrect)
                          labelClass = "text-red-600 line-through";
                      }

                      const optionId = `q${qIndex}_opt${optIndex}`;
                      return (
                        <div
                          key={`opt-${qIndex}-${optIndex}-${option}`}
                          className="flex items-center"
                        >
                          <input
                            type="radio"
                            id={optionId}
                            name={`question_${qIndex}`}
                            value={option}
                            checked={!!isSelected}
                            onChange={() => handleAnswerChange(qIndex, option)}
                            disabled={score !== null}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={optionId}
                            className={`ml-3 block text-sm font-medium ${labelClass}`}
                          >
                            {option}
                            {score !== null && isCorrect && (
                              <BiCheckCircle className="inline ml-2 text-green-600" />
                            )}
                            {score !== null && isSelected && !isCorrect && (
                              <BiXCircle className="inline ml-2 text-red-600" />
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {score === null && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-all"
                    disabled={Object.keys(selectedAnswers).length < DISPLAY_COUNT}
                  >
                    Kirim Jawaban
                  </button>
                )}

                {score !== null && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAnswers(!showAnswers)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-all"
                    >
                      {showAnswers
                        ? "Sembunyikan Jawaban"
                        : "Lihat Kunci Jawaban"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="px-6 py-2 text-red-600 rounded-md font-semibold border border-transparent hover:bg-red-50 transition-all"
                    >
                      Ulangi Kuis 
                    </button>
                  </>
                )}
              </div>

              {score !== null && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="font-semibold text-blue-800 text-lg">
                    Skor Anda (tersimpan di perangkat ini): {score} /{" "}
                    {displayedQuestions.length}
                  </p>
                </div>
              )}
            </form>

            <div className="text-center mt-12">
              <Link
                href="/akademik/kelas-6/matematika"
                className="inline-flex items-center px-6 py-2 border border-slate-300 text-slate-600 rounded-full font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                <BiArrowBack className="mr-2" />
                Kembali ke Pilih Bab
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}