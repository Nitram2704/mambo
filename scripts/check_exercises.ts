import { supabase } from '../lib/supabase';

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
