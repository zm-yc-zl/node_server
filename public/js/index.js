// 用户管理系统 - 修复版

class UserManagement {
  constructor() {
    this.API_BASE = "http://localhost:3000/api/users";
    this.AUTH_BASE = "http://localhost:3000/api/auth";
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 1;
    this.keyword = "";
    this.editingUserId = null;
    this.deletingUserId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.checkLogin();
  }

  // 获取 token
  getToken() {
    return localStorage.getItem("token");
  }

  // 获取用户信息
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  // 重定向到登录页
  redirectToLogin() {
    window.location.href = "login.html";
  }

  // 退出登录
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.showToast("已退出登录", "success");
    setTimeout(() => {
      this.redirectToLogin();
    }, 1500);
  }

  // 验证登录状态
  async checkLogin() {
    const token = this.getToken();
    if (!token) {
      document.getElementById("loginOverlay").style.display = "flex";
      return false;
    }

    try {
      const response = await fetch(`${this.AUTH_BASE}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.code === 200) {
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("mainContainer").style.display = "block";
        document.getElementById("userInfo").textContent =
          "欢迎, " + result.data.user.name;
        this.loadUsers(1);
        return true;
      } else {
        this.handleAuthError();
        return false;
      }
    } catch (error) {
      this.handleAuthError();
      return false;
    }
  }

  // 处理认证错误
  handleAuthError() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.getElementById("loginOverlay").style.display = "flex";
  }

  // 加载用户列表
  async loadUsers(page = 1) {
    const token = this.getToken();
    if (!token) return;

    this.currentPage = page;
    const url = new URL(`${this.API_BASE}/list`);
    url.searchParams.set("page", this.currentPage);
    url.searchParams.set("pageSize", this.pageSize);
    if (this.keyword) {
      url.searchParams.set("keyword", this.keyword);
    }

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.code === 200) {
        this.renderUsers(result.data.list);
        this.updatePagination(result.data.total);
      } else if (result.code === 401) {
        this.handleAuthError();
        this.showToast("登录已过期，请重新登录", "error");
      } else {
        this.showToast("加载用户失败: " + result.message, "error");
      }
    } catch (error) {
      console.error("Load users error:", error);
      this.showToast("网络请求失败", "error");
    }
  }

  // 渲染用户列表
  renderUsers(users) {
    const tbody = document.getElementById("userTableBody");

    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px;">
            <p>暂无用户数据</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users
      .map(
        (user) => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${this.formatDate(user.created_at)}</td>
        <td>
          <button class="action-btn edit" data-id="${user.id}">编辑</button>
          <button class="action-btn delete" data-id="${user.id}">删除</button>
        </td>
      </tr>
    `,
      )
      .join("");

    // 绑定表格事件（使用事件委托）
    this.bindTableEvents();
  }

  // 绑定表格事件
  bindTableEvents() {
    const tbody = document.getElementById("userTableBody");

    // 先移除旧的事件监听器（避免重复绑定）
    tbody.replaceWith(tbody.cloneNode(true));

    // 获取新的 tbody
    const newTbody = document.getElementById("userTableBody");

    // 使用事件委托绑定事件
    newTbody.addEventListener("click", (e) => {
      const target = e.target;

      if (
        target.classList.contains("action-btn") &&
        target.classList.contains("edit")
      ) {
        const id = parseInt(target.getAttribute("data-id"));
        console.log("Edit user clicked:", id);
        this.editUser(id);
      } else if (
        target.classList.contains("action-btn") &&
        target.classList.contains("delete")
      ) {
        const id = parseInt(target.getAttribute("data-id"));
        console.log("Delete user clicked:", id);
        this.confirmDeleteModal(id);
      }
    });
  }

  // 更新分页控件
  updatePagination(total) {
    this.totalPages = Math.ceil(total / this.pageSize);
    document.getElementById("pageInfo").textContent =
      `第 ${this.currentPage} 页 / 共 ${this.totalPages} 页`;
    document.getElementById("totalCount").textContent = `共 ${total} 条`;
    document.getElementById("prevBtn").disabled = this.currentPage === 1;
    document.getElementById("nextBtn").disabled =
      this.currentPage >= this.totalPages;
  }

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 打开模态框
  openModal() {
    this.editingUserId = null;
    document.getElementById("modalTitle").textContent = "新增用户";
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("modal").style.display = "flex";
  }

  // 关闭模态框
  closeModal() {
    document.getElementById("modal").style.display = "none";
  }

  // 编辑用户
  async editUser(id) {
    console.log("Editing user:", id);
    const token = this.getToken();
    if (!token) {
      console.log("No token found");
      return;
    }

    this.editingUserId = id;
    try {
      console.log("Fetching user data...");
      const response = await fetch(`${this.API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);

      if (result.code === 200) {
        const user = result.data;
        document.getElementById("modalTitle").textContent = "编辑用户";
        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("modal").style.display = "flex";
      } else if (result.code === 401) {
        this.handleAuthError();
      } else {
        this.showToast("获取用户信息失败", "error");
      }
    } catch (error) {
      console.error("Edit user error:", error);
      this.showToast("网络请求失败", "error");
    }
  }

  // 提交表单
  async submitForm(e) {
    e.preventDefault();
    const token = this.getToken();
    if (!token) return;

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    try {
      let response;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (this.editingUserId) {
        // 更新用户
        response = await fetch(`${this.API_BASE}/${this.editingUserId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ name, email }),
        });
      } else {
        // 新增用户
        response = await fetch(this.API_BASE, {
          method: "POST",
          headers,
          body: JSON.stringify({ name, email }),
        });
      }

      const result = await response.json();

      if (result.code === 200) {
        this.showToast(this.editingUserId ? "更新成功" : "新增成功", "success");
        this.closeModal();
        this.loadUsers(this.currentPage);
      } else if (result.code === 401) {
        this.handleAuthError();
      } else {
        this.showToast(result.message, "error");
      }
    } catch (error) {
      console.error("Submit form error:", error);
      this.showToast("网络请求失败", "error");
    }
  }

  // 显示删除确认框
  confirmDeleteModal(id) {
    this.deletingUserId = id;
    document.getElementById("deleteModal").style.display = "flex";
  }

  // 关闭删除确认框
  closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
  }

  // 确认删除
  async confirmDelete() {
    const token = this.getToken();
    if (!token || !this.deletingUserId) return;

    try {
      const response = await fetch(`${this.API_BASE}/${this.deletingUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.code === 200) {
        this.showToast("删除成功", "success");
        this.closeDeleteModal();
        const newPage =
          this.currentPage === 1
            ? 1
            : this.totalPages > this.currentPage
              ? this.currentPage
              : this.currentPage - 1;
        this.loadUsers(newPage);
      } else if (result.code === 401) {
        this.handleAuthError();
      } else {
        this.showToast(result.message, "error");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      this.showToast("网络请求失败", "error");
    }
  }

  // 搜索
  handleSearch() {
    this.keyword = document.getElementById("searchInput").value;
    this.loadUsers(1);
  }

  // 上一页
  prevPage() {
    if (this.currentPage > 1) {
      this.loadUsers(this.currentPage - 1);
    }
  }

  // 下一页
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadUsers(this.currentPage + 1);
    }
  }

  // 改变每页条数
  changePageSize() {
    this.pageSize = parseInt(document.getElementById("pageSizeSelect").value);
    this.loadUsers(1);
  }

  // 显示提示
  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.className = "toast";
    }, 3000);
  }

  // 绑定事件
  bindEvents() {
    // 去登录按钮
    const goLoginBtn = document.getElementById("goLoginBtn");
    if (goLoginBtn) {
      goLoginBtn.addEventListener("click", () => {
        this.redirectToLogin();
      });
    }

    // 退出登录按钮
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }

    // 搜索框回车事件
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          this.handleSearch();
        }
      });
    }

    // 搜索按钮
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.handleSearch();
      });
    }

    // 分页按钮
    const prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.prevPage();
      });
    }

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.nextPage();
      });
    }

    // 分页大小选择
    const pageSizeSelect = document.getElementById("pageSizeSelect");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", () => {
        this.changePageSize();
      });
    }

    // 表单提交事件
    const userForm = document.getElementById("userForm");
    if (userForm) {
      userForm.addEventListener("submit", (e) => {
        this.submitForm(e);
      });
    }

    // 模态框关闭按钮
    const modalClose = document.getElementById("modalClose");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        this.closeModal();
      });
    }

    const modalCancelBtn = document.getElementById("modalCancelBtn");
    if (modalCancelBtn) {
      modalCancelBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    // 删除模态框关闭按钮
    const deleteModalClose = document.getElementById("deleteModalClose");
    if (deleteModalClose) {
      deleteModalClose.addEventListener("click", () => {
        this.closeDeleteModal();
      });
    }

    const deleteCancelBtn = document.getElementById("deleteCancelBtn");
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        this.closeDeleteModal();
      });
    }

    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        this.confirmDelete();
      });
    }

    // 模态框点击外部关闭
    const modal = document.getElementById("modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    const deleteModal = document.getElementById("deleteModal");
    if (deleteModal) {
      deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
          this.closeDeleteModal();
        }
      });
    }

    // 新增用户按钮
    setTimeout(() => {
      const addBtn = document.querySelector("header .btn-primary");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          this.openModal();
        });
      }
    }, 100);
  }
}

// 初始化应用
const userMgmt = new UserManagement();
