import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  Clock,
  Award,
  FileText,
  Upload,
  Play,
  CheckCircle,
  AlertCircle,
  Trophy,
  User as UserIcon,
  LogOut,
  Languages,
  Download,
  Copy,
  Check,
  Code,
  ChevronRight,
  RefreshCw,
  Plus,
  Send,
  Terminal,
  Layers,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { translations, Language } from './i18n';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'teacher' | 'student';
  grade: number;
  xp: number;
}

interface Textbook {
  id: string;
  grade: number;
  title: string;
  filename: string;
  content: string;
  uploadedBy: string;
  createdAt: string;
}

interface LessonTask {
  id: string;
  level: 'A' | 'B' | 'C';
  title: string;
  description: string;
  points: number;
  descriptors: string[];
}

interface Lesson {
  id: string;
  grade: number;
  topic: string;
  language: 'kk' | 'ru' | 'en';
  theory: string;
  tasks: LessonTask[];
  createdBy: string;
  createdAt: string;
}

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Exam {
  id: string;
  grade: number;
  title: string;
  durationMinutes: number;
  questions: ExamQuestion[];
  createdBy: string;
  createdAt: string;
}

interface TaskSubmission {
  id: string;
  lessonId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  grade: number;
  answer: string;
  score: number;
  maxScore: number;
  feedback: string;
  submittedAt: string;
}

interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  grade: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  completedAt: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('kk');
  const [user, setUser] = useState<User>({
    id: 'u_t1',
    username: 'teacher',
    fullName: 'Ахметов Бауыржан (Мұғалім)',
    role: 'teacher',
    grade: 0,
    xp: 850,
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedGrade, setSelectedGrade] = useState<number>(9);

  // Деректер күйлері
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Мұғалім: Сабақ генераторы
  const [genTopic, setGenTopic] = useState('');
  const [genGrade, setGenGrade] = useState<number>(9);
  const [genBookId, setGenBookId] = useState('');
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generatedLessonOutput, setGeneratedLessonOutput] = useState<string | null>(null);

  // Мұғалім: Емтихан генераторы
  const [examTitleInput, setExamTitleInput] = useState('');
  const [examGradeInput, setExamGradeInput] = useState<number>(9);
  const [examDurationInput, setExamDurationInput] = useState<number>(20);
  const [examCountInput, setExamCountInput] = useState<number>(4);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  // Мұғалім: Оқулық жүктеу
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookGrade, setNewBookGrade] = useState<number>(9);
  const [newBookContent, setNewBookContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Оқушы: Тапсырма орындау
  const [selectedLessonForTask, setSelectedLessonForTask] = useState<Lesson | null>(null);
  const [taskAnswerText, setTaskAnswerText] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskFeedbackResult, setTaskFeedbackResult] = useState<{
    score: number;
    feedback: string;
    xpEarned: number;
  } | null>(null);

  // Оқушы: Емтихан тапсыру (Таймер)
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(0);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examOutcome, setExamOutcome] = useState<{
    score: number;
    total: number;
    percentage: number;
    xpEarned: number;
  } | null>(null);

  // Python Streamlit коды
  const [pythonAppCode, setPythonAppCode] = useState<string>('');
  const [pythonReqs, setPythonReqs] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);

  const t = translations[lang];

  // Деректерді серверден жүктеу
  const fetchAllData = async () => {
    try {
      const [tbRes, lRes, exRes, gbRes, lbRes, pyRes] = await Promise.all([
        fetch('/api/textbooks'),
        fetch('/api/lessons'),
        fetch('/api/exams'),
        fetch('/api/gradebook'),
        fetch('/api/users/leaderboard'),
        fetch('/api/download-python'),
      ]);

      if (tbRes.ok) {
        const d = await tbRes.json();
        setTextbooks(d.textbooks || []);
      }
      if (lRes.ok) {
        const d = await lRes.json();
        setLessons(d.lessons || []);
        if (d.lessons && d.lessons.length > 0 && !selectedLessonForTask) {
          setSelectedLessonForTask(d.lessons[0]);
        }
      }
      if (exRes.ok) {
        const d = await exRes.json();
        setExams(d.exams || []);
      }
      if (gbRes.ok) {
        const d = await gbRes.json();
        setSubmissions(d.taskSubmissions || []);
        setExamResults(d.examResults || []);
      }
      if (lbRes.ok) {
        const d = await lbRes.json();
        setLeaderboard(d.leaderboard || []);
      }
      if (pyRes.ok) {
        const d = await pyRes.json();
        setPythonAppCode(d.appPy || '');
        setPythonReqs(d.requirements || '');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Емтихан таймері
  useEffect(() => {
    if (!activeExam || examSecondsLeft <= 0 || examOutcome) return;

    const timer = setInterval(() => {
      setExamSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, examSecondsLeft, examOutcome]);

  // Демо пайдаланушыны ауыстыру
  const switchDemoRole = (role: 'teacher' | 'student', gradeVal = 9) => {
    if (role === 'teacher') {
      setUser({
        id: 'u_t1',
        username: 'teacher',
        fullName: 'Ахметов Бауыржан (Мұғалім)',
        role: 'teacher',
        grade: 0,
        xp: 850,
      });
      setActiveTab('overview');
    } else {
      setUser({
        id: 'u_s2',
        username: 'student2',
        fullName: 'Серікқызы Аружан (Оқушы)',
        role: 'student',
        grade: gradeVal,
        xp: 640,
      });
      setSelectedGrade(gradeVal);
      setActiveTab('lessons');
    }
    setActiveExam(null);
    setExamOutcome(null);
  };

  // Оқулық жүктеу (файлды оқу немесе мәтін қосу)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!newBookTitle) {
      setNewBookTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setNewBookContent(text || 'Файл мазмұны оқылды.');
    };
    reader.readAsText(file);
  };

  const handleSaveTextbook = async () => {
    if (!newBookTitle.trim() || !newBookContent.trim()) {
      alert('Тақырыбы мен мазмұнын енгізіңіз!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/textbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: newBookGrade,
          title: newBookTitle,
          filename: uploadedFileName || `${newBookTitle}.txt`,
          content: newBookContent,
          uploadedBy: user.fullName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTextbooks(prev => [data.textbook, ...prev]);
        setNewBookTitle('');
        setNewBookContent('');
        setUploadedFileName('');
        alert(t.readSample + ': ' + t.lessonSavedSuccess);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gemini AI: Сабақ генераторы
  const handleGenerateLesson = async () => {
    if (!genTopic.trim()) {
      alert('Сабақ тақырыбын жазыңыз!');
      return;
    }

    setIsGeneratingLesson(true);
    setGeneratedLessonOutput(null);

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: genGrade,
          topic: genTopic,
          textbookId: genBookId,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedLessonOutput(data.rawOutput);
        setLessons(prev => [data.lesson, ...prev]);
        setSelectedLessonForTask(data.lesson);
      } else {
        alert(data.error || 'Қате орын алды');
      }
    } catch (e: any) {
      alert('Генерация қатесі: ' + e.message);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Gemini AI: Емтихан құрастырушы
  const handleGenerateExam = async () => {
    if (!examTitleInput.trim()) {
      alert('Емтихан атауын жазыңыз!');
      return;
    }

    setIsGeneratingExam(true);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: examGradeInput,
          title: examTitleInput,
          durationMinutes: examDurationInput,
          questionCount: examCountInput,
          topic: examTitleInput,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExams(prev => [data.exam, ...prev]);
        alert(t.examCreatedSuccess);
        setExamTitleInput('');
      } else {
        alert(data.error || 'Қате');
      }
    } catch (e: any) {
      alert('Тест генерациялау қатесі: ' + e.message);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Оқушы: Тапсырма жауабын жіберу және AI арқылы тексеру
  const handleSubmitTaskAnswer = async () => {
    if (!taskAnswerText.trim() || !selectedLessonForTask) {
      alert('Шешіміңізді немесе кодты жазыңыз!');
      return;
    }

    setIsSubmittingTask(true);
    setTaskFeedbackResult(null);

    const taskToGrade = selectedLessonForTask.tasks[0] || {
      title: selectedLessonForTask.topic,
    };

    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selectedLessonForTask.id,
          taskTitle: taskToGrade.title,
          studentId: user.id,
          studentName: user.fullName,
          grade: user.grade || selectedGrade,
          answer: taskAnswerText,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTaskFeedbackResult({
          score: data.submission.score,
          feedback: data.submission.feedback,
          xpEarned: data.xpEarned,
        });
        setSubmissions(prev => [data.submission, ...prev]);
        setUser(prev => ({ ...prev, xp: prev.xp + data.xpEarned }));
      }
    } catch (err: any) {
      alert('Жіберу қатесі: ' + err.message);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Оқушы: Емтиханды бастау
  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setExamAnswers({});
    setExamOutcome(null);
    setExamSecondsLeft(exam.durationMinutes * 60);
  };

  // Оқушы: Емтиханды тапсыру
  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setExamSubmitting(true);

    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExam.id,
          studentId: user.id,
          studentName: user.fullName,
          grade: user.grade || activeExam.grade,
          answers: examAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExamOutcome({
          score: data.result.score,
          total: data.result.totalQuestions,
          percentage: data.result.percentage,
          xpEarned: data.result.xpEarned,
        });
        setExamResults(prev => [data.result, ...prev]);
        setUser(prev => ({ ...prev, xp: prev.xp + data.result.xpEarned }));
      }
    } catch (err: any) {
      alert('Емтихан тапсыру қатесі: ' + err.message);
    } finally {
      setExamSubmitting(false);
    }
  };

  const handleAutoSubmitExam = () => {
    if (!examOutcome) {
      handleSubmitExam();
    }
  };

  // Форматталған уақытты көрсету (ММ:СС)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Кодты көшіру
  const copyPythonCode = () => {
    if (pythonAppCode) {
      navigator.clipboard.writeText(pythonAppCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    }
  };

  // Файлды жүктеп алу функциясы
  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 7-11 сыныптар бойынша сүзу
  const filteredLessons = lessons.filter(l => selectedGrade === 0 || l.grade === selectedGrade);
  const filteredExams = exams.filter(e => selectedGrade === 0 || e.grade === selectedGrade);
  const filteredTextbooks = textbooks.filter(t => selectedGrade === 0 || t.grade === selectedGrade);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ЖОҒАРҒЫ ШАПКА (HEADER) */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Бренд және Логотип */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  FTM Edu
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  7-11 LMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Информатика пәнінің цифрлық платформасы
              </p>
            </div>
          </div>

          {/* Оң жақ батырмалар: Тіл + Сынып + Рөл */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Тіл таңдау батырмасы */}
            <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
              <Languages className="w-4 h-4 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLang('kk')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  lang === 'kk' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Қазақ тілі"
              >
                🇰🇿 KZ
              </button>
              <button
                onClick={() => setLang('ru')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  lang === 'ru' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Русский язык"
              >
                🇷🇺 RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  lang === 'en' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Рөл ауыстыру / Демо селектор */}
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
              <button
                onClick={() => switchDemoRole('teacher')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  user.role === 'teacher'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👨‍🏫 {t.roleTeacher}
              </button>
              <button
                onClick={() => switchDemoRole('student', 9)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  user.role === 'student'
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👨‍🎓 {t.roleStudent} (9-сынып)
              </button>
            </div>

            {/* Пайдаланушы профилі */}
            <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {user.role === 'teacher' ? 'T' : 'S'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-cyan-400">
                  {user.role === 'teacher' ? 'Мұғалім' : `${user.grade}-сынып | ${user.xp} XP`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* НЕГІЗГІ ҚҰРЫЛЫМ: САЙДБАР ЖӘНЕ ОРТАЛЫҚ БӨЛІМ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* БҮЙІРЛІК МӘЗІР (SIDEBAR) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col space-y-4">
          {/* Сыныпты таңдау фильтрі */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>{t.schoolGrade} (7-11):</span>
              <span className="text-[10px] text-indigo-400 font-normal">Информатика</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[7, 8, 9, 10, 11].map(gr => (
                <button
                  key={gr}
                  onClick={() => setSelectedGrade(gr)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    selectedGrade === gr
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  {gr}
                </button>
              ))}
            </div>
          </div>

          {/* Навигация түймелері */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {user.role === 'teacher' ? 'Мұғалім басқару панелі' : 'Оқушы кабинеті'}
            </div>

            {/* Мұғалім мәзірі */}
            {user.role === 'teacher' ? (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>{t.navOverview}</span>
                </button>

                <button
                  onClick={() => setActiveTab('textbooks')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'textbooks'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{t.navTextbooks}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai_generator')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'ai_generator'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  <span>{t.navAiGenerator}</span>
                </button>

                <button
                  onClick={() => setActiveTab('exam_builder')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'exam_builder'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-pink-400" />
                  <span>{t.navExamBuilder}</span>
                </button>

                <button
                  onClick={() => setActiveTab('gradebook')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'gradebook'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>{t.navGradebook}</span>
                </button>
              </>
            ) : (
              /* Оқушы мәзірі */
              <>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'lessons'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{t.navLessons}</span>
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'tasks'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4 text-amber-400" />
                  <span>{t.navTasks}</span>
                </button>

                <button
                  onClick={() => setActiveTab('exams')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'exams'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span>{t.navExams}</span>
                </button>

                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'leaderboard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>{t.navLeaderboard}</span>
                </button>
              </>
            )}

            <div className="pt-2 border-t border-slate-800 mt-2">
              <button
                onClick={() => setActiveTab('python_code')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'python_code'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-emerald-800/40'
                }`}
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{t.navPythonCode}</span>
              </button>
            </div>
          </div>

          {/* Оқушының жылдам XP және Дәреже картасы */}
          {user.role === 'student' && (
            <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                  <span>{t.yourRank}</span>
                </span>
                <span className="text-xs font-bold text-yellow-400">{user.xp} XP</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min((user.xp / 1000) * 100, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                {user.xp < 300
                  ? t.badge1
                  : user.xp < 600
                  ? t.badge2
                  : user.xp < 900
                  ? t.badge3
                  : t.badge4}
              </div>
            </div>
          )}
        </aside>

        {/* НЕГІЗГІ ОРТАЛЫҚ КАРТА (MAIN CONTENT AREA) */}
        <main className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
          {/* 1. ЖАЛПЫ ШОЛУ (OVERVIEW - МҰҒАЛІМ) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FTM Edu — Информатика әдістемелік платформасы</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t.appSubtitle}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Қазақстанның 7-11 сынып информатика бағдарламасына бейімделген AI көмекші, емтихан симуляторы және оқулықтар базасы.
                </p>
              </div>

              {/* Статистика карточкалары */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-slate-400 text-xs font-medium">Оқулықтар қоры</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{textbooks.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">7-11 сыныптар</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-slate-400 text-xs font-medium">Сабақтар мен конспектілер</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{lessons.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Дескрипторларымен</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-slate-400 text-xs font-medium">Белсенді емтихандар</div>
                  <div className="text-2xl font-black text-pink-400 mt-1">{exams.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Таймерлі тесттер</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                  <div className="text-slate-400 text-xs font-medium">Орындалған жұмыстар</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {submissions.length + examResults.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">AI бағалауынан өткен</div>
                </div>
              </div>

              {/* Мүмкіндіктер тақтасы */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => setActiveTab('ai_generator')}
                  className="group cursor-pointer bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-800/40 hover:border-purple-500 rounded-2xl p-5 transition shadow-sm hover:shadow-purple-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    1. AI Сабақ пен дескриптор құру
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gemini 3.8 Flash арқылы оқулық негізінде сапалы теориялық конспект, А/В/С деңгейлік тапсырмалар генерациялаңыз.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('exam_builder')}
                  className="group cursor-pointer bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 hover:border-indigo-500 rounded-2xl p-5 transition shadow-sm hover:shadow-indigo-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    2. Емтихан құрастырушы
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Уақыты шектелген (таймері бар) тест сұрақтары мен кодты талдау есептерін құрып, сыныпқа жариялаңыз.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('python_code')}
                  className="group cursor-pointer bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 hover:border-emerald-500 rounded-2xl p-5 transition shadow-sm hover:shadow-emerald-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    3. Python Streamlit коды
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    FTM Edu-дың толық Python (Streamlit + SQLite + google-genai) бастапқы кодын көшіріңіз немесе файл түрінде жүктеңіз.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. ОҚУЛЫҚТАР ҚОРЫ (TEXTBOOKS) */}
          {activeTab === 'textbooks' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>{t.textbookTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    7, 8, 9, 10, 11-сынып оқулықтары. Мұғалім жаңа материалды PDF немесе TXT етіп қоса алады.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 self-start sm:self-auto">
                  Таңдалған: {selectedGrade}{t.gradeSuffix}
                </div>
              </div>

              {/* Жаңа оқулық жүктеу блогы (Мұғалім) */}
              {user.role === 'teacher' && (
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{t.uploadTextbook}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Сынып:</label>
                      <select
                        value={newBookGrade}
                        onChange={e => setNewBookGrade(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        {[7, 8, 9, 10, 11].map(g => (
                          <option key={g} value={g}>
                            {g}{t.gradeSuffix}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 block mb-1">Оқулық атауы:</label>
                      <input
                        type="text"
                        placeholder="Мысалы: 9-сынып Информатика. Арман-ПВ баспасы"
                        value={newBookTitle}
                        onChange={e => setNewBookTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 flex justify-between">
                      <span>Файл таңдау (PDF / TXT) немесе мәтінді тікелей енгізу:</span>
                      {uploadedFileName && (
                        <span className="text-cyan-400 text-[11px]">Файл: {uploadedFileName}</span>
                      )}
                    </label>
                    <input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-400 mb-2 block file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                    <textarea
                      rows={4}
                      placeholder={t.textbookContentPlaceholder}
                      value={newBookContent}
                      onChange={e => setNewBookContent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSaveTextbook}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{loading ? 'Сақталуда...' : t.saveTextbook}</span>
                  </button>
                </div>
              )}

              {/* Қордағы оқулықтар тізімі */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedGrade}-сыныпқа қатысты жүктелген оқулықтар:
                </div>
                {filteredTextbooks.length === 0 ? (
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                    Бұл сыныпқа оқулық әлі жүктелмеген. Жоғарыдағы форма арқылы жаңасын жүктей аласыз.
                  </div>
                ) : (
                  filteredTextbooks.map(tb => (
                    <div
                      key={tb.id}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 transition hover:border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {tb.grade}{t.gradeSuffix}
                          </span>
                          <h4 className="text-sm font-bold text-white">{tb.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {t.uploadedBy}: {tb.uploadedBy}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800/60">
                        {tb.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. GEMINI AI САБАҚ ЖӘНЕ ДЕСКРИПТОР ГЕНЕРАТОРЫ (МҰҒАЛІМ) */}
          {activeTab === 'ai_generator' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>{t.lessonGenTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">{t.lessonGenSubtitle}</p>
              </div>

              {/* Генерация формасы */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Сынып:</label>
                    <select
                      value={genGrade}
                      onChange={e => setGenGrade(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      {[7, 8, 9, 10, 11].map(g => (
                        <option key={g} value={g}>
                          {g}{t.gradeSuffix}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">{t.basedOnTextbook}:</label>
                    <select
                      value={genBookId}
                      onChange={e => setGenBookId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Барлық оқулықтар қоры бойынша</option>
                      {textbooks.map(tb => (
                        <option key={tb.id} value={tb.id}>
                          {tb.grade}-сынып: {tb.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.selectTopic}:</label>
                  <input
                    type="text"
                    placeholder={t.topicPlaceholder}
                    value={genTopic}
                    onChange={e => setGenTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGenerateLesson}
                    disabled={isGeneratingLesson}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-purple-600/30"
                  >
                    {isGeneratingLesson ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.generatingLesson}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t.generateLessonBtn}</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Үлгі: Gemini 3.8 Flash • Тіл: {lang.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Генерацияланған нәтиже терезесі */}
              {generatedLessonOutput && (
                <div className="bg-slate-800/60 border border-purple-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{t.lessonSavedSuccess}</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('lessons')}
                      className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Сабақтар каталогынан көру</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    {generatedLessonOutput}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ЕМТИХАН ҚҰРАСТЫРУШЫ (EXAM BUILDER - МҰҒАЛІМ) */}
          {activeTab === 'exam_builder' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-pink-400" />
                  <span>{t.examBuilderTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  7-11 сыныптар үшін онлайн тесттер құру. Gemini AI сұрақтар мен нұсқаларды автоматты жасайды.
                </p>
              </div>

              {/* Тест құру формасы */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Сынып:</label>
                    <select
                      value={examGradeInput}
                      onChange={e => setExamGradeInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      {[7, 8, 9, 10, 11].map(g => (
                        <option key={g} value={g}>
                          {g}{t.gradeSuffix}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Емтихан тақырыбы / Атауы:</label>
                    <input
                      type="text"
                      placeholder={t.examTitlePlaceholder}
                      value={examTitleInput}
                      onChange={e => setExamTitleInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">{t.examDuration}:</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={examDurationInput}
                      onChange={e => setExamDurationInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGenerateExam}
                    disabled={isGeneratingExam}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-pink-600/30"
                  >
                    {isGeneratingExam ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.generatingExam}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t.generateAiExam}</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Сұрақтар саны: {examCountInput} сұрақ • Тіл: {lang.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Құрылған емтихандар тізімі */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Жүйедегі емтихандар:
                </div>
                {exams.map(ex => (
                  <div
                    key={ex.id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {ex.grade}{t.gradeSuffix}
                        </span>
                        <h4 className="text-sm font-bold text-white">{ex.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ex.durationMinutes} мин</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Сұрақтар саны: <b className="text-slate-200">{ex.questions.length}</b> | Құрастырушы:{' '}
                      <b className="text-slate-200">{ex.createdBy}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. БАҒАЛАУ ЖУРНАЛЫ (GRADEBOOK - МҰҒАЛІМ) */}
          {activeTab === 'gradebook' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <span>{t.gradebookTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Оқушылардың орындаған тапсырмалары, Gemini AI берген бағасы және емтихан нәтижелері.
                </p>
              </div>

              {/* Тапсырмалар кестесі */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Code className="w-4 h-4 text-amber-400" />
                  <span>Тапсырмалар мен бағдарламалау жауаптары</span>
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">{t.studentName}</th>
                        <th className="px-4 py-3">Сынып</th>
                        <th className="px-4 py-3">{t.taskTitle}</th>
                        <th className="px-4 py-3">{t.score}</th>
                        <th className="px-4 py-3">{t.feedback}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {submissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-bold text-white">{sub.studentName}</td>
                          <td className="px-4 py-3">{sub.grade}{t.gradeSuffix}</td>
                          <td className="px-4 py-3 font-medium text-slate-200">{sub.taskTitle}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {sub.score} / {sub.maxScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{sub.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Емтихандар кестесі */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span>{t.examResults}</span>
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">{t.studentName}</th>
                        <th className="px-4 py-3">Сынып</th>
                        <th className="px-4 py-3">Емтихан атауы</th>
                        <th className="px-4 py-3">Дұрыс сұрақтар</th>
                        <th className="px-4 py-3">{t.percentage}</th>
                        <th className="px-4 py-3">+XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {examResults.map(res => (
                        <tr key={res.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-bold text-white">{res.studentName}</td>
                          <td className="px-4 py-3">{res.grade}{t.gradeSuffix}</td>
                          <td className="px-4 py-3 font-medium text-slate-200">{res.examTitle}</td>
                          <td className="px-4 py-3">
                            {res.score} / {res.totalQuestions}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-400">{res.percentage}%</span>
                          </td>
                          <td className="px-4 py-3 text-yellow-400 font-bold">+{res.xpEarned} XP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. САБАҚТАР МЕН КОНСПЕКТІЛЕР (LESSONS - ОҚУШЫ & МҰҒАЛІМ) */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <span>{t.lessonsCatalog}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedGrade}-сыныпқа арналған теориялық конспектілер мен код үлгілері.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 self-start sm:self-auto">
                  Сынып: {selectedGrade}{t.gradeSuffix}
                </div>
              </div>

              {filteredLessons.length === 0 ? (
                <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Бұл сыныпқа әзірге сабақ жоқ. Мұғалім кабинетінен AI генераторы арқылы қосыңыз!
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLessons.map(les => (
                    <div
                      key={les.id}
                      className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {les.grade}{t.gradeSuffix}
                          </span>
                          <h3 className="text-base font-bold text-white">{les.topic}</h3>
                        </div>
                        <span className="text-[11px] text-slate-400">Тіл: {les.language.toUpperCase()}</span>
                      </div>

                      {/* Теориялық конспект мәтіні */}
                      <div className="bg-slate-950/70 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800">
                        {les.theory}
                      </div>

                      {/* Сабаққа бекітілген тапсырмалар */}
                      {les.tasks && les.tasks.length > 0 && (
                        <div className="pt-2">
                          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                            Осы сабақтың деңгейлік тапсырмалары:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {les.tasks.map(tk => (
                              <div
                                key={tk.id}
                                className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                      Деңгей {tk.level}
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-400">
                                      +{tk.points} балл
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-200 mb-1">{tk.title}</h5>
                                  <p className="text-[11px] text-slate-400 line-clamp-2">{tk.description}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedLessonForTask(les);
                                    setActiveTab('tasks');
                                  }}
                                  className="mt-3 w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-semibold transition"
                                >
                                  Тапсырманы орындау →
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. ТАПСЫРМАЛАР ОРТАЛЫҒЫ ЖӘНЕ AI БАҒАЛАУ (TASKS - ОҚУШЫ) */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Code className="w-5 h-5 text-amber-400" />
                  <span>{t.taskCenterTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Тапсырманы таңдап, кодыңызды жазыңыз. Gemini AI дескриптор бойынша тексеріп, XP ұпайларын қосады.
                </p>
              </div>

              {/* Сабақты таңдау */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Сабақты таңдаңыз:</label>
                  <select
                    value={selectedLessonForTask?.id || ''}
                    onChange={e => {
                      const l = lessons.find(x => x.id === e.target.value);
                      setSelectedLessonForTask(l || null);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.grade}-сынып: {l.topic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Белсенді тапсырма шарттары */}
              {selectedLessonForTask && (
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-700 pb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 mr-2">
                      {selectedLessonForTask.grade}{t.gradeSuffix} Тапсырмасы
                    </span>
                    <h3 className="text-sm font-bold text-white inline-block">
                      {selectedLessonForTask.topic}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      {t.codeOrAnswer}
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`# Python кодын немесе жауабыңызды осында жазыңыз:\nmatrix = [[1, 2], [3, 4]]\n...`}
                      value={taskAnswerText}
                      onChange={e => setTaskAnswerText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleSubmitTaskAnswer}
                    disabled={isSubmittingTask}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-amber-600/20"
                  >
                    {isSubmittingTask ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.aiEvaluating}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.submitAndAiGrade}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* AI Тексеру нәтижесі картасы */}
              {taskFeedbackResult && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/50 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>{t.aiResultTitle}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Балл: {taskFeedbackResult.score} / 10
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        +{taskFeedbackResult.xpEarned} XP
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <p className="font-semibold text-emerald-400 mb-1">Мұғалімнің дескрипторлық талдауы:</p>
                    <p>{taskFeedbackResult.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. ЕМТИХАН ТАПСЫРУ МОДУЛІ (EXAM SIMULATOR - ОҚУШЫ) */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-pink-400" />
                  <span>{t.takeExamTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Сыныпқа бекітілген уақыттық сынақ тесті. Таймер біткенде жауаптар автоматты түрде қабылданады.
                </p>
              </div>

              {/* Белсенді емтихан болмаған кездегі тізім */}
              {!activeExam ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedGrade}-сыныпқа қолжетімді емтихандар:
                  </div>

                  {filteredExams.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                      Бұл сыныпта емтихан әлі тағайындалмаған. Мұғалім кабинетінен қосыңыз.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredExams.map(ex => (
                        <div
                          key={ex.id}
                          className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300">
                                {ex.grade}{t.gradeSuffix}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-pink-400" />
                                <span>{ex.durationMinutes} минут</span>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">{ex.title}</h4>
                            <p className="text-xs text-slate-400">
                              Сұрақ саны: <b className="text-slate-200">{ex.questions.length}</b>
                            </p>
                          </div>

                          <button
                            onClick={() => handleStartExam(ex)}
                            className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-pink-600/20"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>{t.startExam}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Емтихан тапсыру барысы */
                <div className="space-y-5">
                  {/* Таймер және ақпарат тақтасы */}
                  <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{activeExam.title}</h3>
                      <span className="text-xs text-slate-400">
                        Сұрақтар: {activeExam.questions.length}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-pink-950/70 border border-pink-700/60 text-pink-300 font-mono font-bold text-sm">
                      <Clock className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span>
                        {t.timeLeft} {formatTime(examSecondsLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Емтихан нәтижесі шыққан кезде */}
                  {examOutcome ? (
                    <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/50 rounded-2xl p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{t.examCompleted}</h3>
                      <div className="flex items-center justify-center space-x-4 text-sm font-semibold">
                        <span className="text-emerald-400">
                          Нәтиже: {examOutcome.score} / {examOutcome.total}
                        </span>
                        <span className="text-indigo-300">({examOutcome.percentage}%)</span>
                        <span className="text-yellow-400 font-bold">+{examOutcome.xpEarned} XP!</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveExam(null);
                          setExamOutcome(null);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                      >
                        Басқа емтихандарға оралу
                      </button>
                    </div>
                  ) : (
                    /* Сұрақтар блогы */
                    <div className="space-y-4">
                      {activeExam.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white">{q.question}</span>
                          </div>

                          <div className="space-y-2 pl-8">
                            {q.options.map((opt, optIdx) => (
                              <label
                                key={optIdx}
                                className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                  examAnswers[idx] === optIdx
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`exam_q_${idx}`}
                                  checked={examAnswers[idx] === optIdx}
                                  onChange={() =>
                                    setExamAnswers(prev => ({ ...prev, [idx]: optIdx }))
                                  }
                                  className="text-indigo-600 focus:ring-0"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSubmitExam}
                          disabled={examSubmitting}
                          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{examSubmitting ? 'Тексерілуде...' : t.submitExam}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 9. ГЕЙМИФИКАЦИЯ ЖӘНЕ РЕЙТИНГ (LEADERBOARD) */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>{t.leaderboardTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Тапсырмалар мен тесттерді сәтті тапсырған оқушылардың рейтингі мен жетістіктері.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Оқушының жеке жетістіктер блогы */}
                <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span>{t.badges}</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
                      <span className="text-2xl">🌱</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.badge1}</div>
                        <div className="text-[10px] text-slate-400">Платформаға тіркелгені үшін</div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-xl p-3 flex items-center space-x-3 transition ${
                        user.xp >= 300
                          ? 'bg-slate-900/80 border-indigo-500/40'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">⚡</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.badge2}</div>
                        <div className="text-[10px] text-slate-400">300+ XP жинағаны үшін</div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-xl p-3 flex items-center space-x-3 transition ${
                        user.xp >= 600
                          ? 'bg-slate-900/80 border-indigo-500/40'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">💻</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.badge3}</div>
                        <div className="text-[10px] text-slate-400">600+ XP жинағаны үшін</div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-xl p-3 flex items-center space-x-3 transition ${
                        user.xp >= 900
                          ? 'bg-slate-900/80 border-indigo-500/40'
                          : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">🔥</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.badge4}</div>
                        <div className="text-[10px] text-slate-400">900+ XP жинағаны үшін</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Сынып көшбасшыларының тізімі (Leaderboard) */}
                <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>{t.topStudents}</span>
                  </h3>

                  <div className="space-y-2">
                    {leaderboard.map((st, idx) => (
                      <div
                        key={st.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          idx === 0
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                            : idx === 1
                            ? 'bg-slate-800/80 border-slate-600 text-slate-200'
                            : idx === 2
                            ? 'bg-amber-950/30 border-amber-700/30 text-amber-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-full bg-slate-800 font-bold text-xs flex items-center justify-center">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{st.fullName}</div>
                            <div className="text-[10px] text-slate-400">{st.grade}{t.gradeSuffix}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 font-bold text-xs text-yellow-400">
                          <span>{st.xp}</span>
                          <span className="text-[10px] text-slate-400">XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. PYTHON STREAMLIT БАСТАПҚЫ КОДЫ (APP.PY ЖӘНЕ REQUIREMENTS) */}
          {activeTab === 'python_code' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span>{t.pythonCodeTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{t.pythonCodeDesc}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyPythonCode}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow"
                  >
                    {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{codeCopied ? t.copied : t.copyCode}</span>
                  </button>

                  <button
                    onClick={() => triggerDownload(pythonAppCode, 'app.py')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadAppPy}</span>
                  </button>
                </div>
              </div>

              {/* Іске қосу нұсқаулығы */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-cyan-300 block">{t.howToRun}</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <p># 1. Тәуелділіктерді орнату (pip install):</p>
                  <p className="text-emerald-400 font-bold">
                    pip install streamlit google-genai pypdf
                  </p>
                  <p className="pt-1"># 2. Gemini API кілтін орнату:</p>
                  <p className="text-amber-400 font-bold">export GEMINI_API_KEY="СІЗДІҢ_КІЛТІҢІЗ"</p>
                  <p className="pt-1"># 3. Streamlit қосымшасын іске қосу:</p>
                  <p className="text-cyan-400 font-bold">streamlit run app.py</p>
                </div>
              </div>

              {/* Код терезесі */}
              <div className="relative rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>📄 app.py (Streamlit + SQLite + Google GenAI SDK)</span>
                  <span className="text-slate-500">{pythonAppCode.length} таңба</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  <code>{pythonAppCode || '# Python файлы жүктелуде...'}</code>
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
