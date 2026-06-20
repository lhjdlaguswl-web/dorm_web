// Supabase 연결
const SUPABASE_URL = 'https://cfjkgbyrzmkfqsgbrbsx.supabase.co/rest/v1/'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmamtnYnlyem1rZnFzZ2JyYnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzI3OTMsImV4cCI6MjA5NzUwODc5M30.tZnUoUGyObV7YLBZnKPSZynoPJAe9KrmyW0eynqtKZQ

'
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// 로그인
async function login() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert('로그인 실패: ' + error.message)
    return
  }

  alert('로그인 성공!')
  window.location.href = 'dashboard.html'
}
