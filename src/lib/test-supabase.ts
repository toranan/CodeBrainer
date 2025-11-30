import { supabaseAdmin } from './supabase';

async function testSupabase() {
    console.log('Testing Supabase connection...');

    // Test User table
    console.log('\n=== Testing User table ===');
    const { data: users, error: userError } = await supabaseAdmin
        .from('User')
        .select('id, email, name')
        .limit(1);

    if (userError) {
        console.error('User table error:', userError);
    } else {
        console.log('User table success:', users);
    }

    // Test problem table
    console.log('\n=== Testing problem table ===');
    const { data: problems, error: problemError } = await supabaseAdmin
        .from('problem')
        .select('id, title, slug')
        .limit(1);

    if (problemError) {
        console.error('Problem table error:', problemError);
    } else {
        console.log('Problem table success:', problems);
    }
}

testSupabase().catch(console.error);
