const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");
const formTitle = document.getElementById("form-title");
const forgotPassword = document.getElementById("forgot-password");

// Chuyển form
if (showRegister) {
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    formTitle.innerText = "Đăng ký";
  });
}

if (showLogin) {
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    formTitle.innerText = "Đăng nhập";
  });
}

// Lưu user vào localStorage
function saveUser(username, email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const existed = users.find(u => u.username === username || u.email === email);
  if (existed) return false;
  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  return true;
}

// Kiểm tra đăng nhập
function checkLogin(username, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return users.find(u => u.username === username && u.password === password);
}

// Đăng ký
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const msg = document.getElementById("register-message");

    msg.className = "message"; // reset trạng thái

    if (!username || !email || !password) {
      msg.textContent = "⚠️ Điền đầy đủ thông tin!";
      msg.classList.add("error");
      return;
    }

    const ok = saveUser(username, email, password);
    if (!ok) {
      msg.textContent = "❌ Tên người dùng hoặc email đã tồn tại!";
      msg.classList.add("error");
      return;
    }

    msg.textContent = "✅ Đăng ký thành công! Giờ bạn có thể đăng nhập.";
    msg.classList.add("success");
    registerForm.reset();
  });
}

// Đăng nhập
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const msg = document.getElementById("login-message");

    msg.className = "message"; // reset trạng thái

    const user = checkLogin(username, password);
    if (!user) {
      msg.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
      msg.classList.add("error");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "index.html";
  });
}


const popup = document.getElementById("reset-popup");
const resetBtn = document.getElementById("reset-confirm");
const resetClose = document.getElementById("reset-close");
const resetMsg = document.getElementById("reset-message");

forgotPassword.addEventListener("click", (e) => {
  e.preventDefault();
  popup.classList.remove("hidden");
});

resetClose.addEventListener("click", () => {
  popup.classList.add("hidden");
  resetMsg.textContent = "";
});

resetBtn.addEventListener("click", () => {
  const email = document.getElementById("reset-email").value.trim();
  const newPass = document.getElementById("reset-newpass").value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || [];
  resetMsg.className = "message";

  const user = users.find(u => u.email === email);
  if (!user) {
    resetMsg.textContent = "❌ Không tìm thấy email này!";
    resetMsg.classList.add("error");
    return;
  }
  if (!newPass) {
    resetMsg.textContent = "⚠️ Nhập mật khẩu mới!";
    resetMsg.classList.add("error");
    return;
  }

  user.password = newPass;
  localStorage.setItem("users", JSON.stringify(users));
  resetMsg.textContent = "✅ Mật khẩu đã được đặt lại thành công!";
  resetMsg.classList.add("success");
});

