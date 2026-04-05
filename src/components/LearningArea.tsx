"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttentionGauge } from './AttentionGauge';
import { useAttention, AttentionState } from '@/hooks/use-attention';
import { generateAI } from '@/lib/ai-client';
import { saveQuizRecord } from '@/lib/quiz-history';
import { StudentProfile } from '@/lib/student-profile';
import { LayoutDashboard, BookOpen, ChevronRight, Zap, Target, BookMarked, HelpCircle, CheckCircle2, Brain } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearningAreaProps {
  topic: string;
  onFinish: (stats: any) => void;
  studentProfile: StudentProfile;
}

interface Section {
  id: string;
  title: string;
  full: string;
  bullet: string;
  story: string;
}

export const LearningArea: React.FC<LearningAreaProps> = ({ topic, onFinish, studentProfile }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adaptationMode, setAdaptationMode] = useState<'Full' | 'Bullet' | 'Story' | 'Challenge'>('Full');
  const [challenge, setChallenge] = useState<any>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{ correct: boolean; answer: string; explanation: string } | null>(null);
  const [contentFlash, setContentFlash] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [stats, setStats] = useState({ correctChallenges: 0, totalChallenges: 0 });
  const [inRecapMode, setInRecapMode] = useState(false);
  const [recapQuestions, setRecapQuestions] = useState<any[]>([]);
  const [recapIdx, setRecapIdx] = useState(0);
  const [recapResults, setRecapResults] = useState<Record<number, { selected: string; correct: string; explanation: string; isCorrect: boolean }>>({});
  
  // New Stages: Thought Process & Flashcards
  const [thoughtProcess, setThoughtProcess] = useState<string>("");
  const [flashcards, setFlashcards] = useState<{front: string, back: string}[]>([]);
  const [currentStage, setCurrentStage] = useState<'SECTIONS' | 'THOUGHT' | 'FLASHCARDS' | 'QUIZ' | 'QUIZ_RESULTS'>('SECTIONS');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSection = sections[currentIdx];
  const attention = useAttention(currentSection?.id);

  // Load Sections from Claude
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await generateAI('GENERATE_SECTIONS', { topic }, studentProfile);
        if (Array.isArray(data)) {
           setSections(data);
        } else {
           console.error("Malformed sections data:", data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [topic]);

  // Handle Adaptation Logic based on Attention Score
  useEffect(() => {
    let mode: typeof adaptationMode = 'Full';
    
    if (attention.score < 20) {
      mode = 'Challenge';
      if (!showChallenge && currentSection) {
        triggerChallenge();
      }
    } else if (attention.score < 50) {
      mode = 'Story';
    } else if (attention.score < 80) {
      mode = 'Bullet';
    } else {
      mode = 'Full';
    }

    if (mode !== adaptationMode) {
      setAdaptationMode(mode);
      setContentFlash(true);
      setTimeout(() => setContentFlash(false), 300);
    }
  }, [attention.score]);

  const triggerChallenge = async () => {
    if (showChallenge) return;
    try {
      const data = await generateAI('GENERATE_CHALLENGE', {
        topic,
        content: sections[currentIdx]?.full || topic,
        sections: currentSection ? [currentSection] : [],
      }, studentProfile);
      if (data && data.question && Array.isArray(data.options)) {
        setChallenge(data);
        setChallengeFeedback(null);
        setShowChallenge(true);
      } else {
        console.error("Invalid challenge format:", data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChallengeAnswer = (selectedOption: string) => {
    const isCorrect = selectedOption === challenge.correct_answer;
    setStats(prev => ({ 
      correctChallenges: prev.correctChallenges + (isCorrect ? 1 : 0),
      totalChallenges: prev.totalChallenges + 1
    }));

    setChallengeFeedback({
      correct: isCorrect,
      answer: challenge.correct_answer,
      explanation: challenge.explanation || 'Review the key idea and retry.',
    });

    setTimeout(() => {
      setChallengeFeedback(null);
      setShowChallenge(false);
      setAdaptationMode('Full'); // Reset on success/attempt
    }, 3200);
  };

  const handleNext = async () => {
    if (currentStage === 'SECTIONS') {
      if (currentIdx < sections.length - 1) {
        setCompletedSections(prev => [...prev, currentSection.id]);
        setCurrentIdx(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Move to Thought Process stage
        setLoading(true);
        try {
          const data = await generateAI('GENERATE_THOUGHT_PROCESS', { topic }, studentProfile);
          setThoughtProcess(data.process || "AI logic calibrated for maximum retention.");
          setCurrentStage('THOUGHT');
        } catch (e) {
          setCurrentStage('FLASHCARDS'); // Fallback
        } finally {
          setLoading(false);
        }
      }
    } else if (currentStage === 'THOUGHT') {
      // Move to Flashcards stage
      setLoading(true);
      try {
        const data = await generateAI('GENERATE_FLASHCARDS', { topic, sections }, studentProfile);
        setFlashcards(data || []);
        setCurrentStage('FLASHCARDS');
      } catch (e) {
        setLoading(false);
        handleNext(); // Skip to next
      } finally {
        setLoading(false);
      }
    } else if (currentStage === 'FLASHCARDS') {
      if (flashcardIdx < flashcards.length - 1) {
        setFlashcardIdx(prev => prev + 1);
        setFlipped(false);
      } else {
        // Start Final Recap Quiz
        setLoading(true);
        try {
           const data = await generateAI('GENERATE_RECAP_QUIZ', { topic, sections }, studentProfile);
           if (Array.isArray(data) && data.length > 0) {
              setRecapQuestions(data);
              setRecapIdx(0);
              setRecapResults({});
              setCurrentStage('QUIZ');
              setInRecapMode(true);
           } else {
              onFinish({ sections, attention, stats });
           }
        } catch (e) {
           console.error(e);
           onFinish({ sections, attention, stats });
        } finally {
           setLoading(false);
        }
      }
    }
  };

  const handleRecapAnswer = (selectedOption: string) => {
    if (recapResults[recapIdx]) return;

    const question = recapQuestions[recapIdx];
    const isCorrect = selectedOption === question?.correct_answer;
    setStats(prev => ({ 
      correctChallenges: prev.correctChallenges + (isCorrect ? 1 : 0),
      totalChallenges: prev.totalChallenges + 1
    }));

    const result = {
      selected: selectedOption,
      correct: question?.correct_answer || '',
      explanation: question?.explanation || 'Review the concept and try the next one.',
      isCorrect,
    };

    setRecapResults((prev) => ({ ...prev, [recapIdx]: result }));

    if (isCorrect) {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        if (recapIdx < recapQuestions.length - 1) {
          setRecapIdx((prev) => prev + 1);
        } else {
          setCurrentStage('QUIZ_RESULTS');
        }
      }, 1000);
    }
  };

  const handlePrevSection = () => {
    if (currentIdx <= 0) return;
    setCurrentIdx((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevQuiz = () => {
    if (recapIdx <= 0) return;
    setRecapIdx((prev) => prev - 1);
  };

  const handleNextQuiz = () => {
    if (!recapResults[recapIdx]) return;
    if (recapResults[recapIdx]?.isCorrect) return;
    if (recapIdx < recapQuestions.length - 1) {
      setRecapIdx((prev) => prev + 1);
      return;
    }
    setCurrentStage('QUIZ_RESULTS');
  };

  const finishQuizAndSave = () => {
    const questions = recapQuestions.map((question, index) => {
      const result = recapResults[index];
      return {
        question: question?.question || `Question ${index + 1}`,
        selected: result?.selected || 'Not answered',
        correct: result?.correct || question?.correct_answer || '',
        isCorrect: Boolean(result?.isCorrect),
        explanation: result?.explanation || question?.explanation || '',
      };
    });

    const correctCount = questions.filter((item) => item.isCorrect).length;
    const totalCount = questions.length;
    const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    saveQuizRecord({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic,
      createdAt: new Date().toISOString(),
      total: totalCount,
      correct: correctCount,
      scorePercent,
      questions,
    });

    onFinish({
      sections,
      attention,
      stats,
      recapPassed: true,
      quizResults: questions,
      quizScore: scorePercent,
    });
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-teal blur-2xl -z-10 opacity-30" 
          />
        </div>
        <p className="text-white/60 font-medium tracking-wide animate-pulse">FlowIQ is architecting your learning path...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full px-4 py-8">
      {/* Left side: Content Area */}
      <div className="lg:col-span-8 space-y-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal/10 rounded-lg text-teal">
              <BookMarked size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-teal/70">{studentProfile.board} • Standard {studentProfile.standard}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Section {currentIdx + 1} of {sections.length}</p>
              <h2 className="text-xl font-bold font-display text-white">{currentSection?.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sections.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === currentIdx ? "w-8 bg-teal shadow-[0_0_10px_rgba(0,229,204,0.5)]" : 
                  completedSections.includes(sections[i].id) ? "w-2 bg-teal/40" : "w-1.5 bg-white/10"
                )} 
              />
            ))}
          </div>
        </div>

        <motion.div 
          animate={{ scale: contentFlash ? 0.99 : 1, opacity: contentFlash ? 0.8 : 1 }}
          className="glass-dark p-10 min-h-[400px] flex flex-col relative overflow-hidden"
        >
          {currentStage === 'QUIZ' ? (
             <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-10 relative">
                <div className="text-center space-y-4">
                   <div className="inline-flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-teal/20">
                      <Target size={14} /> Final Assessment
                   </div>
                   <h2 className="text-4xl font-black text-white italic">COMPEHENSIVE <span className="text-teal">QUIZ</span></h2>
                   <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Question {recapIdx + 1} of {recapQuestions.length}</p>
                </div>

                <div className="w-full max-w-2xl space-y-8">
                   <h3 className="text-2xl font-bold text-center text-white/90 leading-snug">
                      {recapQuestions[recapIdx]?.question}
                   </h3>

                   <div className="grid grid-cols-1 gap-4">
                      {recapQuestions[recapIdx]?.options.map((opt: string, i: number) => {
                         const currentResult = recapResults[recapIdx];
                         const isAnswered = Boolean(currentResult);
                         const isSelected = currentResult?.selected === opt;
                         const isCorrectOption = currentResult?.correct === opt;
                         const showCorrectGlow = isAnswered && isCorrectOption;
                         const showWrongGlow = isAnswered && isSelected && !currentResult?.isCorrect;

                         return (
                         <button
                            key={i}
                            disabled={isAnswered}
                            onClick={() => handleRecapAnswer(opt)}
                            className={cn(
                              "w-full p-6 text-left rounded-2xl bg-white/5 border transition-all group relative overflow-hidden",
                              !isAnswered && "border-white/10 hover:border-teal hover:bg-teal/5",
                              showCorrectGlow && "border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.65)]",
                              showWrongGlow && "border-red-400 shadow-[0_0_18px_rgba(248,113,113,0.65)]",
                              isAnswered && !showCorrectGlow && !showWrongGlow && "border-white/10 opacity-80",
                            )}
                         >
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                  "w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs transition-all",
                                  !isAnswered && "text-white/40 group-hover:bg-teal group-hover:text-white",
                                  showCorrectGlow && "bg-emerald-500/20 text-emerald-300",
                                  showWrongGlow && "bg-red-500/20 text-red-300",
                                  isAnswered && !showCorrectGlow && !showWrongGlow && "text-white/45",
                                )}>
                                  {String.fromCharCode(65 + i)}
                               </div>
                               <span className={cn(
                                 "text-lg font-bold transition-all",
                                 !isAnswered && "text-white/80 group-hover:text-white",
                                 showCorrectGlow && "text-emerald-200",
                                 showWrongGlow && "text-red-200",
                                 isAnswered && !showCorrectGlow && !showWrongGlow && "text-white/70",
                               )}>{opt}</span>
                            </div>
                         </button>
                      )})}
                   </div>

                   {recapResults[recapIdx] && (
                      <div className={cn(
                        "rounded-2xl border p-6 space-y-3",
                        recapResults[recapIdx].isCorrect ? "border-teal/30 bg-teal/10" : "border-red/30 bg-red/10"
                      )}>
                         <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                           {recapResults[recapIdx].isCorrect ? 'Correct Answer' : 'Review This Answer'}
                         </p>
                         {!recapResults[recapIdx].isCorrect && (
                           <p className="text-sm text-white/70">
                             You chose: <span className="font-bold text-red">{recapResults[recapIdx].selected}</span>
                           </p>
                         )}
                         <p className="text-sm text-white/80">
                           Correct answer: <span className="font-bold text-teal">{recapResults[recapIdx].correct}</span>
                         </p>
                         <p className="text-sm text-white/65 leading-relaxed">{recapResults[recapIdx].explanation}</p>
                      </div>
                   )}

                   <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handlePrevQuiz}
                        disabled={recapIdx === 0}
                        className={cn(
                          "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          recapIdx === 0
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-white/10 text-white/70 hover:bg-white/15"
                        )}
                      >
                        Previous
                      </button>
                     <button
                        onClick={handleNextQuiz}
                        disabled={!recapResults[recapIdx] || recapResults[recapIdx]?.isCorrect}
                        className={cn(
                          "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          recapResults[recapIdx] && !recapResults[recapIdx]?.isCorrect
                            ? "bg-teal text-background hover:brightness-110"
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                        )}
                      >
                        {recapResults[recapIdx]?.isCorrect
                          ? 'Auto Next...'
                          : recapIdx < recapQuestions.length - 1
                            ? 'Next'
                            : 'Finish Quiz'}
                      </button>
                   </div>
                </div>

                <div className="absolute -bottom-20 -right-20 opacity-[0.03] rotate-12 pointer-events-none">
                   <Brain size={280} className="text-teal" />
                </div>
             </div>
          ) : currentStage === 'QUIZ_RESULTS' ? (
            <div className="flex-1 flex flex-col py-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue/10 text-blue px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue/20">
                  <Target size={14} /> Quiz Results
                </div>
                <h2 className="text-4xl font-black text-white italic">Performance <span className="text-blue">Report</span></h2>
                <p className="text-sm text-white/55">
                  Score: <span className="font-black text-white">
                    {recapQuestions.length > 0 ? Math.round((Object.values(recapResults).filter((item) => item.isCorrect).length / recapQuestions.length) * 100) : 0}%
                  </span> ({Object.values(recapResults).filter((item) => item.isCorrect).length}/{recapQuestions.length})
                </p>
              </div>

              <div className="mt-8 flex-1 overflow-y-auto pr-2 space-y-4">
                {recapQuestions.map((question, index) => {
                  const result = recapResults[index];
                  const isCorrect = Boolean(result?.isCorrect);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "rounded-2xl border p-5 space-y-3",
                        isCorrect ? "bg-emerald-500/8 border-emerald-500/25" : "bg-red/10 border-red/25"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                        Question {index + 1}
                      </p>
                      <p className="text-sm font-semibold text-white/90">{question?.question}</p>
                      <p className="text-sm text-white/70">
                        Selected: <span className={cn("font-bold", isCorrect ? "text-emerald-300" : "text-red-300")}>
                          {result?.selected || 'Not answered'}
                        </span>
                      </p>
                      <p className="text-sm text-white/75">
                        Correct: <span className="font-bold text-teal">{result?.correct || question?.correct_answer}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={finishQuizAndSave}
                  className="bg-blue text-background font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:brightness-110"
                >
                  Save Result & Return
                </button>
              </div>
            </div>
          ) : currentStage === 'THOUGHT' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
              <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
                <Brain size={48} />
              </div>
              <h2 className="text-3xl font-black text-white italic tracking-tight">AI <span className="text-purple-400">THOUGHT PROCESS</span></h2>
              <div className="max-w-xl text-lg text-white/70 leading-relaxed bg-white/5 p-8 rounded-3xl border border-white/10 italic">
                "{thoughtProcess}"
              </div>
              <button 
                onClick={handleNext}
                className="bg-purple-500 text-white font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-glow-purple uppercase tracking-widest text-xs"
              >
                Continue to Flashcards
              </button>
            </div>
          ) : currentStage === 'FLASHCARDS' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">ACTIVE <span className="text-teal">RECALL</span></h2>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Card {flashcardIdx + 1} of {flashcards.length}</p>
              </div>

              <motion.div 
                className="relative w-full max-w-md aspect-[3/2] cursor-pointer perspective-1000"
                onClick={() => setFlipped(!flipped)}
              >
                <motion.div 
                  className="w-full h-full relative transition-all duration-700 preserve-3d"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden glass-dark border border-white/10 rounded-3xl flex items-center justify-center p-12 text-center">
                    <p className="text-2xl font-bold text-white">{flashcards[flashcardIdx]?.front}</p>
                    <div className="absolute bottom-6 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Click to Flip</div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden glass-dark border border-teal/40 rounded-3xl flex items-center justify-center p-12 text-center rotate-y-180 bg-teal/5">
                    <p className="text-xl font-medium text-teal">{flashcards[flashcardIdx]?.back}</p>
                  </div>
                </motion.div>
              </motion.div>

              <button 
                onClick={handleNext}
                className="bg-white text-background font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                {flashcardIdx < flashcards.length - 1 ? 'Next Card' : 'Final Quiz'}
              </button>
            </div>
          ) : (
            <>
              {/* Adaptation Badge */}
              <div className="absolute top-0 right-0 p-4">
                 <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className={cn("w-2 h-2 rounded-full", {
                       "bg-teal": adaptationMode === 'Full',
                       "bg-purple-400": adaptationMode === 'Bullet',
                       "bg-amber-400": adaptationMode === 'Story',
                       "bg-red-400": adaptationMode === 'Challenge',
                    })} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">
                       {adaptationMode} Mode
                    </span>
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentIdx}-${adaptationMode}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                       "prose prose-invert max-w-none text-lg leading-relaxed text-white/90",
                       adaptationMode === 'Challenge' && "blur-[4px] pointer-events-none transition-all duration-700"
                    )}
                  >
                    {adaptationMode === 'Full' && (
                      <p>{currentSection?.full}</p>
                    )}
                    
                    {adaptationMode === 'Bullet' && (
                      <div className="space-y-4">
                        {currentSection?.bullet.split('\n').filter(Boolean).map((b, i) => (
                          <motion.div 
                            initial={{ x: -10, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5 border-l-2 border-l-teal"
                          >
                            <CheckCircle2 size={18} className="text-teal mt-1 shrink-0" />
                            <p>{b.replace(/^[\-\*]\s*/, '')}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {adaptationMode === 'Story' && (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-2xl italic text-amber-200/90 relative">
                        <span className="absolute -top-4 -left-4 text-6xl text-amber-500/10 italic font-serif">"</span>
                        <p className="relative z-10">{currentSection?.story}</p>
                       <div className="mt-4 flex items-center gap-2 text-amber-500/70 text-xs font-bold uppercase tracking-widest">
                          <Zap size={14} /> Memorable Analogy
                       </div>
                      </div>
                    )}

                    {adaptationMode === 'Challenge' && (
                      <p className="opacity-50">{currentSection?.full.slice(0, 300)}...</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-12 flex justify-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevSection}
                    disabled={currentIdx === 0}
                    className={cn(
                      "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      currentIdx === 0
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-white/10 text-white/75 hover:bg-white/15"
                    )}
                  >
                    Previous Section
                  </button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="bg-white text-background font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:bg-teal hover:text-white"
                  >
                    {currentIdx < sections.length - 1 ? 'Next Section' : 'View Thought Process'}
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Challenge Slide-in Overlay */}
        <AnimatePresence>
          {showChallenge && challenge && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 z-50 p-6"
            >
              <div className="glass shadow-2xl border-teal/40 bg-background/95 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal to-transparent animate-pulse" />
                <div className="flex items-center gap-2 text-teal mb-4 uppercase tracking-[0.2em] text-[10px] font-black">
                   <Target size={14} /> Attention Check
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">{challenge.question}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {challenge.options.map((opt: string, i: number) => (
                      <button
                         key={i}
                         disabled={Boolean(challengeFeedback)}
                         onClick={() => handleChallengeAnswer(opt)}
                         className="p-5 text-left rounded-xl border border-white/5 bg-white/5 hover:border-teal/40 hover:bg-teal/5 transition-all group relative"
                      >
                         <div className="absolute left-0 inset-y-0 w-1 bg-teal scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                         <span className="text-white/80 group-hover:text-white transition-colors">{opt}</span>
                      </button>
                   ))}
                </div>

                {challengeFeedback && (
                  <div className={cn(
                    "mt-6 rounded-2xl p-5 border",
                    challengeFeedback.correct ? "bg-teal/10 border-teal/30" : "bg-red/10 border-red/30"
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
                      {challengeFeedback.correct ? 'Correct' : 'Correct Answer'}
                    </p>
                    <p className="text-sm text-white/75">
                      Answer: <span className="font-bold text-teal">{challengeFeedback.answer}</span>
                    </p>
                    <p className="mt-2 text-sm text-white/65 leading-relaxed">{challengeFeedback.explanation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Adaptation Toast */}
        <AnimatePresence>
          {contentFlash && adaptationMode !== 'Full' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="fixed bottom-10 right-10 bg-teal/90 text-background px-4 py-2 rounded-lg font-bold shadow-xl z-50 flex items-center gap-2"
            >
              <Zap size={16} />
              Switching to a quicker format... 👀
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Dashboard */}
      <div className="lg:col-span-4 space-y-6">
        <div className="sticky top-8 space-y-6">
           <div className="flex items-center gap-2 mb-4 px-1">
              <LayoutDashboard size={18} className="text-white/40" />
              <h2 className="uppercase tracking-widest text-xs font-black text-white/40">Visual Dashboard</h2>
           </div>
           
           <AttentionGauge 
              score={attention.score} 
              state={attention.state} 
              color={attention.color || '#00E5CC'} 
              streak={Math.floor(currentIdx * 3 + (attention.score > 80 ? 2 : 0))} 
           />

           <div className="glass-dark p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                 <HelpCircle size={14} /> Attention Signals
              </h4>
              
              <div className="space-y-4">
                 {[
                    { label: 'Idle Time', value: `${attention.idleCount}s`, status: attention.idleCount > 8 ? 'warning' : 'ok' },
                    { label: 'Tab Switches', value: attention.tabSwitchCount, status: attention.tabSwitchCount > 0 ? 'warning' : 'ok' },
                    { label: 'Re-reads Detected', value: attention.reReads, status: 'ok' },
                    { label: 'Dwell in Section', value: `${attention.dwellTimes[currentSection?.id] || 0}s`, status: 'ok' },
                 ].map((sig, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-sm text-white/60">{sig.label}</span>
                       <div className="flex items-center gap-2">
                          <span className={cn(
                             "text-xs font-bold px-2 py-0.5 rounded",
                             sig.status === 'warning' ? "bg-red/10 text-red" : "bg-teal/10 text-teal"
                          )}>{sig.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-gradient-to-br from-teal/20 to-transparent border border-teal/20">
              <p className="text-sm text-white/80 leading-relaxed italic">
                 "FlowIQ detected you were skimming, so I simplified the content. Deep focus will restore complex details."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
