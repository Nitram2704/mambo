-- Create academy_courses table
CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT NOT NULL, -- 'nutrition', 'training', 'recovery', 'mindset'
    difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    xp_reward INTEGER DEFAULT 100,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academy_lessons table
CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Markdown content
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academy_quizzes table
CREATE TABLE IF NOT EXISTS academy_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array of questions with options and correct answer
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id)
);

-- Create academy_progress table
CREATE TABLE IF NOT EXISTS academy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    quiz_score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view courses" ON academy_courses;
CREATE POLICY "Anyone can view courses" ON academy_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view lessons" ON academy_lessons;
CREATE POLICY "Anyone can view lessons" ON academy_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view quizzes" ON academy_quizzes;
CREATE POLICY "Anyone can view quizzes" ON academy_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own progress" ON academy_progress;
CREATE POLICY "Users can view their own progress" ON academy_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON academy_progress;
CREATE POLICY "Users can update their own progress" ON academy_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify their own progress" ON academy_progress;
CREATE POLICY "Users can modify their own progress" ON academy_progress FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON academy_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course_id ON academy_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON academy_progress(lesson_id);
