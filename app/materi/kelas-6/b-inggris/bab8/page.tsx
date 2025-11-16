"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BiArrowBack, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { createClient } from "@supabase/supabase-js";

const quizQuestions = [
  {
    question: "1. We ___ study English next Monday. (Gunakan kata kerja bantu yang tepat)",
    options: ["will", "did", "were"],
    correctAnswer: "will"
  },
  {
    question: "2. The sun ___ rise tomorrow morning. (Gunakan kata kerja bentuk dasar)",
    options: ["rise", "rose", "rises"],
    correctAnswer: "rise"
  },
  {
    question: "3. Kalimat negatif yang benar dari 'They will travel tomorrow' adalah:",
    options: ["They will not travel tomorrow.", "They do not travel tomorrow.", "They will traveling tomorrow."],
    correctAnswer: "They will not travel tomorrow."
  },
  {
    question: "4. Bentuk singkatan (contraction) dari 'She will' adalah:",
    options: ["She'll", "She's", "She'd"],
    correctAnswer: "She'll"
  },
  {
    question: "5. The negative contraction of 'will not' is:",
    options: ["won't", "willn't", "don't"],
    correctAnswer: "won't"
  },
  {
    question: "6. Kata kerja (verb) yang digunakan dalam Future Tense harus dalam bentuk...",
    options: ["Past form (Bentuk Lampau)", "Base form (Bentuk Dasar)", "Continuous form (Bentuk -ing)"],
    correctAnswer: "Base form (Bentuk Dasar)"
  },
  {
    question: "7. Which time marker shows the future?",
    options: ["Yesterday", "Last night", "Next year"],
    correctAnswer: "Next year"
  },
  {
    question: "8. Question form: ___ you help me with my homework later?",
    options: ["Do", "Did", "Will"],
    correctAnswer: "Will"
  },
  {
    question: "9. My sister ___ buy a new phone next week.",
    options: ["buy", "will", "bought"],
    correctAnswer: "will"
  },
  {
    question: "10. 'They will not go to the market.' Kalimat ini berarti...",
    options: ["Mereka pergi ke pasar.", "Mereka tidak akan pergi ke pasar.", "Mereka sedang pergi ke pasar."],
    correctAnswer: "Mereka tidak akan pergi ke pasar."
  }
];

const localStorageKey_Answers = 'quiz_bing_6_8_answers';
const localStorageKey_Score = 'quiz_bing_6_8_score';

export default function MateriBing6Bab8Page() {
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchVideo() {
      setLoadingVideo(true);
      const { data } = await supabase
        .from("videos")
        .select("youtube_url")
        .eq("kelas", "6")
        .eq("pelajaran", "Bahasa Inggris")
        .eq("bab", "Bab 8")
        .single();

      if (data) setVideoUrl(data.youtube_url);
      setLoadingVideo(false);
    }
    fetchVideo();
  }, []);

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
      if (selectedAnswers[index] === q.correctAnswer) {
        newScore++;
      }
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
            My Mother will Bake a Cake Tomorrow
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
                  title="Video Pembelajaran Bab 8"
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />

                          <label 
                            htmlFor={`q${index}_${option}`}
                            className={`ml-3 block text-base font-medium ${labelClass}`}
                          >
                            {option}

                            {showAnswers && isCorrect && (
                              <BiCheckCircle className="inline ml-2 text-green-600" />
                            )}

                            {showAnswers && isSelected && !isCorrect && (
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
                    className="px-6 py-2 border border-transparent bg-blue-600 text-white rounded-md font-semibold shadow-sm hover:bg-blue-700 transition-all"
                  >
                    Kirim Jawaban
                  </button>
                )}

                {score !== null && (
                  <button 
                    type="button" 
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-all"
                  >
                    {showAnswers ? "Sembunyikan Jawaban" : "Lihat Kunci Jawaban"}
                  </button>
                )}

                {score !== null && (
                  <button 
                    type="button" 
                    onClick={handleResetQuiz}
                    className="px-6 py-2 border border-transparent text-red-600 rounded-md font-semibold hover:bg-red-50 transition-all"
                  >
                    Ulangi Kuis
                  </button>
                )}

              </div>

              {score !== null && (
                <div className="mt-6 p-4 rounded-md bg-blue-50 border border-blue-200">
                  <p className="font-semibold text-blue-800 text-lg">
                    Skor Anda (tersimpan di perangkat ini): {score} / {quizQuestions.length}
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
