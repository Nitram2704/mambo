-- Tabla para planes de comidas semanales
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Índice para búsquedas rápidas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);

-- Tabla para meals individuales
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC(6,2) NOT NULL CHECK (protein >= 0),
    carbs NUMERIC(6,2) NOT NULL CHECK (carbs >= 0),
    fat NUMERIC(6,2) NOT NULL CHECK (fat >= 0),
    ingredients JSONB,
    instructions TEXT,
    prep_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para joins rápidos
CREATE INDEX IF NOT EXISTS idx_meals_plan_id ON meals(meal_plan_id);

-- Row Level Security (RLS) para meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal plans"
    ON meal_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
    ON meal_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
    ON meal_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
    ON meal_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Row Level Security (RLS) para meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meals from their plans"
    ON meals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert meals to their plans"
    ON meals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meals in their plans"
    ON meals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meals from their plans"
    ON meals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios  
COMMENT ON TABLE meal_plans IS 'Planes de comidas diarios de los usuarios';
COMMENT ON TABLE meals IS 'Comidas individuales asociadas a planes diarios';
COMMENT ON COLUMN meals.ingredients IS 'Array de ingredientes en formato JSON';
COMMENT ON COLUMN meals.prep_time IS 'Tiempo de preparación estimado';
