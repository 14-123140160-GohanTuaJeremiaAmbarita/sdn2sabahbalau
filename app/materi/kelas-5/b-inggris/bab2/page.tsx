"use client"; // PENTING: Client Component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BiArrowBack, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { createClient } from "@supabase/supabase-js";

// --- DATA KUIS UNTUK BAB 2 ---
const quizQuestions = [
  { question: "1. I am drinking from a ... of milk.", options: ["bowl", "glass", "plate"], correctAnswer: "glass" },
  { question: "2. The opposite of 'full' is ...", options: ["Empty", "Heavy", "Sweet"], correctAnswer: "Empty" },
  { question: "3. What do you need to drink a juice?", options: ["Spoon", "Fork", "Straw"], correctAnswer: "Straw" },
  { question: "4. Milk is typically ... in color.", options: ["Red", "White", "Green"], correctAnswer: "White" },
  { question: "5. The word 'drink' is a(n) ...", options: ["Noun", "Verb", "Adjective"], correctAnswer: "Verb" },
  { question: "6. I feel thirsty, I should ...", options: ["Sleep", "Drink water", "Run"], correctAnswer: "Drink water" },
  { question: "7. 'A glass of milk' is a phrase to describe ...", options: ["Quantity", "Shape", "Temperature"], correctAnswer: "Quantity" },
  { question: "8. We use our ... to drink.", options: ["Ears", "Mouth", "Nose"], correctAnswer: "Mouth" },
  { question: "9. Where does milk come from?", options: ["Tree", "Cow", "Ocean"], correctAnswer: "Cow" },
  { question: "10. Which is a liquid?", options: ["Bread", "Milk", "Cheese"], correctAnswer: "Milk" },
];

// --- LOCAL STORAGE KEYS ---
const localStorageKey_Answers = "quiz_bing_5_2_answers";
const localStorageKey_Score = "quiz_bing_5_2_score";

export default function MateriBing5Bab2Page() {
  const videoTitle = "Materi Bab 2: I Drink a Glass of Milk";

  // --- STATE KUIS ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // --- STATE VIDEO SUPABASE ---
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  // --- SUPABASE CLIENT ---
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- FETCH VIDEO DARI SUPABASE ---
  useEffect(() => {
    async function fetchVideo() {
      setLoadingVideo(true);

      const { data, error } = await supabase
        .from("videos")
        .select("youtube_url")
        .eq("kelas", "5")
        .eq("pelajaran", "Bahasa Inggris")
        .eq("bab", "Bab 2")
        .single();

      if (error) console.error("⚠️ Gagal mengambil video:", error);
      else if (data) setVideoUrl(data.youtube_url);

      setLoadingVideo(false);
    }

    fetchVideo();
  }, []);

  // --- LOCALSTORAGE LOAD ---
  useEffect(() => {
    setIsClient(true);
    const savedAnswers = localStorage.getItem(localStorageKey_Answers);
    const savedScore = localStorage.getItem(localStorageKey_Score);

    if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers));
    if (savedScore) setScore(JSON.parse(savedScore));
  }, []);

  // --- LOCALSTORAGE SAVE ---
  useEffect(() => {
    if (isClient)
      localStorage.setItem(localStorageKey_Answers, JSON.stringify(selectedAnswers));
  }, [selectedAnswers, isClient]);

  useEffect(() => {
    if (isClient && score !== null)
      localStorage.setItem(localStorageKey_Score, JSON.stringify(score));
  }, [score, isClient]);

  // --- HANDLE ANSWERS ---
  const handleAnswerChange = (questionIndex, answer) => {
    if (score === null) {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answer });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (score !== null) return;

    let newScore = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) newScore++;
    });

    setScore(newScore);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setShowAnswers(false);
    localStorage.removeItem(localStorageKey_Answers);
    localStorage.removeItem(localStorageKey_Score);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      <main className="py-10 md:py-16 flex-grow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
            Pusat Akademik Siswa
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 text-center mb-10 md:mb-12">
            {videoTitle}
          </h2>

          <div className="max-w-4xl mx-auto">

            {/* -------- VIDEO SUPABASE -------- */}
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
                  title={`Video Pembelajaran: ${videoTitle}`}
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

            {/* -------- QUIZ -------- */}
            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
              Uji Pemahaman (10 Soal)
            </h3>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 border rounded-lg shadow-lg bg-white"
            >
              {quizQuestions.map((q, index) => {
                const isCorrect = (option) => option === q.correctAnswer;

                return (
                  <div key={index} className="mb-6 pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-lg mb-3 text-gray-900">
                      {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((option) => {
                        const selected = selectedAnswers[index] === option;

                        let labelClass = "text-gray-900";
                        if (showAnswers) {
                          if (isCorrect(option)) labelClass = "text-green-600 font-bold";
                          if (selected && !isCorrect(option)) labelClass = "text-red-600 line-through";
                        }

                        return (
                          <div key={option} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${index}_${option}`}
                              name={`question_${index}`}
                              value={option}
                              checked={selected}
                              onChange={() => handleAnswerChange(index, option)}
                              disabled={score !== null}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />

                            <label
                              htmlFor={`q${index}_${option}`}
                              className={`ml-3 block text-base font-medium ${labelClass}`}
                            >
                              {option}
                              {showAnswers && isCorrect(option) && (
                                <BiCheckCircle className="inline ml-2 text-green-600" />
                              )}
                              {showAnswers && selected && !isCorrect(option) && (
                                <BiXCircle className="inline ml-2 text-red-600" />
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {score === null ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-all"
                  >
                    Kirim Jawaban
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAnswers(!showAnswers)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50"
                    >
                      {showAnswers ? "Sembunyikan Jawaban" : "Lihat Kunci Jawaban"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="px-6 py-2 text-red-600 font-semibold rounded-md hover:bg-red-50"
                    >
                      Ulangi Kuis
                    </button>
                  </>
                )}
              </div>

              {score !== null && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="font-semibold text-blue-800 text-lg">
                    Skor Anda: {score} / {quizQuestions.length}
                  </p>
                </div>
              )}
            </form>

            <div className="text-center mt-8 md:mt-12">
              <Link
                href="/akademik/kelas-5/bahasa-inggris"
                className="inline-flex items-center px-6 py-2 border border-slate-300 text-slate-600 rounded-full font-semibold hover:bg-slate-50"
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
