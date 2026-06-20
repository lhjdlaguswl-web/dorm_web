// Supabase 연결
const SUPABASE_URL = 'https://cfjkgbyrzmkfqsgbrbsx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmamtnYnlyem1rZnFzZ2JyYnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzI3OTMsImV4cCI6MjA5NzUwODc5M30.tZnUoUGyObV7YLBZnKPSZynoPJAe9KrmyW0eynqtKZQ'
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)


// 로그인 체크
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = 'index.html'
  }
  return user
}

// 이미 로그인된 유저는 로그인 페이지 접근 못하게
async function checkAlreadyLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    window.location.href = 'dashboard.html'
  }
}

// 페이지별 자동 실행
if (window.location.pathname.includes('index') || window.location.pathname === '/dorm_web/') {
  checkAlreadyLoggedIn()
}


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
// 로그아웃
async function logout() {
  await supabase.auth.signOut()
  window.location.href = 'index.html'
}

// 내 민원 목록 불러오기
async function loadComplaints() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'index.html'
    return
  }

  // 관리자면 admin 페이지로 이동
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData && userData.role === 'admin') {
    window.location.href = 'admin.html'
    return
  }
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = document.getElementById('complaint-list')

  if (error || !data || data.length === 0) {
    list.innerHTML = '<p>아직 신청한 민원이 없어요.</p>'
    return
  }

  list.innerHTML = data.map(c => `
    <div class="complaint-item">
      <p><strong>${c.category}</strong> - ${c.location}</p>
      <p>${c.description}</p>
      <p>상태: <span class="status-${c.status}">${c.status}</span></p>
<p class="date">${new Date(c.created_at).toLocaleDateString()}</p>
<button onclick="deleteMyComplaint('${c.id}')">삭제</button>
    </div>
  `).join('')
}

// dashboard 페이지면 자동 실행
if (window.location.pathname.includes('dashboard')) {
  loadComplaints()
}
// 민원 신청
async function submitComplaint() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'index.html'
    return
  }

  const category = document.getElementById('category').value
  const location = document.getElementById('location').value
  const description = document.getElementById('description').value

  if (!category || !location || !description) {
    alert('모든 항목을 입력해주세요!')
    return
  }

  const { error } = await supabase
    .from('complaints')
    .insert({
      user_id: user.id,
      category,
      location,
      description,
      status: '접수됨'
    })

  if (error) {
    alert('신청 실패: ' + error.message)
    return
  }

  alert('민원이 신청되었습니다!')
  window.location.href = 'dashboard.html'
}

// 관리자 민원 목록 불러오기
async function loadAdminComplaints() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'index.html'
    return
  }

  // 관리자 권한 체크
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    alert('관리자만 접근할 수 있어요!')
    window.location.href = 'dashboard.html'
    return
  }

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })

  const list = document.getElementById('admin-complaint-list')

  if (error || !data || data.length === 0) {
    list.innerHTML = '<p>접수된 민원이 없어요.</p>'
    return
  }

  list.innerHTML = data.map(c => `
    <div class="complaint-item">
      <p><strong>${c.category}</strong> - ${c.location}</p>
      <p>${c.description}</p>
      <p>상태: 
        <select onchange="updateStatus('${c.id}', this.value)">
          <option ${c.status === '접수됨' ? 'selected' : ''}>접수됨</option>
          <option ${c.status === '처리중' ? 'selected' : ''}>처리중</option>
          <option ${c.status === '완료' ? 'selected' : ''}>완료</option>
        </select>
      </p>
      <button onclick="deleteComplaint('${c.id}')">삭제</button>
      <p class="date">${new Date(c.created_at).toLocaleDateString()}</p>
    </div>
  `).join('')
}

// 상태 변경
async function updateStatus(id, status) {
  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', id)

  if (error) {
    alert('상태 변경 실패: ' + error.message)
  } else {
    alert('상태가 변경되었습니다!')
  }
}

// 민원 삭제
async function deleteComplaint(id) {
  if (!confirm('정말 삭제하시겠어요?')) return

  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', id)

  if (error) {
    alert('삭제 실패: ' + error.message)
  } else {
    alert('삭제되었습니다!')
    loadAdminComplaints()
  }
}

// admin 페이지면 자동 실행
if (window.location.pathname.includes('admin')) {
  loadAdminComplaints()
}
// 학생 민원 삭제
async function deleteMyComplaint(id) {
  if (!confirm('정말 삭제하시겠어요?')) return

  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', id)

  if (error) {
    alert('삭제 실패: ' + error.message)
  } else {
    alert('삭제되었습니다!')
    loadComplaints()
  }
}
