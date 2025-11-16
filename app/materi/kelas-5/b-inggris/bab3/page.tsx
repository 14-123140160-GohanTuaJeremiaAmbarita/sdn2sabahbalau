"use client"; // PENTING: Client Component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BiArrowBack, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { createClient } from "@supabase/supabase-js"; // 👉 Tambahan Supabase

// --- DATA KUIS UNTUK BAB 3 ---
const quizQuestions = [
  { question: "1. 'How much is the apple?' Kalimat ini menanyakan...", options: ["Rasa", "Jumlah", "Harga"], correctAnswer: "Harga" },
  { question: "2. 'It is five thousand rupiahs.' Angka yang benar adalah...", options: ["Rp 500", "Rp 5.000", "Rp 50.000"], correctAnswer: "Rp 5.000" },
  { question: "3. How much ... the bananas?", options: ["is", "are", "am"], correctAnswer: "are" },
  { question: "4. 'They are twenty thousand rupiahs.' Angka yang benar adalah...", options: ["Rp 2.000", "Rp 20.000", "Rp 200.000"], correctAnswer: "Rp 20.000" },
  { question: "5. 'One hundred thousand' artinya...", options: ["10.000", "1.000.000", "100.000"], correctAnswer: "100.000" },
  { question: "6. A: How much is the book? B: ... is Rp 15.000.", options: ["It", "They", "He"], correctAnswer: "It" },
  { question: "7. A: How much are the shoes? B: ... are Rp 75.000.", options: ["It", "They", "She"], correctAnswer: "They" },
  { question: "8. 'Fifty thousand' artinya...", options: ["15.000", "50.000", "500.000"], correctAnswer: "50.000" },
  { question: "9. Kata 'Cost' memiliki arti...", options: ["Harga/Biaya", "Beli", "Jual"], correctAnswer: "Harga/Biaya" },
  { question: "10. 'Two hundred and fifty' artinya...", options: ["205", "250", "2050"], correctAnswer: "250" }
];

const localStorageKey_Answers = 'quiz_bing_5_3_answers';
const localStorageKey_Score = 'quiz_bing_5_3_score';

export default function MateriBing5Bab3Page() {

  const videoTitle = "Materi Bab 3: How Much Do the Apples Cost?";

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
        .eq("bab", "Bab 3")
        .single();

      if (error) {
        console.error("⚠️ Gagal mengambil video:", error);
      } else if (data) {
        setVideoUrl(data.youtube_url);
      }
      setLoadingVideo(false);
    }

    fetchVideo();
  }, []);

  // --- STATE QUIZ ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // --- LOAD DARI LOCALSTORAGE ---
  useEffect(() => {
    setIsClient(true);
    const savedAnswers = localStorage.getItem(localStorageKey_Answers);
    const savedScore = localStorage.getItem(localStorageKey_Score);

    if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers));
    if (savedScore) setScore(JSON.parse(savedScore));
  }, []);

  // --- SAVE JAWABAN ---
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(localStorageKey_Answers, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, isClient]);

  // --- SAVE SCORE ---
  useEffect(() => {
    if (isClient && score !== null) {
      localStorage.setItem(localStorageKey_Score, JSON.stringify(score));
    }
  }, [score, isClient]);

  const handleAnswerChange = (questionIndex, answer) => {
    if (score === null) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: answer
      });
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
    setShowAnswers(false);
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
            How Much Do the Apples Cost?
          </h2>

          <div className="max-w-4xl mx-auto">

            {/* ---------------- VIDEO SUPABASE ---------------- */}
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
            {/* ------------------------------------------------ */}

            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
              Uji Pemahaman (10 Soal)
            </h3>

            <form 
              onSubmit={handleSubmit}
              className="p-4 md:p-6 border rounded-lg shadow-lg bg-white"
            >

              {quizQuestions.map((q, index) => (
                <div key={index} className="mb-6 pb-4 border-b last:border-b-0">
                  <p className="font-semibold text-lg mb-3 text-gray-900">
                    {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((option) => {
                      const isCorrect = q.correctAnswer === option;
                      const isSelected = selectedAnswers[index] === option;

                      let labelClass = "text-gray-900";
                      if (showAnswers) {
                        if (isCorrect) labelClass = "text-green-600 font-bold";
                        if (isSelected && !isCorrect) labelClass = "text-red-600 line-through";
                      }

                      return (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`q${index}_${option}`}
                            name={`question_${index}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(index, option)}
                            disabled={score !== null}
                            className="h-4 w-4 text-blue-600"
                          />
                          <label 
                            htmlFor={`q${index}_${option}`}
                            className={`ml-3 block text-base font-medium ${labelClass}`}
                          >
                            {option}
                            {showAnswers && isCorrect && <BiCheckCircle className="inline ml-2 text-green-600" />}
                            {showAnswers && isSelected && !isCorrect && <BiXCircle className="inline ml-2 text-red-600" />}
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold"
                  >
                    Kirim Jawaban
                  </button>
                )}

                {score !== null && (
                  <>
                    <button 
                      type="button"
                      onClick={() => setShowAnswers(!showAnswers)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md"
                    >
                      {showAnswers ? "Sembunyikan Jawaban" : "Lihat Kunci Jawaban"}
                    </button>

                    <button 
                      type="button"
                      onClick={handleResetQuiz}
                      className="px-6 py-2 text-red-600 rounded-md hover:bg-red-50"
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
                className="inline-flex items-center px-6 py-2 border border-slate-300 text-slate-600 rounded-full"
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
