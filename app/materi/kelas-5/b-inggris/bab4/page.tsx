"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BiArrowBack, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { createClient } from "@supabase/supabase-js";

const quizQuestions = [
  { question: "1. 'I have a stomachache.' What does 'stomachache' mean?", options: ["Sakit kepala", "Sakit gigi", "Sakit perut"], correctAnswer: "Sakit perut" },
  { question: "2. If you have a 'fever', you feel ...", options: ["Cold", "Hot", "Tired"], correctAnswer: "Hot" },
  { question: "3. 'I have a toothache.' You should go to the ...", options: ["Doctor", "Dentist", "Teacher"], correctAnswer: "Dentist" },
  { question: "4. What's the matter? I have a ... (flu)", options: ["Cough", "Headache", "Flu"], correctAnswer: "Flu" },
  { question: "5. 'He has a broken leg.' 'Broken leg' means...", options: ["Kaki terkilir", "Kaki patah", "Kaki lecet"], correctAnswer: "Kaki patah" },
  { question: "6. 'I have a headache.' 'Headache' means...", options: ["Sakit kepala", "Sakit mata", "Sakit telinga"], correctAnswer: "Sakit kepala" },
  { question: "7. 'She has a cough.' 'Cough' means...", options: ["Pilek", "Batuk", "Demam"], correctAnswer: "Batuk" },
  { question: "8. 'I feel dizzy.' 'Dizzy' means...", options: ["Pusing", "Mual", "Lelah"], correctAnswer: "Pusing" },
  { question: "9. We use our ... to see.", options: ["Nose", "Eyes", "Ears"], correctAnswer: "Eyes" },
  { question: "10. 'I have a sore throat.' 'Sore throat' means...", options: ["Sakit gigi", "Sakit punggung", "Sakit tenggorokan"], correctAnswer: "Sakit tenggorokan" }
];

const localStorageKey_Answers = "quiz_bing_5_4_answers";
const localStorageKey_Score = "quiz_bing_5_4_score";

export default function MateriBing5Bab4Page() {
  const videoTitle = "Materi Bab 4: I Have Stomachache";

  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchVideo() {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from("videos")
        .select("youtube_url")
        .eq("kelas", "5")
        .eq("pelajaran", "Bahasa Inggris")
        .eq("bab", "Bab 4")
        .single();
      if (!error && data) setVideoUrl(data.youtube_url);
      setLoadingVideo(false);
    }
    fetchVideo();
  }, []);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedAnswers = localStorage.getItem(localStorageKey_Answers);
    const savedScore = localStorage.getItem(localStorageKey_Score);
    if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers));
    if (savedScore) setScore(JSON.parse(savedScore));
  }, []);

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

  const handleAnswerChange = (index, answer) => {
    if (score === null) {
      setSelectedAnswers({ ...selectedAnswers, [index]: answer });
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">Pusat Akademik Siswa</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 text-center mb-10 md:mb-12">I Have Stomachache</h2>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">Video Pembelajaran</h3>

            <div className="aspect-video w-full mb-10 rounded-lg shadow-xl overflow-hidden border border-gray-200">
              {loadingVideo ? (
                <div className="flex justify-center items-center h-full text-slate-500">Memuat video...</div>
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
                <div className="flex justify-center items-center h-full text-slate-500">Video belum tersedia.</div>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">Uji Pemahaman (10 Soal)</h3>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 border rounded-lg shadow-lg bg-white">
              {quizQuestions.map((q, index) => (
                <div key={index} className="mb-6 pb-4 border-b last:border-b-0">
                  <p className="font-semibold text-lg mb-3 text-gray-900">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option) => {
                      const isCorrect = option === q.correctAnswer;
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
                          <label htmlFor={`q${index}_${option}`} className={`ml-3 block text-base font-medium ${labelClass}`}>
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
                {score === null ? (
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Kirim Jawaban</button>
                ) : (
                  <>
                    <button type="button" onClick={() => setShowAnswers(!showAnswers)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md">
                      {showAnswers ? "Sembunyikan Jawaban" : "Lihat Kunci Jawaban"}
                    </button>
                    <button type="button" onClick={handleResetQuiz} className="px-6 py-2 text-red-600 rounded-md hover:bg-red-50">
                      Ulangi Kuis
                    </button>
                  </>
                )}
              </div>

              {score !== null && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="font-semibold text-blue-800 text-lg">Skor Anda (tersimpan di perangkat ini): {score} / {quizQuestions.length}</p>
                </div>
              )}
            </form>

            <div className="text-center mt-8 md:mt-12">
              <Link href="/akademik/kelas-5/bahasa-inggris" className="inline-flex items-center px-6 py-2 border border-slate-300 text-slate-600 rounded-full">
                <BiArrowBack className="mr-2" /> Kembali ke Pilih Bab
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
