'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Email and password are required')}`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string // User's full name

  if (!email || !password || !confirmPassword) {
    redirect(`/register?error=${encodeURIComponent('All fields are required')}`)
  }

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent('Passwords do not match')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // If user is already authenticated (email confirmation is off in Supabase)
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // If email confirmation is required
  redirect(`/register?success=${encodeURIComponent('Registration successful! Please check your email for a confirmation link.')}`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
