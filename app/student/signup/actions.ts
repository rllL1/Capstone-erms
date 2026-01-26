'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function signup(formData: FormData) {
  const studentId = formData.get('student_id') as string;
  const fullname = formData.get('fullname') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!studentId || !fullname || !email || !password) {
    return { error: 'All fields are required' };
  }

  const supabase = createAdminClient();

  // Check if student ID already exists in students table
  const { data: existingStudent, error: checkError } = await supabase
    .from('students')
    .select('student_id')
    .eq('student_id', studentId)
    .single();

  if (existingStudent) {
    return { error: 'Student ID already exists' };
  }

  // Check if email already exists in auth
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (users && users.some(user => user.email === email)) {
    return { error: 'Email already registered' };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user account' };
  }

  // Create student record with pending status
  const { error: studentError } = await supabase
    .from('students')
    .insert({
      id: authData.user.id,
      fullname,
      student_id: studentId,
      status: 'pending', // Will need admin approval
    });

  if (studentError) {
    // If student creation fails, delete the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { error: 'Failed to create student record: ' + studentError.message };
  }

  return { 
    success: 'Registration successful! Your account is pending approval. You will be notified once an administrator approves your account.' 
  };
}
