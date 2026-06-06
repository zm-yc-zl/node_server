const API_BASE = "http://localhost:3000/api/auth";
let currentEmail = "";

// 显示提示
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// 切换到注册
function switchToRegister() {
  document.querySelector(".login-container").style.display = "none";
  document.getElementById("registerContainer").style.display = "block";
  document.getElementById("forgotPasswordContainer").style.display = "none";
}

// 切换到登录
function switchToLogin() {
  document.querySelector(".login-container").style.display = "block";
  document.getElementById("registerContainer").style.display = "none";
  document.getElementById("forgotPasswordContainer").style.display = "none";
}

// 切换到忘记密码
function switchToForgotPassword() {
  document.querySelector(".login-container").style.display = "none";
  document.getElementById("registerContainer").style.display = "none";
  document.getElementById("forgotPasswordContainer").style.display = "block";
  document.getElementById("step1").style.display = "block";
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "none";
}

// 返回步骤1
function backToStep1() {
  document.getElementById("step1").style.display = "block";
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "none";
}

// 登录表单提交
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.code === 200) {
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      showToast("登录成功，正在跳转...", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      document.getElementById("formError").textContent = result.message;
      document.getElementById("formError").classList.add("show");
    }
  } catch (error) {
    showToast("网络请求失败", "error");
  }
});

// 注册表单提交
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (result.code === 200) {
        showToast("注册成功，请登录", "success");
        setTimeout(() => {
          switchToLogin();
        }, 1500);
      } else {
        document.getElementById("regFormError").textContent = result.message;
        document.getElementById("regFormError").classList.add("show");
      }
    } catch (error) {
      showToast("网络请求失败", "error");
    }
  });

// 忘记密码-发送验证码
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value;
  currentEmail = email;

  try {
    const response = await fetch(`${API_BASE}/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (result.code === 200) {
      showToast(result.message, "success");
      document.getElementById("step1").style.display = "none";
      document.getElementById("step2").style.display = "block";
    } else {
      document.getElementById("forgotError").textContent = result.message;
      document.getElementById("forgotError").classList.add("show");
    }
  } catch (error) {
    showToast("网络请求失败", "error");
  }
});

// 忘记密码-重置密码
document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = document.getElementById("verificationCode").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, code, newPassword }),
    });

    const result = await response.json();

    if (result.code === 200) {
      document.getElementById("step2").style.display = "none";
      document.getElementById("step3").style.display = "block";
    } else {
      document.getElementById("resetError").textContent = result.message;
      document.getElementById("resetError").classList.add("show");
    }
  } catch (error) {
    showToast("网络请求失败", "error");
  }
});

// 自动跳转到首页（如果已登录）
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "index.html";
  }
});
