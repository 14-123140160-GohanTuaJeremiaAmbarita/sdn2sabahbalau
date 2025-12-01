// 📁 lib/quiz-utils.ts (KODE DIPERBAIKI)

// Import tipe dan data dari bank soal
import { AllQuizData, QuizQuestion } from '@/data/quiz-questions';

// Eksport tipe secara eksplisit agar sesuai dengan isolatedModules
export type { QuizQuestion }; 

// Fungsi untuk mengambil sejumlah soal acak
export const selectRandomQuestions = (allQuestions: QuizQuestion[], count: number = 10): QuizQuestion[] => {
    if (allQuestions.length < count) {
        console.warn(`Hanya ada ${allQuestions.length} soal di bank data. Menampilkan semua yang tersedia.`);
        return allQuestions;
    }
    
    // 1. Acak array soal
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    
    // 2. Ambil sejumlah 'count' soal pertama
    return shuffled.slice(0, count);
};

// Fungsi untuk mengambil data soal berdasarkan kunci modul
export const getQuestionsForModule = (key: string): QuizQuestion[] => {
    // Memastikan kunci modul ada dan mengembalikan array
    return AllQuizData[key] || [];
};