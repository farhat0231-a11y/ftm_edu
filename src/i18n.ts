export type Language = 'kk' | 'ru' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  schoolGrade: string;
  allGrades: string;
  gradeSuffix: string;
  roleTeacher: string;
  roleStudent: string;
  currentRole: string;
  switchRole: string;
  demoLogin: string;
  login: string;
  register: string;
  logout: string;
  username: string;
  password: string;
  fullName: string;
  welcome: string;

  // Nav
  navOverview: string;
  navTextbooks: string;
  navAiGenerator: string;
  navExamBuilder: string;
  navGradebook: string;
  navLessons: string;
  navTasks: string;
  navExams: string;
  navLeaderboard: string;
  navPythonCode: string;

  // Textbooks
  textbookTitle: string;
  uploadTextbook: string;
  chooseFile: string;
  textbookContentPlaceholder: string;
  saveTextbook: string;
  uploadedBy: string;
  readSample: string;

  // Lesson Gen
  lessonGenTitle: string;
  lessonGenSubtitle: string;
  selectTopic: string;
  topicPlaceholder: string;
  basedOnTextbook: string;
  generateLessonBtn: string;
  generatingLesson: string;
  lessonSavedSuccess: string;
  theorySection: string;
  tasksSection: string;
  descriptorsSection: string;

  // Exam Builder
  examBuilderTitle: string;
  examTitlePlaceholder: string;
  examDuration: string;
  examQuestionCount: string;
  generateAiExam: string;
  generatingExam: string;
  examCreatedSuccess: string;
  previewExam: string;

  // Gradebook
  gradebookTitle: string;
  studentName: string;
  taskTitle: string;
  score: string;
  feedback: string;
  examResults: string;
  percentage: string;

  // Student Modules
  lessonsCatalog: string;
  readLesson: string;
  taskCenterTitle: string;
  taskDescription: string;
  codeOrAnswer: string;
  submitAndAiGrade: string;
  aiEvaluating: string;
  aiResultTitle: string;
  xpEarned: string;
  takeExamTitle: string;
  startExam: string;
  timeLeft: string;
  submitExam: string;
  examCompleted: string;

  // Gamification
  leaderboardTitle: string;
  yourRank: string;
  xpPoints: string;
  topStudents: string;
  badges: string;
  badge1: string;
  badge2: string;
  badge3: string;
  badge4: string;

  // Python tab
  pythonCodeTitle: string;
  pythonCodeDesc: string;
  copyCode: string;
  copied: string;
  downloadAppPy: string;
  downloadReqs: string;
  howToRun: string;
}

export const translations: Record<Language, Translations> = {
  kk: {
    appName: 'FTM Edu',
    appSubtitle: '7-11 сынып Информатика пәніне арналған цифрлық білім платформасы (LMS)',
    schoolGrade: 'Сынып',
    allGrades: 'Барлық сыныптар',
    gradeSuffix: '-сынып',
    roleTeacher: 'Мұғалім',
    roleStudent: 'Оқушы',
    currentRole: 'Ағымдағы рөл',
    switchRole: 'Рөлді ауыстыру',
    demoLogin: 'Жылдам Демо Кіру',
    login: 'Кіру',
    register: 'Тіркелу',
    logout: 'Шығу',
    username: 'Қолданушы аты (Логин)',
    password: 'Құпиясөз',
    fullName: 'Толық аты-жөні',
    welcome: 'Қош келдіңіз',

    navOverview: 'Жалпы шолу',
    navTextbooks: 'Оқулықтар қоры',
    navAiGenerator: 'AI Сабақ пен Дескрипторлар',
    navExamBuilder: 'Емтихан құрастырушы',
    navGradebook: 'Бағалау журналы',
    navLessons: 'Сабақтар мен Конспектілер',
    navTasks: 'Тапсырмалар орталығы',
    navExams: 'Емтихан тапсыру (Таймермен)',
    navLeaderboard: 'Рейтинг және Геймификация',
    navPythonCode: 'Python Streamlit (app.py)',

    textbookTitle: '7-11 сынып оқулықтары мен әдістемелік материалдары',
    uploadTextbook: 'Жаңа оқулық немесе тақырыптық мәтін жүктеу (PDF / TXT)',
    chooseFile: 'Файлды таңдаңыз немесе мәтінді қойыңыз',
    textbookContentPlaceholder: 'Оқулық парақтарының мәтінін осында енгізіңіз немесе файлды тіркеңіз...',
    saveTextbook: 'Қорға сақтау',
    uploadedBy: 'Жүктеген',
    readSample: 'Мазмұнын көру',

    lessonGenTitle: 'Gemini AI Сабақ пен Дескриптор Генераторы',
    lessonGenSubtitle: 'Тақырып пен оқулық контексті негізінде сапалы теориялық конспект, А/В/С деңгейлі тапсырмалар мен бағалау критерийлерін жасаңыз',
    selectTopic: 'Сабақ тақырыбы',
    topicPlaceholder: 'Мысалы: Python тіліндегі екіөлшемді массивтер мен матрицаларды өңдеу',
    basedOnTextbook: 'Негізге алынатын оқулық',
    generateLessonBtn: 'Gemini AI арқылы сабақ генерациялау',
    generatingLesson: 'Gemini AI сабақ жоспарын, теорияны және дескрипторларды құруда...',
    lessonSavedSuccess: 'Сабақ сәтті генерацияланды және оқушылар каталогына сақталды!',
    theorySection: 'Теориялық конспект',
    tasksSection: 'Деңгейлік тапсырмалар (A, B, C)',
    descriptorsSection: 'Бағалау дескрипторлары',

    examBuilderTitle: 'Емтихан құрастырушы (Exam Builder)',
    examTitlePlaceholder: 'Мысалы: 1-тоқсан бойынша жиынтық бақылау жұмысы (ТЖБ)',
    examDuration: 'Емтихан ұзақтығы (минутпен)',
    examQuestionCount: 'Сұрақ саны',
    generateAiExam: 'AI көмегімен сұрақтар құру',
    generatingExam: 'Сұрақтар мен нұсқалар дайындалуда...',
    examCreatedSuccess: 'Емтихан сәтті құрылды және оқушыларға қолжетімді!',
    previewExam: 'Емтихан сұрақтарын қарап шығу',

    gradebookTitle: 'Бағалау журналы және мониторинг',
    studentName: 'Оқушы',
    taskTitle: 'Тапсырма',
    score: 'Балл',
    feedback: 'Кері байланыс және талдау',
    examResults: 'Емтихан нәтижелері',
    percentage: 'Пайыз',

    lessonsCatalog: 'Сабақтар мен оқу материалдарының жинағы',
    readLesson: 'Сабақты оқу',
    taskCenterTitle: 'Интерактивті тапсырмалар мен бағдарламалау орталығы',
    taskDescription: 'Тапсырманы мұқият оқып, шешіміңізді немесе Python кодын жазыңыз:',
    codeOrAnswer: 'Шешіміңіз немесе бағдарлама кодыңыз:',
    submitAndAiGrade: 'Жауапты жіберу және AI арқылы тексеру',
    aiEvaluating: 'Gemini AI шешіміңізді дескриптор бойынша бағалауда...',
    aiResultTitle: 'AI бағалау нәтижесі мен дескрипторлық талдауы',
    xpEarned: 'Жинаған XP ұпайыңыз',
    takeExamTitle: 'Емтихан тапсыру (Онлайн тест жүйесі)',
    startExam: 'Емтиханды бастау',
    timeLeft: 'Қалған уақыт:',
    submitExam: 'Емтиханды аяқтау және бағаны көру',
    examCompleted: 'Емтихан сәтті аяқталды!',

    leaderboardTitle: 'Сынып рейтингі және Геймификация',
    yourRank: 'Сіздің дәрежеңіз',
    xpPoints: 'Тәжірибе ұпайлары (XP)',
    topStudents: 'Үздік оқушылар көшбасшылары',
    badges: 'Қол жеткізілген жетістіктер (Badges)',
    badge1: '🌱 Junior Coder — Алғашқы қадам',
    badge2: '⚡ Algorithm Explorer — Алгоритмші',
    badge3: '💻 Python Master — Бағдарламалау шебері',
    badge4: '🔥 AI & Cyber Guru — Информатика сұңқары',

    pythonCodeTitle: 'Python Streamlit (app.py) коды',
    pythonCodeDesc: 'Бұл платформаның Python (Streamlit + SQLite + google-genai) тіліндегі толық, қатесіз бастапқы коды.',
    copyCode: 'Кодты көшіріп алу',
    copied: 'Көшірілді!',
    downloadAppPy: 'app.py жүктеп алу',
    downloadReqs: 'requirements.txt жүктеп алу',
    howToRun: 'Жергілікті компьютерде іске қосу нұсқаулығы:',
  },
  ru: {
    appName: 'FTM Edu',
    appSubtitle: 'Цифровая образовательная платформа (LMS) по информатике для 7-11 классов',
    schoolGrade: 'Класс',
    allGrades: 'Все классы',
    gradeSuffix: ' класс',
    roleTeacher: 'Учитель',
    roleStudent: 'Ученик',
    currentRole: 'Текущая роль',
    switchRole: 'Сменить роль',
    demoLogin: 'Быстрый Демо Вход',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    username: 'Имя пользователя (Логин)',
    password: 'Пароль',
    fullName: 'ФИО пользователя',
    welcome: 'Добро пожаловать',

    navOverview: 'Обзор',
    navTextbooks: 'База учебников',
    navAiGenerator: 'AI Уроки и Дескрипторы',
    navExamBuilder: 'Конструктор экзаменов',
    navGradebook: 'Журнал оценок',
    navLessons: 'Уроки и Конспекты',
    navTasks: 'Центр заданий',
    navExams: 'Сдача экзаменов (Таймер)',
    navLeaderboard: 'Рейтинг и Геймификация',
    navPythonCode: 'Python Streamlit (app.py)',

    textbookTitle: 'Учебники и методические материалы для 7-11 классов',
    uploadTextbook: 'Загрузить учебник или текст темы (PDF / TXT)',
    chooseFile: 'Выберите файл или вставьте текст',
    textbookContentPlaceholder: 'Вставьте текст страниц учебника или прикрепите файл...',
    saveTextbook: 'Сохранить в базу',
    uploadedBy: 'Загрузил(а)',
    readSample: 'Просмотр содержимого',

    lessonGenTitle: 'Gemini AI Генератор уроков и дескрипторов',
    lessonGenSubtitle: 'Создавайте структурированные конспекты, разноуровневые задания (A, B, C) и критерии оценивания на базе учебников',
    selectTopic: 'Тема урока',
    topicPlaceholder: 'Например: Двумерные массивы и обработка матриц в Python',
    basedOnTextbook: 'Опорный учебник',
    generateLessonBtn: 'Сгенерировать урок через Gemini AI',
    generatingLesson: 'Gemini AI готовит конспект, разноуровневые задания и дескрипторы...',
    lessonSavedSuccess: 'Урок успешно создан и опубликован для учащихся!',
    theorySection: 'Теоретический конспект',
    tasksSection: 'Разноуровневые задания (A, B, C)',
    descriptorsSection: 'Критерии и дескрипторы',

    examBuilderTitle: 'Конструктор экзаменов (Exam Builder)',
    examTitlePlaceholder: 'Например: Суммативное оценивание за 1 четверть (СОЧ)',
    examDuration: 'Длительность экзамена (в минутах)',
    examQuestionCount: 'Количество вопросов',
    generateAiExam: 'Создать вопросы через AI',
    generatingExam: 'Генерация вопросов и вариантов ответов...',
    examCreatedSuccess: 'Экзамен успешно создан и доступен ученикам!',
    previewExam: 'Предпросмотр вопросов',

    gradebookTitle: 'Журнал успеваемости и мониторинг',
    studentName: 'Ученик',
    taskTitle: 'Задание',
    score: 'Балл',
    feedback: 'Обратная связь и анализ',
    examResults: 'Результаты экзаменов',
    percentage: 'Процент',

    lessonsCatalog: 'Каталог уроков и учебных материалов',
    readLesson: 'Читать урок',
    taskCenterTitle: 'Центр интерактивных задач и программирования',
    taskDescription: 'Внимательно прочитайте задание и напишите решение или код Python:',
    codeOrAnswer: 'Ваше решение или программный код:',
    submitAndAiGrade: 'Отправить ответ и проверить через AI',
    aiEvaluating: 'Gemini AI анализирует решение по дескрипторам...',
    aiResultTitle: 'Результат проверки AI и дескрипторный анализ',
    xpEarned: 'Получено очков опыта (XP)',
    takeExamTitle: 'Сдача экзамена (Онлайн тестирование)',
    startExam: 'Начать экзамен',
    timeLeft: 'Оставшееся время:',
    submitExam: 'Завершить экзамен и узнать оценку',
    examCompleted: 'Экзамен успешно сдан!',

    leaderboardTitle: 'Рейтинг класса и Геймификация',
    yourRank: 'Ваш ранг',
    xpPoints: 'Очки опыта (XP)',
    topStudents: 'Топ лидеров класса',
    badges: 'Полученные достижения (Badges)',
    badge1: '🌱 Junior Coder — Первый шаг',
    badge2: '⚡ Algorithm Explorer — Алгоритмист',
    badge3: '💻 Python Master — Мастер кода',
    badge4: '🔥 AI & Cyber Guru — Эксперт информатики',

    pythonCodeTitle: 'Код Python Streamlit (app.py)',
    pythonCodeDesc: 'Полный, готовый к запуску исходный код прототипа на Python (Streamlit + SQLite + google-genai).',
    copyCode: 'Скопировать код',
    copied: 'Скопировано!',
    downloadAppPy: 'Скачать app.py',
    downloadReqs: 'Скачать requirements.txt',
    howToRun: 'Инструкция по запуску на компьютере:',
  },
  en: {
    appName: 'FTM Edu',
    appSubtitle: 'EdTech Computer Science LMS for Grades 7-11 (Teachers & Students)',
    schoolGrade: 'Grade',
    allGrades: 'All Grades',
    gradeSuffix: ' Grade',
    roleTeacher: 'Teacher',
    roleStudent: 'Student',
    currentRole: 'Current Role',
    switchRole: 'Switch Role',
    demoLogin: 'Quick Demo Login',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    fullName: 'Full Name',
    welcome: 'Welcome',

    navOverview: 'Overview',
    navTextbooks: 'Textbooks Base',
    navAiGenerator: 'AI Lessons & Descriptors',
    navExamBuilder: 'Exam Builder',
    navGradebook: 'Gradebook',
    navLessons: 'Lessons & Notes',
    navTasks: 'Tasks Center',
    navExams: 'Take Exams (Timer)',
    navLeaderboard: 'Leaderboard & Gamification',
    navPythonCode: 'Python Streamlit (app.py)',

    textbookTitle: 'Textbooks and Teaching Materials for Grades 7-11',
    uploadTextbook: 'Upload Textbook or Topic Material (PDF / TXT)',
    chooseFile: 'Select file or paste text content',
    textbookContentPlaceholder: 'Paste textbook text or attach a file...',
    saveTextbook: 'Save to Repository',
    uploadedBy: 'Uploaded by',
    readSample: 'View Content',

    lessonGenTitle: 'Gemini AI Lesson & Descriptors Generator',
    lessonGenSubtitle: 'Generate structured theory notes, tiered tasks (A, B, C), and assessment descriptors grounded in textbooks',
    selectTopic: 'Lesson Topic',
    topicPlaceholder: 'e.g. 2D Arrays and Matrix Manipulations in Python',
    basedOnTextbook: 'Reference Textbook',
    generateLessonBtn: 'Generate Lesson with Gemini AI',
    generatingLesson: 'Gemini AI is crafting the lesson note, multi-level tasks, and descriptors...',
    lessonSavedSuccess: 'Lesson generated and published to student catalog!',
    theorySection: 'Theoretical Notes',
    tasksSection: 'Tiered Tasks (A, B, C)',
    descriptorsSection: 'Assessment Descriptors',

    examBuilderTitle: 'Exam Builder',
    examTitlePlaceholder: 'e.g. Term 1 Summative Assessment Examination',
    examDuration: 'Exam Duration (minutes)',
    examQuestionCount: 'Number of Questions',
    generateAiExam: 'Generate Questions with AI',
    generatingExam: 'Generating questions and options...',
    examCreatedSuccess: 'Exam successfully created and made available to students!',
    previewExam: 'Preview Questions',

    gradebookTitle: 'Gradebook & Academic Monitoring',
    studentName: 'Student',
    taskTitle: 'Task',
    score: 'Score',
    feedback: 'Feedback & Analysis',
    examResults: 'Exam Results',
    percentage: 'Percentage',

    lessonsCatalog: 'Lessons & Study Materials Catalog',
    readLesson: 'Read Lesson',
    taskCenterTitle: 'Interactive Tasks & Programming Center',
    taskDescription: 'Read the problem statement carefully and submit your solution or Python code:',
    codeOrAnswer: 'Your Solution or Python Code:',
    submitAndAiGrade: 'Submit Answer & Evaluate with AI',
    aiEvaluating: 'Gemini AI is evaluating your solution against descriptors...',
    aiResultTitle: 'AI Feedback & Descriptor-based Assessment',
    xpEarned: 'XP Points Earned',
    takeExamTitle: 'Take Exam (Timed Testing System)',
    startExam: 'Start Exam',
    timeLeft: 'Time Remaining:',
    submitExam: 'Submit Exam & Check Grade',
    examCompleted: 'Exam Completed Successfully!',

    leaderboardTitle: 'Class Leaderboard & Gamification',
    yourRank: 'Your Rank',
    xpPoints: 'Experience Points (XP)',
    topStudents: 'Top Class Leaders',
    badges: 'Earned Badges & Achievements',
    badge1: '🌱 Junior Coder — First Step',
    badge2: '⚡ Algorithm Explorer — Algorithmist',
    badge3: '💻 Python Master — Coding Ace',
    badge4: '🔥 AI & Cyber Guru — Informatics Master',

    pythonCodeTitle: 'Python Streamlit (app.py) Source Code',
    pythonCodeDesc: 'Complete, production-ready Python source code using Streamlit, SQLite, and the google-genai SDK.',
    copyCode: 'Copy Source Code',
    copied: 'Copied!',
    downloadAppPy: 'Download app.py',
    downloadReqs: 'Download requirements.txt',
    howToRun: 'Local Execution Instructions:',
  },
};
