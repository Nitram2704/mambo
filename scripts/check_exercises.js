require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExercises() {
    console.log('Fetching exercises...');
    const { data, error } = await supabase
        .from('exercises')
        .select('name');

    if (error) {
        console.error('Error fetching exercises:', error);
        return;
    }

    console.log('Exercises in DB:', data?.map(e => e.name));
}

checkExercises();
