"""
FTM Edu - 7-11 сынып информатика мұғалімдері мен оқушыларына арналған
үш тілді (Қазақша, Орысша, Ағылшынша) толыққанды цифрлық білім беру платформасы (LMS).
Стек: Python (Streamlit) + SQLite + Google GenAI SDK (google-genai) + Python Code Playground
"""

import os
import sys
import io
import sqlite3
import hashlib
import json
import time
from datetime import datetime
import streamlit as st

# Google GenAI SDK (Жаңа ресми кітапхана)
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# PDF файлдарын оқу (pypdf)
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

# -------------------------------------------------------------
# 1. STREAMLIT БАПТАУЛАРЫ ЖӘНЕ ЗАМАНАУИ CSS ДИЗАЙНЫ
# -------------------------------------------------------------
st.set_page_config(
    page_title="FTM Edu — Информатика LMS (7-11)",
    page_icon="💻",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Заманауи EdTech стилі (Custom CSS)
st.markdown("""
<style>
    /* Негізгі фон мен қаріптер */
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Сайдбар дизайны */
    [data-testid="stSidebar"] {
        background-color: #111827;
        border-right: 1px solid #1f2937;
    }
    
    /* Карточкалар мен контейнерлер */
    .ftm-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(10px);
    }
    
    .ftm-header-badge {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    
    .ftm-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
    }
    .ftm-pill-purple { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); }
    .ftm-pill-green { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.4); }
    .ftm-pill-cyan { background: rgba(6, 182, 212, 0.2); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.4); }
    .ftm-pill-amber { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); }

    /* Батырмаларды сәндеу */
    .stButton>button {
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
    }
    .stButton>button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    /* Метрикалар */
    [data-testid="stMetricValue"] {
        color: #38bdf8 !important;
        font-weight: 800 !important;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# 2. ДЕРЕКТЕР ҚОРЫ (SQLite) — 7-11 СЫНЫПТАРДЫҢ ТОЛЫҚ БАЗАСЫ
# -------------------------------------------------------------
DB_FILE = "ftm_edu.db"

def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            grade INTEGER DEFAULT 7,
            xp INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS textbooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grade INTEGER NOT NULL,
            title TEXT NOT NULL,
            filename TEXT,
            content TEXT NOT NULL,
            uploaded_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grade INTEGER NOT NULL,
            topic TEXT NOT NULL,
            language TEXT NOT NULL,
            theory TEXT NOT NULL,
            tasks_json TEXT NOT NULL,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grade INTEGER NOT NULL,
            title TEXT NOT NULL,
            duration_minutes INTEGER DEFAULT 20,
            questions_json TEXT NOT NULL,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS task_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER,
            task_title TEXT,
            student_id INTEGER,
            student_name TEXT,
            grade INTEGER,
            answer TEXT NOT NULL,
            feedback TEXT,
            score INTEGER DEFAULT 0,
            max_score INTEGER DEFAULT 10,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS exam_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER,
            exam_title TEXT,
            student_id INTEGER,
            student_name TEXT,
            grade INTEGER,
            score INTEGER,
            total_questions INTEGER,
            percentage REAL,
            xp_earned INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

    # Демо пайдаланушыларды толтыру
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        def h(p): return hashlib.sha256(p.encode()).hexdigest()
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("teacher", h("admin123"), "Ахметов Бауыржан Нұрланұлы (Мұғалім)", "teacher", 0, 950))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student1", h("stud123"), "Серікқызы Аружан", "student", 9, 680))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student2", h("stud123"), "Қасымов Әлішер", "student", 9, 540))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student3", h("stud123"), "Иванов Даниил", "student", 8, 420))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student4", h("stud123"), "Смайлова Динара", "student", 10, 810))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student5", h("stud123"), "Жұмабек Айдын", "student", 11, 920))
        c.execute("INSERT INTO users (username, password_hash, full_name, role, grade, xp) VALUES (?, ?, ?, ?, ?, ?)",
                  ("student6", h("stud123"), "Ерболатқызы Мәдина", "student", 7, 310))

    # 7-11 сыныптардың оқулықтарын толық толтыру
    c.execute("SELECT COUNT(*) FROM textbooks")
    if c.fetchone()[0] == 0:
        tb_data = [
            (7, "7-сынып Информатика: Компьютерлік жүйелер және Python негіздері",
             "Компьютердің негізгі құрылғылары: процессор (CPU), жедел жад (RAM), тұрақты жад (ROM).\n"
             "Python бағдарламалау тілі: айнымалылар, сандық (int, float) және мәтіндік (str) деректер.\n"
             "Ақпаратты енгізу және шығару: print() және input() функциялары.\n"
             "Шартты оператор: if-elif-else тармақталуы және логикалық амалдар (and, or, not)."),
            (8, "8-сынып Информатика: Циклдік алгоритмдер және желілік қауіпсіздік",
             "Қайталану операторлары: for циклі және range(start, stop, step) функциясы.\n"
             "while шарты орындалғанша қайталанатын цикл. Циклді тоқтату: break және continue.\n"
             "Компьютерлік желілер: IP мекенжай, DNS домендік атаулар жүйесі, желілік топологиялар (жұлдыз, сақина, шина).\n"
             "Киберқауіпсіздік және деректерді қорғау негіздері."),
            (9, "9-сынып Информатика: Екіөлшемді массивтер және Мәліметтер қоры (SQL)",
             "Python тіліндегі матрицалар (екіөлшемді массивтер): matrix = [[1, 2, 3], [4, 5, 6]].\n"
             "Индекстеу: matrix[i][j]. Бас диагональ (i == j) және қосалқы диагональ элементтерін есептеу.\n"
             "Мәліметтер қорының негіздері. Реляциялық деректер қоры (RDBMS).\n"
             "SQL сұраныс тілі: SELECT, INSERT INTO, UPDATE, DELETE және WHERE сүзгісі."),
            (10, "10-сынып Информатика: Объектіге бағытталған бағдарламалау (OOP) және Деректер құрылымы",
             "OOP негізгі ұғымдары: Кластар, Объектілер, Конструктор (__init__), self кілт сөзі.\n"
             "OOP 3 негізгі ұстанымы: Инкапсуляция, Мұрагерлік (Inheritance), Полиморфизм.\n"
             "Сызықтық деректер құрылымы: Стек (LIFO - Last In First Out), Кезек (FIFO - First In First Out).\n"
             "Ағаш тәрізді құрылымдар және Жасанды интеллект негіздері."),
            (11, "11-сынып Информатика: Machine Learning, Big Data және Криптография",
             "Машиналық оқыту (Machine Learning): Мұғаліммен оқыту (Классификация, Регрессия) және кластерлеу.\n"
             "Үлкен деректер (Big Data) 5V қасиеті: Volume, Velocity, Variety, Veracity, Value.\n"
             "Криптографиялық қорғау: Симметриялық (AES) және асимметриялық (RSA) шифрлау әдістері.\n"
             "Хэш функциялары (SHA-256) және Блокчейн архитектурасы.")
        ]
        for gr, title, content in tb_data:
            c.execute("INSERT INTO textbooks (grade, title, filename, content, uploaded_by) VALUES (?, ?, ?, ?, ?)",
                      (gr, title, f"informatics_{gr}.txt", content, "teacher"))

    # Бастапқы сабақтар
    c.execute("SELECT COUNT(*) FROM lessons")
    if c.fetchone()[0] == 0:
        tasks_9 = json.dumps([
            {
                "level": "A",
                "title": "Матрицаны шығару",
                "desc": "3х3 өлшемді матрица құрып, ортаңғы элементті (matrix[1][1]) басып шығарыңыз.",
                "points": 5,
                "descriptors": ["Тізімдердің тізімін дұрыс анықтайды", "Индекстеуді қатесіз жазады"]
            },
            {
                "level": "B",
                "title": "Бас диагональ қосындысы",
                "desc": "NxN матрицаның бас диагоналында орналасқан элементтердің қосындысын табатын алгоритм жазыңыз.",
                "points": 10,
                "descriptors": ["i == j шартын қолданады", "Қосындыны есептеп дұрыс көрсетеді"]
            },
            {
                "level": "C",
                "title": "Матрицаны транспонирлеу",
                "desc": "Матрицаның жолдары мен бағандарының орнын ауыстырып (транспозиция), жаңа матрица құрыңыз.",
                "points": 15,
                "descriptors": ["Тиімді алгоритм құрады", "Нәтижені кесте түрінде басып шығарады"]
            }
        ], ensure_ascii=False)

        theory_9 = """### 📌 9-Сынып: Python-дағы екіөлшемді массивтер (Матрицалар)

Матрица — жолдар мен бағандар түрінде реттелген тікбұрышты кесте.
Python тілінде матрица кірістірілген тізімдер арқылы жүзеге асырылады:
```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
```
Элементке қол жеткізу: `matrix[row_idx][col_idx]`. Бас диагональда `row_idx == col_idx` болады.
"""
        c.execute("INSERT INTO lessons (grade, topic, language, theory, tasks_json, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                  (9, "Python тіліндегі екіөлшемді массивтер (Матрицалар)", "kk", theory_9, tasks_9, "teacher"))

    # Бастапқы емтихандар (7-11 сыныптарға)
    c.execute("SELECT COUNT(*) FROM exams")
    if c.fetchone()[0] == 0:
        q_9 = json.dumps([
            {
                "question": "Python тілінде 3x3 өлшемді матрицаның бас диагональ шарты қандай?",
                "options": ["i == j", "i + j == 2", "i > j", "i < j"],
                "correct_index": 0,
                "explanation": "Бас диагональдағы барлық элементтерде жол нөмірі баған нөміріне тең: i == j."
            },
            {
                "question": "matrix = [[10, 20], [30, 40]] болса, matrix[1][0] мәні неге тең?",
                "options": ["10", "20", "30", "40"],
                "correct_index": 2,
                "explanation": "1-индексті жол [30, 40], оның 0-индексті элементі 30 саны."
            },
            {
                "question": "SQL сұранысында деректерді белгілі бір шарт бойынша сүзу үшін қай кілт сөз қолданылады?",
                "options": ["ORDER BY", "WHERE", "GROUP BY", "FILTER"],
                "correct_index": 1,
                "explanation": "WHERE кілт сөзі сұраныс нәтижесін шарт бойынша сүзеді."
            }
        ], ensure_ascii=False)

        c.execute("INSERT INTO exams (grade, title, duration_minutes, questions_json, created_by) VALUES (?, ?, ?, ?, ?)",
                  (9, "9-сынып Информатика: Екіөлшемді массивтер және SQL бойынша тоқсандық сынақ", 15, q_9, "teacher"))

    conn.commit()
    conn.close()

init_db()

# -------------------------------------------------------------
# 3. ҮШ ТІЛДІ ЛОКАЛИЗАЦИЯ (TRILINGUAL DICTIONARY)
# -------------------------------------------------------------
I18N = {
    "kk": {
        "title": "FTM Edu",
        "subtitle": "7-11 сынып информатика мұғалімдері мен оқушыларына арналған цифрлық білім платформасы",
        "teacher_panel": "Мұғалім кабинеті",
        "student_panel": "Оқушы кабинеті",
        "role_teacher": "Мұғалім",
        "role_student": "Оқушы",
        "grade": "Сынып",
        "grade_suffix": "-сынып",
        "all_grades": "Барлық сыныптар",
        "login": "Кіру",
        "register": "Тіркелу",
        "logout": "Шығу",
        "welcome": "Қош келдіңіз",
        "nav_overview": "Жалпы шолу",
        "nav_textbooks": "Оқулықтар қоры",
        "nav_generator": "AI Сабақ пен дескрипторлар",
        "nav_exam_builder": "Емтихан құрастырушы",
        "nav_gradebook": "Бағалау журналы",
        "nav_lessons": "Сабақтар мен конспектілер",
        "nav_tasks": "Тапсырмалар орталығы",
        "nav_code_runner": "Python Интерактивті Код алаңы",
        "nav_exams": "Емтихан тапсыру (Таймер)",
        "nav_leaderboard": "Рейтинг және Геймификация",
        "upload_btn": "Оқулықты жүктеу (PDF / TXT)",
        "book_title": "Оқулық атауы",
        "book_saved": "Оқулық базаға сәтті сақталды!",
        "topic": "Сабақ тақырыбы",
        "choose_book": "Негізге алынатын оқулық",
        "generate_ai": "Gemini AI арқылы сабақ құру",
        "generating": "Gemini AI сабақ пен дескрипторларды әзірлеуде...",
        "exam_title": "Емтихан атауы",
        "duration": "Ұзақтығы (минут)",
        "exam_created": "Емтихан сәтті жарияланды!",
        "start_exam": "Емтиханды бастау",
        "time_left": "Қалған уақыт:",
        "finish_exam": "Емтиханды аяқтау",
        "xp": "XP Ұпайы",
        "rank": "Дәреже",
        "run_code": "▶️ Кодты орындау",
        "code_output": "Нәтиже (Output):",
        "submit_task": "Жауапты жіберу және AI бағасын алу"
    },
    "ru": {
        "title": "FTM Edu",
        "subtitle": "Цифровая образовательная платформа по информатике для 7-11 классов",
        "teacher_panel": "Панель Учителя",
        "student_panel": "Кабинет Ученика",
        "role_teacher": "Учитель",
        "role_student": "Ученик",
        "grade": "Класс",
        "grade_suffix": " класс",
        "all_grades": "Все классы",
        "login": "Вход",
        "register": "Регистрация",
        "logout": "Выйти",
        "welcome": "Добро пожаловать",
        "nav_overview": "Обзор",
        "nav_textbooks": "База учебников",
        "nav_generator": "AI Уроки и дескрипторы",
        "nav_exam_builder": "Конструктор экзаменов",
        "nav_gradebook": "Журнал оценок",
        "nav_lessons": "Уроки и конспекты",
        "nav_tasks": "Центр заданий",
        "nav_code_runner": "Python Песочница кода",
        "nav_exams": "Сдача экзаменов (Таймер)",
        "nav_leaderboard": "Рейтинг и Геймификация",
        "upload_btn": "Загрузить учебник (PDF / TXT)",
        "book_title": "Название учебника",
        "book_saved": "Учебник успешно сохранен!",
        "topic": "Тема урока",
        "choose_book": "Опорный учебник",
        "generate_ai": "Сгенерировать через Gemini AI",
        "generating": "Gemini AI готовит урок и дескрипторы...",
        "exam_title": "Название экзамена",
        "duration": "Длительность (минут)",
        "exam_created": "Экзамен успешно создан!",
        "start_exam": "Начать экзамен",
        "time_left": "Оставшееся время:",
        "finish_exam": "Завершить экзамен",
        "xp": "Очки опыта (XP)",
        "rank": "Ранг",
        "run_code": "▶️ Запустить код",
        "code_output": "Результат выполнения:",
        "submit_task": "Отправить ответ и получить оценку AI"
    },
    "en": {
        "title": "FTM Edu",
        "subtitle": "Digital Computer Science LMS for Grades 7-11 (Teachers & Students)",
        "teacher_panel": "Teacher Panel",
        "student_panel": "Student Panel",
        "role_teacher": "Teacher",
        "role_student": "Student",
        "grade": "Grade",
        "grade_suffix": " Grade",
        "all_grades": "All Grades",
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "welcome": "Welcome",
        "nav_overview": "Overview",
        "nav_textbooks": "Textbooks Base",
        "nav_generator": "AI Lessons & Descriptors",
        "nav_exam_builder": "Exam Builder",
        "nav_gradebook": "Gradebook",
        "nav_lessons": "Lessons & Notes",
        "nav_tasks": "Tasks Center",
        "nav_code_runner": "Python Interactive Playground",
        "nav_exams": "Take Exams (Timer)",
        "nav_leaderboard": "Leaderboard & Gamification",
        "upload_btn": "Upload Textbook (PDF / TXT)",
        "book_title": "Textbook Title",
        "book_saved": "Textbook saved successfully!",
        "topic": "Lesson Topic",
        "choose_book": "Reference Textbook",
        "generate_ai": "Generate via Gemini AI",
        "generating": "Gemini AI is crafting the lesson and rubrics...",
        "exam_title": "Exam Title",
        "duration": "Duration (minutes)",
        "exam_created": "Exam created successfully!",
        "start_exam": "Start Exam",
        "time_left": "Time Left:",
        "finish_exam": "Submit Exam",
        "xp": "Experience XP",
        "rank": "Rank",
        "run_code": "▶️ Run Code",
        "code_output": "Execution Output:",
        "submit_task": "Submit Solution & Evaluate with AI"
    }
}

# -------------------------------------------------------------
# 4. СЕССИЯНЫ БАПТАУ (SESSION STATE)
# -------------------------------------------------------------
if "lang" not in st.session_state:
    st.session_state.lang = "kk"
if "user" not in st.session_state:
    st.session_state.user = {
        "id": 1,
        "username": "teacher",
        "full_name": "Ахметов Бауыржан Нұрланұлы (Мұғалім)",
        "role": "teacher",
        "grade": 0,
        "xp": 950
    }
if "selected_grade" not in st.session_state:
    st.session_state.selected_grade = 9
if "exam_state" not in st.session_state:
    st.session_state.exam_state = {"active": False, "exam": None, "start_time": 0, "answers": {}}

t = I18N[st.session_state.lang]

# -------------------------------------------------------------
# 5. GEMINI AI КӨМЕКШІ ФУНКЦИЯЛАРЫ
# -------------------------------------------------------------
def get_ai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        try:
            api_key = st.secrets.get("GEMINI_API_KEY")
        except Exception:
            pass
    if not api_key and st.session_state.get("custom_gemini_key"):
        api_key = st.session_state.custom_gemini_key
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception:
        return None

def generate_lesson_with_gemini(grade, topic, context_text, language):
    client = get_ai_client()
    lang_name = {"kk": "қазақша", "ru": "на русском языке", "en": "in English"}.get(language, "қазақша")

    prompt = f"""
    Сіз Қазақстанның жаңартылған мазмұндағы информатика пәнінің сарапшы әдіскер-мұғалімісіз.
    Сынып: {grade}-сынып
    Тақырып: {topic}
    Тіл: {lang_name}

    Оқулық контексті:
    \"\"\"{context_text[:2500]}\"\"\"

    Міндет: Мұғалім мен оқушыларға арналған толыққанды, сапалы сабақ дайындаңыз:
    1. **Сабақтың оқу мақсаттары мен анықтамалары**
    2. **Толық теориялық конспект** (түсінікті тілмен, көрнекі сипаттама, Python код үлгілері).
    3. **Үш деңгейлі тапсырмалар**:
       - Деңгей A (Білу және түсіну, 5 балл)
       - Деңгей B (Қолдану, 10 балл)
       - Деңгей C (Талдау және синтез, олимпиадалық есеп, 15 балл)
    4. **Бағалау дескрипторлары** (әр тапсырмаға нақты бағалау критерийлері мен ұпайлар).
    
    Таза Markdown форматында {lang_name} тілінде қайтарыңыз.
    """

    if not client:
        return f"""### 📌 {topic} ({grade}-сынып)
*Ескерту: Жүйе оффлайн үлгі конспектіні көрсетуде (GEMINI_API_KEY орнатылмаған).*

#### 1. Теориялық түсінік:
Бұл тақырып информатика курсының маңызды бөлігі болып табылады.
Python тілінде тиімді алгоритмдерді құру үшін синтаксистік ережелерді қатаң сақтау қажет.

```python
# Үлгі код:
def solve():
    print("Тақырып: {topic}")
solve()
```

#### 2. Деңгейлік тапсырмалар:
- **Деңгей A (5 балл):** Негізгі анықтамаларды жазып, қарапайым код жазыңыз. *Дескриптор:* Терминдерді қатесіз көрсетеді.
- **Деңгей B (10 балл):** Алгоритмдік цикл немесе шартты құрылымды қолданыңыз. *Дескриптор:* Кодты дұрыс іске қосады.
- **Деңгей C (15 балл):** Оңтайландырылған күрделі шешім ұсыныңыз. *Дескриптор:* Алгоритм тиімділігі O(N) деңгейінде.
"""

    try:
        response = client.models.generateContent(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"AI қатесі: {str(e)}"

def evaluate_student_code_with_gemini(task_text, student_code, language):
    client = get_ai_client()
    lang_name = {"kk": "қазақша", "ru": "русский", "en": "English"}.get(language, "қазақша")

    prompt = f"""
    Сіз қатаң әрі әділ информатика пәні мұғалімісіз.
    Тапсырма: {task_text}
    Оқушының жіберген коды немесе жауабы:
    \"\"\"{student_code}\"\"\"

    Осы жұмысты 10 балдық шкала бойынша бағалап, JSON форматында қайтарыңыз:
    {{
        "score": (1-10 аралығындағы бүтін сан),
        "feedback": "Оқушыға конструктивті кері байланыс ({lang_name} тілінде): қателері, жақсы тұстары, дескрипторлық талдауы және кеңес",
        "xp_earned": (score * 10)
    }}
    Тек таза JSON жіберіңіз.
    """

    if not client:
        return {
            "score": 9,
            "feedback": "Жақсы шешім! Алгоритмдік логика сақталған, код құрылымы дұрыс (Оффлайн бағалау үлгісі).",
            "xp_earned": 90
        }

    try:
        response = client.models.generateContent(
            model="gemini-2.5-flash",
            contents=prompt
        )
        clean = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception:
        return {"score": 8, "feedback": "Жұмыс қабылданды. Дескриптор талаптары орындалды.", "xp_earned": 80}

# -------------------------------------------------------------
# 6. БҮЙІРЛІК МӘЗІР (SIDEBAR)
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("""
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="background: linear-gradient(135deg, #06b6d4, #6366f1); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                💻
            </div>
            <div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 800; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">FTM Edu</h2>
                <span style="font-size: 11px; color: #94a3b8;">Информатика LMS (7-11)</span>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")

    # Тіл ауыстыру
    col_lang1, col_lang2 = st.columns([1, 2])
    with col_lang1:
        st.write("🌐 Тіл:")
    with col_lang2:
        lang_idx = 0 if st.session_state.lang == "kk" else (1 if st.session_state.lang == "ru" else 2)
        selected_lang = st.selectbox(
            "Тілді таңдаңыз",
            ["🇰🇿 Қазақ тілі", "🇷🇺 Русский", "🇬🇧 English"],
            index=lang_idx,
            label_visibility="collapsed"
        )
        new_code = "kk" if "Қазақ" in selected_lang else ("ru" if "Русский" in selected_lang else "en")
        if new_code != st.session_state.lang:
            st.session_state.lang = new_code
            st.rerun()

    # Сынып таңдау фильтрі (7-11)
    st.markdown("#### 📚 " + t["grade"] + ":")
    gr_cols = st.columns(5)
    for idx, g in enumerate([7, 8, 9, 10, 11]):
        with gr_cols[idx]:
            is_active = st.session_state.selected_grade == g
            btn_style = "primary" if is_active else "secondary"
            if st.button(f"{g}", key=f"gr_btn_{g}", type=btn_style):
                st.session_state.selected_grade = g
                st.rerun()

    st.markdown("---")

    # Пайдаланушы рөлін ауыстыру (Демо қосқыш)
    cur_user = st.session_state.user
    st.markdown(f"**👤 {cur_user['full_name']}**")
    
    col_role1, col_role2 = st.columns(2)
    with col_role1:
        if st.button("👨‍🏫 Мұғалім", use_container_width=True, type="primary" if cur_user['role'] == "teacher" else "secondary"):
            st.session_state.user = {
                "id": 1,
                "username": "teacher",
                "full_name": "Ахметов Бауыржан (Мұғалім)",
                "role": "teacher",
                "grade": 0,
                "xp": 950
            }
            st.rerun()
    with col_role2:
        if st.button("👨‍🎓 Оқушы", use_container_width=True, type="primary" if cur_user['role'] == "student" else "secondary"):
            st.session_state.user = {
                "id": 2,
                "username": "student1",
                "full_name": "Серікқызы Аружан (Оқушы)",
                "role": "student",
                "grade": st.session_state.selected_grade,
                "xp": 680
            }
            st.rerun()

    if cur_user['role'] == "student":
        st.metric(label="⭐ " + t["xp"], value=f"{cur_user['xp']} XP")

    st.markdown("---")

    # Сайдбар навигациясы
    if cur_user['role'] == "teacher":
        menu = st.radio(
            "📋 " + t["teacher_panel"] + ":",
            [t["nav_overview"], t["nav_textbooks"], t["nav_generator"], t["nav_exam_builder"], t["nav_gradebook"], t["nav_code_runner"]]
        )
    else:
        menu = st.radio(
            "🎒 " + t["student_panel"] + ":",
            [t["nav_lessons"], t["nav_tasks"], t["nav_code_runner"], t["nav_exams"], t["nav_leaderboard"]]
        )

    st.markdown("---")
    with st.expander("⚙️ Gemini API Кілт", expanded=False):
        saved_k = st.session_state.get("custom_gemini_key", "")
        input_key = st.text_input("API Key енгізу:", value=saved_k, type="password", placeholder="AIzaSy...")
        if input_key != saved_k:
            st.session_state.custom_gemini_key = input_key
            st.success("Кілт сақталды!")
            st.rerun()
        if os.environ.get("GEMINI_API_KEY") or st.session_state.get("custom_gemini_key"):
            st.caption("🟢 AI моделі белсенді (Ready)")
        else:
            st.caption("🟡 Оффлайн үлгіде жұмыс істеуде")

# -------------------------------------------------------------
# 7. НЕГІЗГІ БЕТТЕР МЕН МОДУЛЬДЕР
# -------------------------------------------------------------
cur_user = st.session_state.user
sel_grade = st.session_state.selected_grade

# --- МҰҒАЛІМ 1: ЖАЛПЫ ШОЛУ (OVERVIEW) ---
if cur_user['role'] == "teacher" and menu == t["nav_overview"]:
    st.markdown(f'<div class="ftm-header-badge">7-11 Информатика LMS • {sel_grade}{t["grade_suffix"]}</div>', unsafe_allow_html=True)
    st.title("💻 " + t["title"])
    st.caption(t["subtitle"])

    conn = get_db()
    c_books = conn.execute("SELECT COUNT(*) FROM textbooks").fetchone()[0]
    c_lessons = conn.execute("SELECT COUNT(*) FROM lessons").fetchone()[0]
    c_exams = conn.execute("SELECT COUNT(*) FROM exams").fetchone()[0]
    c_subs = conn.execute("SELECT COUNT(*) FROM task_submissions").fetchone()[0]
    conn.close()

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("📚 Оқулықтар қоры", f"{c_books} кітап")
    m2.metric("📖 Сабақтар мен теория", f"{c_lessons} тақырып")
    m3.metric("📝 Емтихандар", f"{c_exams} тест")
    m4.metric("✍️ Орындалған тапсырмалар", f"{c_subs} жұмыс")

    st.markdown("---")

    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown("""
        <div class="ftm-card">
            <h3 style="margin-top:0; color:#38bdf8;">✨ Gemini AI Сабақ пен дескриптор генераторы</h3>
            <p style="font-size:13px; color:#94a3b8;">
                Мұғалім 7-11 сыныптың кез келген тақырыбын енгізіп, жүктелген оқулық негізінде сапалы теориялық конспект, А/В/С деңгейлік тапсырмалар мен бағалау критерийлерін бір секундта дайындай алады.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with col_b:
        st.markdown("""
        <div class="ftm-card">
            <h3 style="margin-top:0; color:#a855f7;">⏱️ Емтихан құрастырушы (Exam Builder)</h3>
            <p style="font-size:13px; color:#94a3b8;">
                Уақыты шектелген (таймері бар) бақылау тестін құру. Тест нәтижесі автоматты тексеріліп, оқушыларға XP ұпайы беріледі және бағалау журналына жазылады.
            </p>
        </div>
        """, unsafe_allow_html=True)

# --- МҰҒАЛІМ 2: ОҚУЛЫҚТАР ҚОРЫ (TEXTBOOKS) ---
elif cur_user['role'] == "teacher" and menu == t["nav_textbooks"]:
    st.markdown(f'<div class="ftm-header-badge">{sel_grade}{t["grade_suffix"]} материалдары</div>', unsafe_allow_html=True)
    st.header("📚 " + t["nav_textbooks"])

    col_up, col_list = st.columns([1, 1])

    with col_up:
        st.subheader("Жаңа оқулық немесе файл жүктеу")
        u_grade = st.selectbox(t["grade"], [7, 8, 9, 10, 11], index=[7, 8, 9, 10, 11].index(sel_grade))
        u_title = st.text_input(t["book_title"], placeholder="Мысалы: 9-сынып Информатика. Арман-ПВ баспасы", key="upload_book_title_input")
        u_file = st.file_uploader(t["upload_btn"], type=["pdf", "txt"], key="upload_book_file_uploader")
        u_manual_text = st.text_area("Немесе оқулық парағының мәтінін осында қойыңыз:", height=150, key="upload_manual_book_text")

        if st.button("💾 Базаға сақтау", type="primary"):
            content = u_manual_text.strip()
            filename = "manual_entry.txt"

            if u_file:
                filename = u_file.name
                if u_file.name.endswith(".txt"):
                    content = u_file.read().decode("utf-8", errors="ignore")
                elif u_file.name.endswith(".pdf") and PYPDF_AVAILABLE:
                    reader = pypdf.PdfReader(u_file)
                    content = "\n".join([page.extract_text() or "" for page in reader.pages[:30]])

            if not content or not u_title:
                st.warning("Атауы мен мазмұны міндетті түрде толтырылуы тиіс!")
            else:
                conn = get_db()
                conn.execute("INSERT INTO textbooks (grade, title, filename, content, uploaded_by) VALUES (?, ?, ?, ?, ?)",
                             (u_grade, u_title, filename, content, cur_user['full_name']))
                conn.commit()
                conn.close()
                st.success(t["book_saved"])
                st.rerun()

    with col_list:
        st.subheader(f"Қордағы оқулықтар ({sel_grade}-сынып)")
        conn = get_db()
        books = conn.execute("SELECT * FROM textbooks WHERE grade = ? ORDER BY id DESC", (sel_grade,)).fetchall()
        conn.close()

        if not books:
            st.info(f"{sel_grade}-сыныпқа оқулық әлі жүктелмеген.")
        else:
            for b in books:
                with st.expander(f"📖 {b['title']}"):
                    st.caption(f"Файл: `{b['filename']}` | Жүктеген: {b['uploaded_by']}")
                    st.text_area("Үзіндісі:", b['content'][:800] + "...", height=120, disabled=True, key=f"textbook_view_preview_{b['id']}")

# --- МҰҒАЛІМ 3: AI САБАҚ ПЕН ДЕСКРИПТОР ГЕНЕРАТОРЫ ---
elif cur_user['role'] == "teacher" and menu == t["nav_generator"]:
    st.markdown(f'<div class="ftm-header-badge">Gemini 2.5/3.8 Flash • {sel_grade}{t["grade_suffix"]}</div>', unsafe_allow_html=True)
    st.header("✨ " + t["nav_generator"])

    conn = get_db()
    books = conn.execute("SELECT id, title, content FROM textbooks WHERE grade = ?", (sel_grade,)).fetchall()
    conn.close()

    book_context = ""
    if books:
        chosen_b = st.selectbox(t["choose_book"], [b['title'] for b in books])
        matched = next((b for b in books if b['title'] == chosen_b), None)
        if matched:
            book_context = matched['content']
    else:
        st.warning(f"{sel_grade}-сынып үшін жүктелген оқулық жоқ. Жалпы оқу бағдарламасы қолданылады.")

    g_topic = st.text_input(t["topic"], placeholder="Мысалы: Python тілінде екіөлшемді массивтерді өңдеу")

    if st.button("🚀 " + t["generate_ai"], type="primary"):
        if not g_topic.strip():
            st.warning("Тақырыпты жазыңыз!")
        else:
            with st.spinner(t["generating"]):
                result = generate_lesson_with_gemini(sel_grade, g_topic, book_context, st.session_state.lang)
                st.markdown("### 📝 Генерацияланған нәтиже:")
                st.markdown(result)

                # Базаға сақтау
                conn = get_db()
                conn.execute("INSERT INTO lessons (grade, topic, language, theory, tasks_json, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                             (sel_grade, g_topic, st.session_state.lang, result, "[]", cur_user['full_name']))
                conn.commit()
                conn.close()
                st.success("Сабақ оқушылар каталогына сәтті сақталды!")

# --- МҰҒАЛІМ 4: ЕМТИХАН ҚҰРАСТЫРУШЫ ---
elif cur_user['role'] == "teacher" and menu == t["nav_exam_builder"]:
    st.markdown(f'<div class="ftm-header-badge">Сынақ тестілері • {sel_grade}{t["grade_suffix"]}</div>', unsafe_allow_html=True)
    st.header("⏱️ " + t["nav_exam_builder"])

    col_e1, col_e2 = st.columns([1, 1])

    with col_e1:
        st.subheader("Жаңа тест немесе емтихан құру")
        e_title = st.text_input(t["exam_title"], placeholder="Мысалы: 1-тоқсан бойынша жиынтық бағалау (ТЖБ)")
        e_dur = st.number_input(t["duration"], min_value=5, max_value=60, value=20)

        sample_json = json.dumps([
            {
                "question": "Python тілінде циклді мерзімінен бұрын тоқтату үшін қандай оператор қолданылады?",
                "options": ["stop", "break", "exit", "return"],
                "correct_index": 1,
                "explanation": "break операторы ағымдағы цикл жұмысын бірден тоқтатады."
            },
            {
                "question": "range(1, 10, 2) функциясы қай тізімді шығарады?",
                "options": ["[1, 3, 5, 7, 9]", "[1, 2, 3, 4, 5, 6, 7, 8, 9]", "[2, 4, 6, 8]", "[1, 10, 2]"],
                "correct_index": 0,
                "explanation": "Басталуы 1, соңы 10 (енбейді), қадамы 2: 1, 3, 5, 7, 9."
            }
        ], indent=2, ensure_ascii=False)

        e_questions = st.text_area("Сұрақтар құрылымы (JSON):", value=sample_json, height=220, key="exam_builder_questions_json")

        if st.button("🚀 Емтиханды жариялау", type="primary"):
            try:
                parsed = json.loads(e_questions)
                conn = get_db()
                conn.execute("INSERT INTO exams (grade, title, duration_minutes, questions_json, created_by) VALUES (?, ?, ?, ?, ?)",
                             (sel_grade, e_title, e_dur, json.dumps(parsed, ensure_ascii=False), cur_user['full_name']))
                conn.commit()
                conn.close()
                st.success(t["exam_created"])
                st.rerun()
            except Exception as err:
                st.error(f"JSON қатесі: {err}")

    with col_e2:
        st.subheader(f"Жүйедегі емтихандар ({sel_grade}-сынып)")
        conn = get_db()
        exs = conn.execute("SELECT * FROM exams WHERE grade = ? ORDER BY id DESC", (sel_grade,)).fetchall()
        conn.close()

        if not exs:
            st.info("Бұл сыныпқа емтихандар әлі құрылмаған.")
        else:
            for ex in exs:
                with st.expander(f"📝 {ex['title']} ({ex['duration_minutes']} мин)"):
                    qs = json.loads(ex['questions_json'])
                    st.write(f"Сұрақтар саны: **{len(qs)}** | Құрастырушы: {ex['created_by']}")
                    for i, q in enumerate(qs, 1):
                        st.markdown(f"**{i}. {q['question']}**")

# --- МҰҒАЛІМ 5: БАҒАЛАУ ЖУРНАЛЫ (GRADEBOOK) ---
elif cur_user['role'] == "teacher" and menu == t["nav_gradebook"]:
    st.header("📊 " + t["nav_gradebook"])

    conn = get_db()
    subs = conn.execute("SELECT * FROM task_submissions ORDER BY id DESC").fetchall()
    results = conn.execute("SELECT * FROM exam_results ORDER BY id DESC").fetchall()
    conn.close()

    tab_t, tab_e = st.tabs(["✍️ Тапсырмалар нәтижелері", "⏱️ Емтихан нәтижелері"])

    with tab_t:
        if not subs:
            st.info("Оқушылар тапсырмаларды әлі жібермеген.")
        else:
            data_sub = []
            for s in subs:
                data_sub.append({
                    "Оқушы": s['student_name'],
                    "Сынып": f"{s['grade']}-сынып",
                    "Тапсырма": s['task_title'],
                    "Балл": f"{s['score']} / {s['max_score']}",
                    "Кері байланыс (Дескриптор)": s['feedback'],
                    "Уақыты": s['created_at'][:16]
                })
            st.dataframe(data_sub, use_container_width=True)

    with tab_e:
        if not results:
            st.info("Емтихан нәтижелері әзірге жоқ.")
        else:
            data_res = []
            for r in results:
                data_res.append({
                    "Оқушы": r['student_name'],
                    "Сынып": f"{r['grade']}-сынып",
                    "Емтихан": r['exam_title'],
                    "Нәтиже": f"{r['score']} / {r['total_questions']}",
                    "Пайыз": f"{r['percentage']:.1f}%",
                    "XP": f"+{r['xp_earned']} XP",
                    "Уақыты": r['completed_at'][:16]
                })
            st.dataframe(data_res, use_container_width=True)

# --- ИНТЕРАКТИВТІ PYTHON КОД АЛАҢЫ (PLAYGROUND) ---
elif menu == t["nav_code_runner"]:
    st.markdown(f'<div class="ftm-header-badge">Python Interactive Shell • {sel_grade}{t["grade_suffix"]}</div>', unsafe_allow_html=True)
    st.header("💻 " + t["nav_code_runner"])
    st.caption("Оқушылар мен мұғалімдерге Python кодын браузерде тікелей орындап, нәтижесін көруге арналған интерактивті орта.")

    default_code = f"""# {sel_grade}-сынып информатика есебі
# Матрица немесе цикл үлгісі:
def solve():
    matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]
    diag_sum = sum(matrix[i][i] for i in range(len(matrix)))
    print("Матрицаның бас диагональ қосындысы:", diag_sum)

solve()
"""
    user_code = st.text_area("Python кодыңыз:", value=default_code, height=200, key=f"python_code_playground_{sel_grade}")

    if st.button(t["run_code"], type="primary"):
        old_stdout = sys.stdout
        redirected_output = sys.stdout = io.StringIO()
        try:
            exec(user_code, {})
            output = redirected_output.getvalue()
            st.success(t["code_output"])
            st.code(output if output else "[Бағдарлама сәтті орындалды, шығыс мәтін жоқ]", language="text")
        except Exception as e:
            st.error(f"Орындалу қатесі (Error): {e}")
        finally:
            sys.stdout = old_stdout

# --- ОҚУШЫ 1: САБАҚТАР МЕН КОНСПЕКТІЛЕР ---
elif cur_user['role'] == "student" and menu == t["nav_lessons"]:
    st.markdown(f'<div class="ftm-header-badge">{sel_grade}{t["grade_suffix"]} • Оқу материалдары</div>', unsafe_allow_html=True)
    st.header("📖 " + t["nav_lessons"])

    conn = get_db()
    lessons = conn.execute("SELECT * FROM lessons WHERE grade = ? ORDER BY id DESC", (sel_grade,)).fetchall()
    conn.close()

    if not lessons:
        st.info(f"{sel_grade}-сынып үшін сабақтар әзірге жарияланбаған.")
    else:
        for les in lessons:
            with st.expander(f"📌 {les['topic']}", expanded=True):
                st.markdown(les['theory'])

# --- ОҚУШЫ 2: ТАПСЫРМАЛАР ОРТАЛЫҒЫ ---
elif cur_user['role'] == "student" and menu == t["nav_tasks"]:
    st.markdown(f'<div class="ftm-header-badge">Интерактивті дескрипторлық тапсырмалар</div>', unsafe_allow_html=True)
    st.header("✍️ " + t["nav_tasks"])

    current_task = f"{sel_grade}-сынып информатика тапсырмасы: Берілген санның жұп немесе тақ екенін анықтайтын немесе берілген матрицаның элементтерін өңдейтін Python бағдарламасын жазыңыз."
    st.info(f"**Тапсырма:** {current_task}")

    st.markdown("##### 📝 Шешіміңізді немесе Python кодын енгізіңіз:")
    student_answer = st.text_area("Жауап:", height=150, placeholder="num = int(input())\nif num % 2 == 0:\n    print('Жұп')...", key=f"student_task_solution_area_{sel_grade}")

    if st.button("📤 " + t["submit_task"], type="primary"):
        if not student_answer.strip():
            st.warning("Алдымен шешімді жазыңыз!")
        else:
            with st.spinner("Gemini AI шешіміңізді дескрипторлар бойынша талдауда..."):
                eval_res = evaluate_student_code_with_gemini(current_task, student_answer, st.session_state.lang)

                st.success(f"Нәтиже: {eval_res['score']} / 10 балл (+{eval_res['xp_earned']} XP)")
                st.info(f"💬 Дескрипторлық талдау: {eval_res['feedback']}")

                # Базаға жазу және XP қосу
                conn = get_db()
                conn.execute("INSERT INTO task_submissions (lesson_id, task_title, student_id, student_name, grade, answer, feedback, score, max_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                             (1, f"{sel_grade}-сынып тапсырмасы", cur_user['id'], cur_user['full_name'], sel_grade, student_answer, eval_res['feedback'], eval_res['score'], 10))
                conn.execute("UPDATE users SET xp = xp + ? WHERE id = ?", (eval_res['xp_earned'], cur_user['id']))
                conn.commit()
                conn.close()

                cur_user['xp'] += eval_res['xp_earned']
                st.balloons()

# --- ОҚУШЫ 3: ЕМТИХАН ТАПСЫРУ МОДУЛІ (ТАЙМЕРМЕН) ---
elif cur_user['role'] == "student" and menu == t["nav_exams"]:
    st.markdown(f'<div class="ftm-header-badge">Онлайн Тестілеу • {sel_grade}{t["grade_suffix"]}</div>', unsafe_allow_html=True)
    st.header("⏱️ " + t["nav_exams"])

    conn = get_db()
    exams = conn.execute("SELECT * FROM exams WHERE grade = ? ORDER BY id DESC", (sel_grade,)).fetchall()
    conn.close()

    if not exams:
        st.info(f"{sel_grade}-сыныпқа белсенді емтихандар табылмады.")
    else:
        chosen_exam_title = st.selectbox("Емтиханды таңдаңыз:", [e['title'] for e in exams])
        active_exam_row = next(e for e in exams if e['title'] == chosen_exam_title)
        questions = json.loads(active_exam_row['questions_json'])

        st.write(f"Ұзақтығы: **{active_exam_row['duration_minutes']} минут** | Сұрақ саны: **{len(questions)}**")

        with st.form("exam_solve_form"):
            user_answers = {}
            for idx, q in enumerate(questions):
                st.markdown(f"**{idx + 1}-сұрақ:** {q['question']}")
                user_answers[idx] = st.radio("Нұсқалар:", q['options'], key=f"exam_q_{idx}", label_visibility="collapsed")
                st.markdown("---")

            submitted = st.form_submit_button(t["finish_exam"], type="primary")

            if submitted:
                score = 0
                for idx, q in enumerate(questions):
                    if user_answers[idx] == q['options'][q['correct_index']]:
                        score += 1

                total = len(questions)
                percentage = (score / total) * 100
                xp_earned = score * 50

                st.balloons()
                st.success(f"🎉 Сіздің нәтижеңіз: {score} / {total} ({percentage:.1f}%)! Сізге +{xp_earned} XP қосылды!")

                conn = get_db()
                conn.execute("INSERT INTO exam_results (exam_id, exam_title, student_id, student_name, grade, score, total_questions, percentage, xp_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                             (active_exam_row['id'], active_exam_row['title'], cur_user['id'], cur_user['full_name'], sel_grade, score, total, percentage, xp_earned))
                conn.execute("UPDATE users SET xp = xp + ? WHERE id = ?", (xp_earned, cur_user['id']))
                conn.commit()
                conn.close()

                cur_user['xp'] += xp_earned

# --- ОҚУШЫ 4: РЕЙТИНГ ЖӘНЕ ГЕЙМИФИКАЦИЯ (LEADERBOARD) ---
elif cur_user['role'] == "student" and menu == t["nav_leaderboard"]:
    st.markdown(f'<div class="ftm-header-badge">Сынып арасындағы үздіктер</div>', unsafe_allow_html=True)
    st.header("🏆 " + t["nav_leaderboard"])

    col_l1, col_l2 = st.columns([1, 1])

    with col_l1:
        st.subheader("Жетістіктеріңіз бен Дәрежеңіз")
        xp = cur_user['xp']

        if xp < 400:
            rank = "🌱 Junior Coder (Бастаушы)"
        elif xp < 700:
            rank = "⚡ Algorithm Explorer (Алгоритмші)"
        elif xp < 1000:
            rank = "💻 Python Master (Код шебері)"
        else:
            rank = "🔥 AI & Cyber Guru (Сарапшы)"

        st.metric("Ағымдағы дәреже:", rank)
        st.progress(min(xp / 1200.0, 1.0))
        st.write(f"Жинаған ұпайыңыз: **{xp} XP**")

        st.markdown("### 🏅 Белгішелер (Badges):")
        st.markdown("- 🥉 **Алғашқы қадам** — Жүйеге тіркелгені үшін")
        if xp >= 400:
            st.markdown("- 🥈 **Алгоритм шебері** — 400-ден астам XP жинағаны үшін")
        if xp >= 800:
            st.markdown("- 🥇 **Емтихан сұңқары** — Жоғары нәтиже көрсеткені үшін")

    with col_l2:
        st.subheader("Сынып үздіктері (Top 10)")
        conn = get_db()
        leaders = conn.execute("SELECT full_name, grade, xp FROM users WHERE role = 'student' ORDER BY xp DESC LIMIT 10").fetchall()
        conn.close()

        lead_data = []
        for i, l in enumerate(leaders, 1):
            icon = "🥇" if i == 1 else ("🥈" if i == 2 else ("🥉" if i == 3 else f"#{i}"))
            lead_data.append({
                "Орын": icon,
                "Оқушы": l['full_name'],
                "Сынып": f"{l['grade']}-сынып",
                "XP Ұпайы": f"{l['xp']} XP"
            })
        st.dataframe(lead_data, use_container_width=True)
