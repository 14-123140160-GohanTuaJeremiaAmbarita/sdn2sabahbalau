"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BiArrowBack, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { createClient } from "@supabase/supabase-js";

// IMPORT UTILITY BARU
import { getQuestionsForModule, selectRandomQuestions, QuizQuestion } from '@/lib/quiz-utils'; 

// --- KONFIGURASI KUIS KHUSUS BAB INI ---
const MODULE_KEY = "bing_6_6"; // Kunci unik modul
const DISPLAY_COUNT = 10;
const localStorageKey_Answers = `${MODULE_KEY}_answers_v2`; 
const localStorageKey_Score = `${MODULE_KEY}_score_v2`; 
const localStorageKey_Questions = `${MODULE_KEY}_questions_v2`; 

// --- JUDUL DAN META DATA (Untuk Supabase) ---
const KELAS = "6";
const PELAJARAN = "Bahasa Inggris";
const BAB_TITLE = "My Holiday Experience";
const SUB_BAB_TITLE = "Bab 6";

export default function MateriPage() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState<QuizQuestion[]>([]); 
  
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  // Ambil semua soal dari data terpusat
  const fullQuestionPool: QuizQuestion[] = getQuestionsForModule(MODULE_KEY);
  const maxQuestions = fullQuestionPool.length;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // FUNGSI MEMUAT SOAL TERSIMPAN ATAU SOAL BARU
  const loadNewQuiz = (savedQuestionsJson: string | null = null) => {
    const questionsToDisplay = savedQuestionsJson 
      ? JSON.parse(savedQuestionsJson)
      : selectRandomQuestions(fullQuestionPool, DISPLAY_COUNT); 

    setDisplayedQuestions(questionsToDisplay);
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey_Questions, JSON.stringify(questionsToDisplay));
    }
  };

  // LOGIKA FETCH VIDEO DARI SUPABASE
  useEffect(() => {
    async function fetchVideo() {
      setLoadingVideo(true);
      const { data, error } = await supabase
        .from("videos")
        .select("youtube_url")
        .eq("kelas", KELAS)
        .eq("pelajaran", PELAJARAN)
        .eq("bab", SUB_BAB_TITLE)
        .single();
        
      if (error) { console.error("⚠️ Gagal ambil video:", error); } 
      else if (data) { setVideoUrl(data.youtube_url); }
      setLoadingVideo(false);
    }
    fetchVideo();
  }, [KELAS, PELAJARAN, SUB_BAB_TITLE]);

  // LOAD DARI LOCAL STORAGE (JANGAN LUPA Cek isClient)
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;
    
    const savedAnswers = localStorage.getItem(localStorageKey_Answers);
    const savedScore = localStorage.getItem(localStorageKey_Score);
    const savedQuestions = localStorage.getItem(localStorageKey_Questions);
    
    if (savedAnswers) setSelectedAnswers(JSON.parse(savedAnswers));
    if (savedScore) setScore(JSON.parse(savedScore));
    
    loadNewQuiz(savedQuestions);
  }, []); 

  // SAVE KE LOCAL STORAGE
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(localStorageKey_Answers, JSON.stringify(selectedAnswers));
      if (score !== null) {
        localStorage.setItem(localStorageKey_Score, JSON.stringify(score));
      }
    }
  }, [selectedAnswers, score, isClient]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (score === null) {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answer });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (score !== null) return; 

    let newScore = 0;
    displayedQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowAnswers(false);
  };

  // --- FITUR RESET/REDEEM KUIS BARU ---
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setShowAnswers(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(localStorageKey_Answers);
      localStorage.removeItem(localStorageKey_Score);
      localStorage.removeItem(localStorageKey_Questions);
    }
    
    loadNewQuiz(null); // Muat 10 soal acak yang baru
  };

  if (!isClient) return null;
  const backLink = `/akademik/kelas-${KELAS.toLowerCase()}/${PELAJARAN.toLowerCase().replace(' ', '-')}`;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="py-10 md:py-16 flex-grow">
        <div className="container mx-auto px-4">
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
            Pusat Akademik Siswa
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 text-center mb-10 md:mb-12">
            {BAB_TITLE}
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
                  title={`Video Pembelajaran: ${BAB_TITLE}`}
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
              Uji Pemahaman ({DISPLAY_COUNT} Soal Acak dari {maxQuestions} Soal)
            </h3>
            
            <form 
              onSubmit={handleSubmit}
              className="p-4 md:p-6 border rounded-lg shadow-lg bg-white"
            >
              {displayedQuestions.map((q, index) => {
                const isUserAnswered = selectedAnswers[index] !== undefined;

                return (
                  <div key={index} className="mb-6 pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-lg mb-3 text-gray-900">
                      {index + 1}. {q.question.replace(/^\d+\. /, '')}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option) => {
                        const isOptionCorrect = q.correctAnswer === option;
                        const isOptionSelected = selectedAnswers[index] === option;
                        let labelClass = "text-gray-900"; 
                        
                        if (showAnswers && isUserAnswered) {
                          if (isOptionCorrect) labelClass = "text-green-600 font-bold";
                          if (isOptionSelected && !isOptionCorrect) labelClass = "text-red-600 line-through";
                        }

                        return (
                          <div key={option} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${index}_${option}`}
                              name={`question_${index}`}
                              value={option}
                              checked={isOptionSelected}
                              onChange={() => handleAnswerChange(index, option)}
                              disabled={score !== null} 
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label 
                              htmlFor={`q${index}_${option}`}
                              className={`ml-3 block text-base font-medium ${labelClass}`}
                            >
                              {option}
                              {showAnswers && isOptionCorrect && <BiCheckCircle className="inline ml-2 text-green-600" />}
                              {showAnswers && isOptionSelected && !isOptionCorrect && <BiXCircle className="inline ml-2 text-red-600" />}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {score === null && (
                  <button 
                    type="submit" 
                    className="px-6 py-2 border border-transparent bg-blue-600 text-white rounded-md font-semibold shadow-sm hover:bg-blue-700 transition-all"
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
                      {showAnswers ? "Sembunyikan Jawaban" : "Lihat Kunci Jawaban"}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleResetQuiz}
                      className="px-6 py-2 border border-transparent text-red-600 rounded-md font-semibold hover:bg-red-50 transition-all"
                    >
                      Ulangi Kuis (Kumpulan Soal Baru)
                    </button>
                  </>
                )}
              </div>

              {score !== null && (
                <div className="mt-6 p-4 rounded-md bg-blue-50 border border-blue-200">
                  <p className="font-semibold text-blue-800 text-lg">
                    Skor Anda (tersimpan di perangkat ini): {score} / {displayedQuestions.length}
                  </p>
                </div>
              )}
            </form>

            <div className="text-center mt-8 md:mt-12">
              <Link 
                href="/akademik/kelas-6/bahasa-inggris" 
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