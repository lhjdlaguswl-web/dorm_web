// Supabase 연결
const SUPABASE_URL = 'https://cfjkgbyrzmkfqsgbrbsx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmamtnYnlyem1rZnFzZ2JyYnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzI3OTMsImV4cCI6MjA5NzUwODc5M30.tZnUoUGyObV7YLBZnKPSZynoPJAe9KrmyW0eynqtKZQ'
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

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

// 회원가입
async function register() {
  const name = document.getElementById('name').value
  const room_number = document.getElementById('room_number').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  // Supabase Auth에 계정 생성
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert('회원가입 실패: ' + error.message)
    return
  }

  // users 테이블에 추가 정보 저장
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      name,
      email,
      room_number,
      role: 'student'
    })

  if (dbError) {
    alert('정보 저장 실패: ' + dbError.message)
    return
  }

  alert('회원가입 성공! 로그인 해주세요.')
  window.location.href = 'index.html'
}
