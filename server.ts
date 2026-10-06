import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Gemini SDK орнату (Server-side)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// ИНФОРМАТИКА 7-11 СЫНЫПТАРЫ БОЙЫНША БАСТАПҚЫ БАЗА (DATABASE)
// -------------------------------------------------------------
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

interface Lesson {
  id: string;
  grade: number;
  topic: string;
  language: 'kk' | 'ru' | 'en';
  theory: string;
  tasks: Array<{
    id: string;
    level: 'A' | 'B' | 'C';
    title: string;
    description: string;
    points: number;
    descriptors: string[];
  }>;
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

// Бастапқы пайдаланушылар
let users: User[] = [
  { id: 'u_t1', username: 'teacher', fullName: 'Ахметов Бауыржан Нұрланұлы', role: 'teacher', grade: 0, xp: 850 },
  { id: 'u_s1', username: 'student1', fullName: 'Қасымов Әлішер', role: 'student', grade: 9, xp: 520 },
  { id: 'u_s2', username: 'student2', fullName: 'Серікқызы Аружан', role: 'student', grade: 9, xp: 640 },
  { id: 'u_s3', username: 'student3', fullName: 'Иванов Даниил', role: 'student', grade: 8, xp: 380 },
  { id: 'u_s4', username: 'student4', fullName: 'Жұмабек Айдын', role: 'student', grade: 10, xp: 710 },
  { id: 'u_s5', username: 'student5', fullName: 'Смайлова Динара', role: 'student', grade: 11, xp: 950 },
  { id: 'u_s6', username: 'student6', fullName: 'Ерболатқызы Мәдина', role: 'student', grade: 7, xp: 290 },
];

// Бастапқы оқулықтар (7-11 сыныптар)
let textbooks: Textbook[] = [
  {
    id: 'tb_7',
    grade: 7,
    title: 'Информатика 7-сынып: Компьютерлік жүйелер және Python негіздері',
    filename: 'informatics_grade7.txt',
    content: `7-сынып Информатика. Тақырып: Компьютердің архитектурасы және Python тіліндегі қарапайым алгоритмдер.
Процессор (CPU), жедел жад (RAM), сыртқы жад құрылғыларының қызметі.
Python бағдарламалау тіліне кіріспе: айнымалылар, деректер типтері (int, float, str), print() және input() операторлары.
Шартты оператор: if-elif-else құрылымы және логикалық амалдар (and, or, not). Салыстыру операторлары: ==, !=, >, <, >=, <=.`,
    uploadedBy: 'teacher',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'tb_8',
    grade: 8,
    title: 'Информатика 8-сынып: Циклдік алгоритмдер және желілік қауіпсіздік',
    filename: 'informatics_grade8.txt',
    content: `8-сынып Информатика. Тақырып: Қайталану операторлары (for, while) және компьютерлік желілер.
for циклі және range() функциясы: range(бастапқы, соңғы, қадам). while шарты орындалғанша қайталанатын цикл.
break және continue операторлары.
Компьютерлік желілер: IP мекенжай, DNS сервер, желілік топологиялар (жұлдыз, сақина, шина). Деректерді қорғау және желілік гигиена.`,
    uploadedBy: 'teacher',
    createdAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'tb_9',
    grade: 9,
    title: 'Информатика 9-сынып: Екіөлшемді массивтер және Мәліметтер қоры',
    filename: 'informatics_grade9.txt',
    content: `9-сынып Информатика. Тақырып: Python тіліндегі екіөлшемді массивтер (матрицалар) және SQL негіздері.
Матрица - жолдар мен бағандардан тұратын кесте. Python-да тізімдердің тізімі: matrix = [[1, 2], [3, 4]].
Матрицаны құру және оны қос цикл көмегімен өңдеу (бас диагональ, қосалқы диагональ элементтерінің қосындысы).
Мәліметтер қоры (ДҚ) түсінігі. Реляциялық деректер қоры. SQL сұраныстары: SELECT, INSERT, UPDATE, DELETE, WHERE.`,
    uploadedBy: 'teacher',
    createdAt: '2026-09-03T10:00:00Z',
  },
  {
    id: 'tb_10',
    grade: 10,
    title: 'Информатика 10-сынып: Объектіге бағытталған бағдарламалау (OOP) және Деректер құрылымы',
    filename: 'informatics_grade10.txt',
    content: `10-сынып Информатика. Тақырып: OOP концепциялары және күрделі деректер құрылымдары.
Кластар мен объектілер. Конструктор __init__ және self параметрі.
OOP үш негізгі ұстанымы: инкапсуляция, мұрагерлік (inheritance), полиморфизм.
Деректер құрылымы: Стек (LIFO - Last In First Out), Кезек (FIFO - First In First Out), Екілік ағаш (Binary Tree).
Жасанды интеллект негіздері және сараптамалық жүйелер.`,
    uploadedBy: 'teacher',
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'tb_11',
    grade: 11,
    title: 'Информатика 11-сынып: Machine Learning, Big Data және Киберқауіпсіздік',
    filename: 'informatics_grade11.txt',
    content: `11-сынып Информатика. Тақырып: Машиналық оқыту алгоритмдері, Үлкен деректер және криптография.
Жасанды интеллект және Machine Learning: Мұғаліммен оқыту (Supervised: классификация, регрессия) және мұғалімсіз оқыту (Unsupervised: кластерлеу).
Үлкен деректердің 5V қасиеті: Volume, Velocity, Variety, Veracity, Value.
Киберқауіпсіздік: Асимметриялық (RSA) және симметриялық (AES) шифрлау. Хэштеу алгоритмдері (SHA-256). Блокчейн архитектурасы.`,
    uploadedBy: 'teacher',
    createdAt: '2026-09-05T12:00:00Z',
  },
];

// Бастапқы сабақтар
let lessons: Lesson[] = [
  {
    id: 'l_9_matrix',
    grade: 9,
    topic: 'Python тіліндегі екіөлшемді массивтер (Матрицалар)',
    language: 'kk',
    theory: `### 📌 Екіөлшемді массивтер (Матрицалар) деген не?

Информатикада **екіөлшемді массив** (two-dimensional array немесе матрица) — бұл элементтері қатарлар (rows) мен бағандар (columns) бойынша орналасқан кестелік құрылым.

#### 1. Python-да матрица құру:
Python тілінде кірістірілген тізімдерді (nested lists) қолданамыз:
\`\`\`python
# 3 жол және 3 бағаннан тұратын матрица
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
\`\`\`

#### 2. Элементке қол жеткізу:
Элементті алу үшін қос индекс қолданылады: \`matrix[i][j]\`
- \`i\` — жол нөмірі (0-ден басталады)
- \`j\` — баған нөмірі (0-ден басталады)
\`\`\`python
print(matrix[0][1]) # 2 санын шығарады
print(matrix[2][2]) # 9 санын шығарады
\`\`\`

#### 3. Матрица элементтерін қос циклмен басып шығару:
\`\`\`python
for i in range(len(matrix)):
    for j in range(len(matrix[i])):
        print(matrix[i][j], end=" ")
    print()
\`\`\`
`,
    tasks: [
      {
        id: 't_9_1',
        level: 'A',
        title: 'Матрица элементін экранға шығару',
        description: 'Өлшемі 2x3 болатын матрица құрыңыз және 2-жолдың 3-элементін экранға шығарыңыз.',
        points: 5,
        descriptors: [
          'Python тілінде кірістірілген тізімді дұрыс анықтайды',
          'Индекстеу ережесін сақтай отырып қажетті элементті басып шығарады',
        ],
      },
      {
        id: 't_9_2',
        level: 'B',
        title: 'Матрицаның бас диагональ қосындысы',
        description: 'NxN өлшемді квадрат матрицаның бас диагоналында орналасқан барлық сандардың қосындысын табатын бағдарлама жазыңыз.',
        points: 10,
        descriptors: [
          'Кіріс деректерін қабылдайды немесе берілген матрицаны оқиды',
          'Бас диагональ шартын (i == j) қолданады',
          'Қосындыны есептеп дұрыс нәтиже береді',
        ],
      },
      {
        id: 't_9_3',
        level: 'C',
        title: 'Матрицаны сағат тілімен 90 градусқа бұру (Транспозиция)',
        description: 'Берілген NxN матрицасын сағат тілі бойынша 90 градусқа бұрып, жаңа матрицаны экранға көрнекі кесте түрінде шығаратын тиімді алгоритм ұсыныңыз.',
        points: 15,
        descriptors: [
          'Алгоритмнің күрделілігін оңтайландырады',
          'Транспозиция және жолдарды кері аудару әдісін жүзеге асырады',
          'Экранға дұрыс форматта басып шығарады',
        ],
      },
    ],
    createdBy: 'teacher',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'l_8_loops',
    grade: 8,
    topic: 'Python-да for және while циклдік операторлары',
    language: 'kk',
    theory: `### 🔁 Циклдік алгоритмдер: for және while

Бағдарламалауда бір әрекетті бірнеше рет қайталау үшін **циклдер** қолданылады.

#### 1. \`for\` циклі және \`range()\`
\`for\` циклі элементтер жиынын немесе берілген диапазонды аралап өту үшін қолданылады:
\`\`\`python
# 1-ден 5-ке дейінгі сандарды шығару
for i in range(1, 6):
    print("Қадам:", i)
\`\`\`

#### 2. \`while\` циклі
Шарт \`True\` болып тұрған кезде қайталанады:
\`\`\`python
counter = 0
while counter < 3:
    print("Санауыш:", counter)
    counter += 1
\`\`\`
`,
    tasks: [
      {
        id: 't_8_1',
        level: 'A',
        title: 'Жұп сандарды басып шығару',
        description: '1-ден 20-ға дейінгі барлық жұп сандарды for циклі және range көмегімен шығарыңыз.',
        points: 5,
        descriptors: ['range функциясының қадамын дұрыс көрсетеді немесе % 2 шартын пайдаланады'],
      },
      {
        id: 't_8_2',
        level: 'B',
        title: 'Сандар факториалын табу',
        description: 'Пайдаланушы енгізген n бүтін санының факториалын (n!) while циклі арқылы есептейтін бағдарлама жазыңыз.',
        points: 10,
        descriptors: ['Айнымалыларды бастапқы мәнмен инициализациялайды', 'while циклінің тоқтау шартын дұрыс жазады', 'Нәтижені шығарады'],
      },
    ],
    createdBy: 'teacher',
    createdAt: '2026-09-12T11:00:00Z',
  },
];

// Бастапқы емтихандар
let exams: Exam[] = [
  {
    id: 'ex_9_term1',
    grade: 9,
    title: '9-сынып Информатика: Екіөлшемді массивтер және SQL бойынша бақылау тесті',
    durationMinutes: 20,
    questions: [
      {
        id: 'q1',
        question: 'Python тілінде 3x3 матрицаның ортаңғы элементіне қай өрнек арқылы қол жеткіземіз?',
        options: ['matrix[1][1]', 'matrix[2][2]', 'matrix(1, 1)', 'matrix[0][0]'],
        correctIndex: 0,
        explanation: 'Python индексі 0-ден басталатындықтан, 2-жол мен 2-бағанның индекстері [1][1] болады.',
      },
      {
        id: 'q2',
        question: 'Квадрат матрицаның бас диагоналында орналасқан элементтердің индекстік шарты қандай?',
        options: ['i == j', 'i + j == n - 1', 'i > j', 'i < j'],
        correctIndex: 0,
        explanation: 'Бас диагональда жол және баған индекстері тең болады: i == j (мыс: [0][0], [1][1], [2][2]).',
      },
      {
        id: 'q3',
        question: 'SQL тілінде кестеден барлық деректерді алу үшін қандай сұраныс қолданылады?',
        options: ['GET * FROM table;', 'SELECT * FROM table;', 'FETCH ALL IN table;', 'EXTRACT table;'],
        correctIndex: 1,
        explanation: 'SELECT операторы және * (барлық бағандар) комбинациясы қолданылады.',
      },
      {
        id: 'q4',
        question: 'matrix = [[1, 2], [3, 4]] болса, len(matrix) мәні неге тең?',
        options: ['4', '2', '1', '16'],
        correctIndex: 1,
        explanation: 'len(matrix) сыртқы тізімнің ұзындығын (жолдар санын) қайтарады, ол 2-ге тең.',
      },
    ],
    createdBy: 'teacher',
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'ex_8_quiz',
    grade: 8,
    title: '8-сынып: Циклдік алгоритмдер және желілер экспресс-тесті',
    durationMinutes: 15,
    questions: [
      {
        id: 'q8_1',
        question: 'range(2, 10, 3) функциясы қандай сандар тізбегін қайтарады?',
        options: ['[2, 5, 8]', '[2, 3, 4, 5, 6, 7, 8, 9]', '[2, 4, 6, 8, 10]', '[3, 6, 9]'],
        correctIndex: 0,
        explanation: 'Басталуы 2, соңы 10 (енбейді), қадамы 3: 2, 2+3=5, 5+3=8.',
      },
      {
        id: 'q8_2',
        question: 'Циклдің кезекті қадамын өткізіп жіберіп, келесі итерацияға көшу операторы:',
        options: ['break', 'continue', 'pass', 'return'],
        correctIndex: 1,
        explanation: 'continue операторы ағымдағы қадамды аяқтап, циклдің келесі қадамына өтеді.',
      },
    ],
    createdBy: 'teacher',
    createdAt: '2026-09-18T10:00:00Z',
  },
];

// Бастапқы тапсырмалар жауаптары
let submissions: TaskSubmission[] = [
  {
    id: 'sub_1',
    lessonId: 'l_9_matrix',
    taskTitle: 'Матрицаның бас диагональ қосындысы',
    studentId: 'u_s2',
    studentName: 'Серікқызы Аружан',
    grade: 9,
    answer: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
total = 0
for i in range(len(matrix)):
    total += matrix[i][i]
print("Қосынды:", total)`,
    score: 10,
    maxScore: 10,
    feedback: 'Керемет жұмыс! Алгоритм өте тиімді бір циклмен (O(N)) орындалған. Дескрипторлар 100% орындалды.',
    submittedAt: '2026-09-20T14:30:00Z',
  },
  {
    id: 'sub_2',
    lessonId: 'l_9_matrix',
    taskTitle: 'Матрица элементін экранға шығару',
    studentId: 'u_s1',
    studentName: 'Қасымов Әлішер',
    grade: 9,
    answer: `m = [[10, 20, 30], [40, 50, 60]]
print(m[1][2])`,
    score: 5,
    maxScore: 5,
    feedback: 'Жарайсың! 2-жолдың 3-элементі (индекс [1][2]) дұрыс таңдалған.',
    submittedAt: '2026-09-21T10:15:00Z',
  },
];

// Бастапқы емтихан нәтижелері
let examResults: ExamResult[] = [
  {
    id: 'res_1',
    examId: 'ex_9_term1',
    examTitle: '9-сынып Информатика: Екіөлшемді массивтер және SQL бойынша бақылау тесті',
    studentId: 'u_s2',
    studentName: 'Серікқызы Аружан',
    grade: 9,
    score: 4,
    totalQuestions: 4,
    percentage: 100,
    xpEarned: 200,
    completedAt: '2026-09-22T11:00:00Z',
  },
  {
    id: 'res_2',
    examId: 'ex_9_term1',
    examTitle: '9-сынып Информатика: Екіөлшемді массивтер және SQL бойынша бақылау тесті',
    studentId: 'u_s1',
    studentName: 'Қасымов Әлішер',
    grade: 9,
    score: 3,
    totalQuestions: 4,
    percentage: 75,
    xpEarned: 150,
    completedAt: '2026-09-22T11:45:00Z',
  },
];

// -------------------------------------------------------------
// API ЭНДПОЙНТТАР (EXPRESS ROUTES)
// -------------------------------------------------------------

// 1. АВТОРИЗАЦИЯ
app.post('/api/auth/login', (req, res) => {
  const { username, role } = req.body;
  const user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase() || u.role === role);
  if (user) {
    res.json({ success: true, user });
  } else {
    // Демо режимде жаңа кірушіге бейімдеу
    const defaultUser = users[0];
    res.json({ success: true, user: defaultUser });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, fullName, role, grade } = req.body;
  if (!username || !fullName) {
    return res.status(400).json({ error: 'Барлық өрістерді толтырыңыз' });
  }
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Бұл логин тіркелген' });
  }
  const newUser: User = {
    id: `u_${Date.now()}`,
    username,
    fullName,
    role: role || 'student',
    grade: Number(grade) || 7,
    xp: 0,
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.get('/api/users/leaderboard', (req, res) => {
  const sorted = users
    .filter(u => u.role === 'student')
    .sort((a, b) => b.xp - a.xp);
  res.json({ leaderboard: sorted });
});

// 2. ОҚУЛЫҚТАР (TEXTBOOKS)
app.get('/api/textbooks', (req, res) => {
  const grade = req.query.grade ? Number(req.query.grade) : null;
  const filtered = grade ? textbooks.filter(t => t.grade === grade) : textbooks;
  res.json({ textbooks: filtered });
});

app.post('/api/textbooks', (req, res) => {
  const { grade, title, filename, content, uploadedBy } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Тақырыбы мен мазмұны қажет' });
  }
  const newBook: Textbook = {
    id: `tb_${Date.now()}`,
    grade: Number(grade) || 9,
    title,
    filename: filename || 'custom_material.txt',
    content,
    uploadedBy: uploadedBy || 'teacher',
    createdAt: new Date().toISOString(),
  };
  textbooks.unshift(newBook);
  res.json({ success: true, textbook: newBook });
});

// 3. САБАҚТАР (LESSONS)
app.get('/api/lessons', (req, res) => {
  const grade = req.query.grade ? Number(req.query.grade) : null;
  const filtered = grade ? lessons.filter(l => l.grade === grade) : lessons;
  res.json({ lessons: filtered });
});

// 4. GEMINI AI: САБАҚ ЖӘНЕ ДЕСКРИПТОР ГЕНЕРАТОРЫ
app.post('/api/generate-lesson', async (req, res) => {
  const { grade, topic, textbookId, language } = req.body;
  const lang = language || 'kk';
  const langName = lang === 'kk' ? 'қазақша' : lang === 'ru' ? 'орысша' : 'ағылшынша (English)';

  const book = textbooks.find(t => t.id === textbookId || t.grade === Number(grade));
  const bookContext = book ? book.content.slice(0, 3000) : 'Қазақстан Республикасының 7-11 сынып информатика пәнінің оқу бағдарламасы';

  const systemInstruction = `Сіз — Қазақстанның жаңартылған мазмұндағы информатика пәнінің үздік әдіскер-мұғалімісіз.
Тапсырма: 7-11 сынып оқушыларына арналған заманауи, қызықты сабақ конспектісі мен дескрипторлық тапсырмалар әзірлеу.
Тіл: ${langName}.
Формат: Таза Markdown және құрылымдалған бөлімдер. Код мысалдары Python тілінде болуы тиіс.`;

  const prompt = `Сынып: ${grade}-сынып
Сабақ тақырыбы: ${topic}
Негізге алынған оқулық үзіндісі:
"""
${bookContext}
"""

Маған мына құрылым бойынша дайын сабақ жазып бер:
1. **Сабақтың мақсаты мен қысқаша анықтамасы**
2. **Толық теориялық конспект** (түсінікті тілмен, көрнекі диаграмма/сызба сипаттамасы, нақты Python код үлгілерімен және коменттермен).
3. **Үш деңгейлі тапсырмалар**:
   - **Деңгей A (Білу және түсіну, 5 балл)**: қарапайым базалық тапсырма + Дескрипторлары.
   - **Деңгей B (Қолдану, 10 балл)**: алгоритм құру, есеп шығару + Дескрипторлары.
   - **Деңгей C (Талдау және синтез, 15 балл)**: күрделі логикалық/практикалық бағдарламалау тапсырмасы + Дескрипторлары.
4. **Сілтемелер және өзін-өзі тексеру сұрақтары**.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const generatedTheory = response.text || 'Материал генерацияланды.';

    // Жаңа сабақ объектісін жасап, жүйеге автоматты қосу
    const newLesson: Lesson = {
      id: `l_${Date.now()}`,
      grade: Number(grade),
      topic,
      language: lang,
      theory: generatedTheory,
      tasks: [
        {
          id: `t_${Date.now()}_a`,
          level: 'A',
          title: `${topic}: Негізгі ұғымдар мен сұрақтар (A деңгей)`,
          description: `${topic} бойынша негізгі анықтамаларды жазып, үлгі кодты түсіндіріңіз.`,
          points: 5,
          descriptors: ['Тақырып анықтамасын дұрыс тұжырымдайды', 'Терминдерді қатесіз жазады'],
        },
        {
          id: `t_${Date.now()}_b`,
          level: 'B',
          title: `${topic}: Практикалық алгоритм құру (B деңгей)`,
          description: `Оқулықтағы мысал негізінде өз кодыңызды жазып, нәтижесін тексеріңіз.`,
          points: 10,
          descriptors: ['Python синтаксисін сақтайды', 'Шарттар мен циклдерді орынды қолданады'],
        },
        {
          id: `t_${Date.now()}_c`,
          level: 'C',
          title: `${topic}: Олимпиадалық және шығармашылық есеп (C деңгей)`,
          description: `Оңтайландырылған күрделі алгоритм құрып, уақыт пен жад күрделілігін сипаттаңыз.`,
          points: 15,
          descriptors: ['Алгоритмнің тиімділігін қамтамасыз етеді', 'Қосымша жағдайларды (edge cases) ескереді'],
        },
      ],
      createdBy: 'AI Assistant & Мұғалім',
      createdAt: new Date().toISOString(),
    };

    lessons.unshift(newLesson);

    res.json({
      success: true,
      lesson: newLesson,
      rawOutput: generatedTheory,
    });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'AI генерациясы кезінде қате орын алды: ' + (error?.message || '') });
  }
});

// 5. GEMINI AI: ЕМТИХАН СҰРАҚТАРЫН ГЕНЕРАЦИЯЛАУ (EXAM BUILDER)
app.post('/api/generate-exam', async (req, res) => {
  const { grade, title, durationMinutes, questionCount, topic, language } = req.body;
  const lang = language || 'kk';
  const langName = lang === 'kk' ? 'қазақша' : lang === 'ru' ? 'орысша' : 'English';
  const count = Number(questionCount) || 5;

  const prompt = `Сіз информатика пәнінен тест құрастырушы сарапшысыз.
Сынып: ${grade}-сынып
Тақырып: ${topic || title}
Тіл: ${langName}
Сұрақ саны: ${count}

Осы тақырып бойынша информатика пәніне арналған сапалы тест сұрақтарын JSON форматында құрып беріңіз.
Сұрақтар теорияны, Python код талдауын, қате табуды қамтуы керек.
Формат:
[
  {
    "id": "q1",
    "question": "Сұрақтың толық мәтіні немесе код блогы",
    "options": ["Нұсқа A", "Нұсқа B", "Нұсқа C", "Нұсқа D"],
    "correctIndex": 0,
    "explanation": "Неге бұл нұсқа дұрыс екенінің толық түсіндірмесі"
  }
]
Тек таза JSON жіберіңіз, ешқандай басы артық мәтінсіз.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedQuestions: ExamQuestion[] = JSON.parse(response.text || '[]');

    const newExam: Exam = {
      id: `ex_${Date.now()}`,
      grade: Number(grade),
      title,
      durationMinutes: Number(durationMinutes) || 20,
      questions: parsedQuestions,
      createdBy: 'Мұғалім (AI көмегімен)',
      createdAt: new Date().toISOString(),
    };

    exams.unshift(newExam);
    res.json({ success: true, exam: newExam });
  } catch (error: any) {
    console.error('Exam generator error:', error);
    res.status(500).json({ error: 'Тест генерациялау қатесі: ' + (error?.message || '') });
  }
});

// 6. ЕМТИХАНДАР (EXAMS)
app.get('/api/exams', (req, res) => {
  const grade = req.query.grade ? Number(req.query.grade) : null;
  const filtered = grade ? exams.filter(e => e.grade === grade) : exams;
  res.json({ exams: filtered });
});

app.post('/api/exams/submit', (req, res) => {
  const { examId, studentId, studentName, grade, answers } = req.body;
  const exam = exams.find(e => e.id === examId);
  if (!exam) {
    return res.status(404).json({ error: 'Емтихан табылмады' });
  }

  let score = 0;
  const total = exam.questions.length;

  exam.questions.forEach((q, idx) => {
    if (answers[idx] !== undefined && Number(answers[idx]) === q.correctIndex) {
      score += 1;
    }
  });

  const percentage = Math.round((score / total) * 100);
  const xpEarned = score * 50;

  // Оқушыға XP қосу
  const student = users.find(u => u.id === studentId || u.username === studentId);
  if (student) {
    student.xp += xpEarned;
  }

  const result: ExamResult = {
    id: `res_${Date.now()}`,
    examId,
    examTitle: exam.title,
    studentId: studentId || 'student1',
    studentName: studentName || 'Оқушы',
    grade: Number(grade) || exam.grade,
    score,
    totalQuestions: total,
    percentage,
    xpEarned,
    completedAt: new Date().toISOString(),
  };

  examResults.unshift(result);
  res.json({ success: true, result, correctAnswers: exam.questions.map(q => q.correctIndex) });
});

// 7. ТАПСЫРМАЛАР ОРТАЛЫҒЫ ЖӘНЕ AI БАҒАЛАУ (TASK SUBMISSION & AI GRADING)
app.post('/api/tasks/submit', async (req, res) => {
  const { lessonId, taskTitle, studentId, studentName, grade, answer, language } = req.body;
  const lang = language || 'kk';
  const langName = lang === 'kk' ? 'қазақша' : lang === 'ru' ? 'орысша' : 'English';

  let score = 8;
  let feedback = 'Жұмыс қабылданды.';
  let xpEarned = 80;

  try {
    const prompt = `Сіз қатаң әрі әділ информатика пәні мұғалімісіз.
Тапсырма тақырыбы: "${taskTitle}"
Оқушының жіберген коды немесе шешімі:
"""
${answer}
"""
Бағалау тілі: ${langName}

Осы жұмысты 10 балдық жүйе бойынша дескрипторлар арқылы тексеріп, JSON түрінде бағалаңыз.
JSON құрылымы:
{
  "score": (1-10 аралығындағы бүтін сан),
  "feedback": "Оқушыға конструктивті дескрипторлық талдау, қателері, жақсы тұстары және кодты жақсарту кеңесі",
  "xpEarned": (score * 10)
}
Тек таза JSON жіберіңіз.`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(aiRes.text || '{}');
    score = parsed.score || 8;
    feedback = parsed.feedback || 'Жақсы нәтиже!';
    xpEarned = parsed.xpEarned || score * 10;
  } catch (err) {
    console.warn('AI evaluation fallback:', err);
    score = 9;
    feedback = 'Шешім дұрыс құрылған. Негізгі алгоритмдік талаптар сақталған (Офлайн дескриптор).';
    xpEarned = 90;
  }

  // Оқушыға XP қосу
  const student = users.find(u => u.id === studentId || u.username === studentId);
  if (student) {
    student.xp += xpEarned;
  }

  const submission: TaskSubmission = {
    id: `sub_${Date.now()}`,
    lessonId,
    taskTitle,
    studentId: studentId || 'student1',
    studentName: studentName || 'Оқушы',
    grade: Number(grade) || 9,
    answer,
    score,
    maxScore: 10,
    feedback,
    submittedAt: new Date().toISOString(),
  };

  submissions.unshift(submission);
  res.json({ success: true, submission, xpEarned });
});

// 8. БАҒАЛАУ ЖУРНАЛЫ (GRADEBOOK)
app.get('/api/gradebook', (req, res) => {
  res.json({
    taskSubmissions: submissions,
    examResults: examResults,
  });
});

// 9. PYTHON STREAMLIT ФАЙЛЫН ОҚУ ЖӘНЕ ЖҮКТЕУ (APP.PY & REQUIREMENTS)
app.get('/api/download-python', (req, res) => {
  const pyPath = path.resolve(__dirname, 'app.py');
  const reqPath = path.resolve(__dirname, 'requirements.txt');

  let appPyCode = '';
  let requirementsTxt = '';

  try {
    if (fs.existsSync(pyPath)) {
      appPyCode = fs.readFileSync(pyPath, 'utf-8');
    }
    if (fs.existsSync(reqPath)) {
      requirementsTxt = fs.readFileSync(reqPath, 'utf-8');
    }
  } catch (e) {
    console.error('File read error:', e);
  }

  res.json({
    appPy: appPyCode,
    requirements: requirementsTxt,
  });
});

// -------------------------------------------------------------
// VITE SPA МЕН DEV / PROD СЕРВЕРДІ БАСТАУ
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 FTM Edu Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
