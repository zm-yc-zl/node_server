const db = require("../config/db");
const { success, fail } = require("../utils/response");

const userController = {
  // 获取用户列表（支持分页 + 模糊搜索）
  async list(req, res) {
    try {
      const { page = 1, pageSize = 10, keyword = "" } = req.query;
      const offset = (page - 1) * pageSize;

      let sql = "SELECT id, name, email, created_at FROM users";
      let countSql = "SELECT COUNT(*) AS total FROM users";
      const params = [];

      // 如果有关键词，添加模糊搜索条件
      if (keyword) {
        sql += " WHERE name LIKE ? OR email LIKE ?";
        countSql += " WHERE name LIKE ? OR email LIKE ?";
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 添加排序和分页
      sql += " ORDER BY id DESC LIMIT ? OFFSET ?";

      // 执行查询
      const [rows] = await db.query(sql, [
        ...params,
        Number(pageSize),
        Number(offset),
      ]);
      const [countResult] = await db.query(countSql, params);

      return success(res, {
        list: rows,
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (err) {
      console.error("Get users error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 获取单个用户
  async detail(req, res) {
    try {
      const { id } = req.params;

      // 参数校验
      if (!id || isNaN(id)) {
        return fail(res, "用户ID无效");
      }

      const [rows] = await db.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return fail(res, "用户不存在", 404);
      }

      return success(res, rows[0]);
    } catch (err) {
      console.error("Get user detail error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 新增用户
  async create(req, res) {
    try {
      const { name, email } = req.body;

      // 参数校验
      if (!name || !email) {
        return fail(res, "姓名和邮箱不能为空");
      }

      // 邮箱格式校验
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        return fail(res, "邮箱格式不正确");
      }

      // 检查邮箱是否已存在
      const [exist] = await db.query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      if (exist.length > 0) {
        return fail(res, "该邮箱已被注册");
      }

      const [result] = await db.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email],
      );

      return success(res, { id: result.insertId }, "新增成功");
    } catch (err) {
      console.error("Create user error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 更新用户
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // 参数校验
      if (!id || isNaN(id)) {
        return fail(res, "用户ID无效");
      }

      if (!name || !email) {
        return fail(res, "姓名和邮箱不能为空");
      }

      // 邮箱格式校验
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        return fail(res, "邮箱格式不正确");
      }

      // 检查用户是否存在
      const [exist] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
      if (exist.length === 0) {
        return fail(res, "用户不存在", 404);
      }

      // 检查邮箱是否被其他用户使用
      const [emailExist] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id],
      );
      if (emailExist.length > 0) {
        return fail(res, "该邮箱已被注册");
      }

      await db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
        name,
        email,
        id,
      ]);

      return success(res, null, "更新成功");
    } catch (err) {
      console.error("Update user error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 删除用户
  async remove(req, res) {
    try {
      const { id } = req.params;

      // 参数校验
      if (!id || isNaN(id)) {
        return fail(res, "用户ID无效");
      }

      // 检查用户是否存在
      const [exist] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
      if (exist.length === 0) {
        return fail(res, "用户不存在", 404);
      }

      await db.query("DELETE FROM users WHERE id = ?", [id]);

      return success(res, null, "删除成功");
    } catch (err) {
      console.error("Delete user error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 批量生成测试数据
  async generateTestData(req, res) {
    try {
      const { count = 100 } = req.body;

      // 参数校验
      if (count > 1000) {
        return fail(res, "单次生成数量不能超过1000");
      }

      // 生成随机姓名和邮箱
      const firstNames = [
        "张",
        "李",
        "王",
        "刘",
        "陈",
        "杨",
        "赵",
        "黄",
        "周",
        "吴",
        "徐",
        "孙",
        "马",
        "朱",
        "胡",
        "郭",
        "何",
        "林",
        "罗",
        "高",
      ];
      const lastNames = [
        "伟",
        "强",
        "勇",
        "军",
        "敏",
        "磊",
        "涛",
        "杰",
        "鹏",
        "辉",
        "艳",
        "丽",
        "静",
        "萍",
        "芳",
        "燕",
        "娜",
        "婷",
        "雪",
        "梅",
      ];
      const domains = [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "163.com",
        "qq.com",
        "example.com",
      ];

      // 使用时间戳确保邮箱唯一性
      const timestamp = Date.now();

      // 生成插入数据
      const values = [];
      for (let i = 0; i < count; i++) {
        const firstName =
          firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
          lastNames[Math.floor(Math.random() * lastNames.length)];
        const name =
          firstName +
          lastName +
          (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : "");
        const email = `${name.toLowerCase()}${timestamp}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;
        values.push([name, email]);
      }

      // 执行批量插入
      const [result] = await db.query(
        "INSERT INTO users (name, email) VALUES ?",
        [values],
      );

      return success(
        res,
        { count: result.affectedRows },
        `成功生成 ${result.affectedRows} 条测试数据`,
      );
    } catch (err) {
      console.error("Generate test data error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },
};

module.exports = userController;
