-- Tabla para rutinas compartidas
CREATE TABLE IF NOT EXISTS shared_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shared_routines_code ON shared_routines(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_routines_public ON shared_routines(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_routines_user ON shared_routines(shared_by);

-- RLS
ALTER TABLE shared_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public shared routines"
    ON shared_routines FOR SELECT
    USING (is_public = true OR auth.uid() = shared_by);

CREATE POLICY "Users can share their own routines"
    ON shared_routines FOR INSERT
    WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can update their shared routines"
    ON shared_routines FOR UPDATE
    USING (auth.uid() = shared_by);

CREATE POLICY "Users can delete their shared routines"
    ON shared_routines FOR DELETE
    USING (auth.uid() = shared_by);

-- Función para incrementar contador de descargas
CREATE OR REPLACE FUNCTION increment_download_count(p_share_code TEXT)
RETURNS void AS $$
BEGIN
    UPDATE shared_routines
    SET downloads_count = downloads_count + 1
    WHERE share_code = p_share_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE shared_routines IS 'Rutinas compartidas entre usuarios';
COMMENT ON COLUMN shared_routines.share_code IS 'Código único de 6 caracteres para compartir';
COMMENT ON COLUMN shared_routines.is_public IS 'Si es true, aparece en el browse público';
COMMENT ON COLUMN shared_routines.expires_at IS 'Fecha de expiración opcional del link';
