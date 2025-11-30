// Supabase configuration
const SUPABASE_URL = 'https://rrbwrlahxdkkywiswygh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYndybGFoeGRra3l3aXN3eWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTE4MjksImV4cCI6MjA4MDA2NzgyOX0.T-NU5wGEjXS_KdBzSfIzrCVWa8cQ40pbjJZ-h09vfdA';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
  try {
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
      console.error('Supabase library not loaded. Make sure @supabase/supabase-js CDN is included.');
      return null;
    }
    
    // Validate configuration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase not configured. Please add your SUPABASE_URL and SUPABASE_ANON_KEY in utils/supabase.js');
      return null;
    }
    
    // Create client if not already created
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized successfully');
    }
    
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return null;
  }
}

// Sign up with email
async function signUpWithEmail(email, password, userData) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with email
async function signInWithEmail(email, password) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Reset password
async function resetPassword(email) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Update password
async function updatePassword(newPassword) {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function signOut() {
  try {
    const client = initSupabase();
    if (!client) throw new Error('Supabase not configured');
    
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const client = initSupabase();
    if (!client) return null;
    
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}