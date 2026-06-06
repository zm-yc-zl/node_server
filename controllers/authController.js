const db = require("../config/db");
const { success, fail } = require("../utils/response");
const jwt = require("jsonwebtoken");
const util = require("util");

// 异步化 jwt.verify
const jwtVerify = util.promisify(jwt.verify);

// 存储验证码（实际项目应使用 Redis）
const verificationCodes = {};

const authController = {
  // 用户登录
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 参数校验
      if (!email || !password) {
        return fail(res, "邮箱和密码不能为空");
      }

      // 查询用户
      const [rows] = await db.query(
        "SELECT id, name, email, password FROM users WHERE email = ?",
        [email],
      );

      if (rows.length === 0) {
        return fail(res, "用户不存在");
      }

      const user = rows[0];

      // 验证密码（生产环境应使用 bcrypt.compare）
      if (password !== user.password) {
        return fail(res, "密码错误");
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "1h" },
      );

      return success(
        res,
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        "登录成功",
      );
    } catch (err) {
      console.error("Login error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 用户注册
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // 参数校验
      if (!name || !email || !password) {
        return fail(res, "姓名、邮箱和密码不能为空");
      }

      // 邮箱格式校验
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        return fail(res, "邮箱格式不正确");
      }

      // 密码长度校验
      if (password.length < 6) {
        return fail(res, "密码长度不能少于6位");
      }

      // 检查邮箱是否已存在
      const [exist] = await db.query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      if (exist.length > 0) {
        return fail(res, "该邮箱已被注册");
      }

      // 创建用户（生产环境应使用 bcrypt.hash 加密密码）
      const [result] = await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
      );

      return success(res, { id: result.insertId }, "注册成功");
    } catch (err) {
      console.error("Register error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 验证 token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return fail(res, "未提供 token", 401);
      }

      // 使用 async/await 替代回调
      const decoded = await jwtVerify(
        token,
        process.env.JWT_SECRET || "secret_key",
      );

      const [rows] = await db.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [decoded.id],
      );

      if (rows.length === 0) {
        return fail(res, "用户不存在", 401);
      }

      return success(res, { user: rows[0] });
    } catch (err) {
      console.error("Verify token error:", err);
      return fail(res, "token 无效或已过期", 401);
    }
  },

  // 发送验证码（忘记密码）
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return fail(res, "请输入邮箱");
      }

      // 检查用户是否存在
      const [rows] = await db.query(
        "SELECT id, name FROM users WHERE email = ?",
        [email],
      );

      if (rows.length === 0) {
        return fail(res, "该邮箱未注册");
      }

      // 生成 4 位数字验证码
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      // 存储验证码（设置 5 分钟过期）
      verificationCodes[email] = {
        code,
        userId: rows[0].id,
        expireTime: Date.now() + 5 * 60 * 1000,
      };

      console.log(`【验证码】邮箱: ${email}, 验证码: ${code}`);

      return success(res, { code }, `验证码已发送：${code}`);
    } catch (err) {
      console.error("Send verification code error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },

  // 验证验证码并重置密码
  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      // 参数校验
      if (!email || !code || !newPassword) {
        return fail(res, "请填写完整信息");
      }

      // 密码长度校验
      if (newPassword.length < 6) {
        return fail(res, "新密码长度不能少于6位");
      }

      // 检查验证码是否存在
      const storedCode = verificationCodes[email];
      if (!storedCode) {
        return fail(res, "请先获取验证码");
      }

      // 检查验证码是否过期
      if (Date.now() > storedCode.expireTime) {
        delete verificationCodes[email];
        return fail(res, "验证码已过期，请重新获取");
      }

      // 比对验证码
      if (storedCode.code !== code) {
        return fail(res, "验证码不正确");
      }

      // 更新密码
      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        newPassword,
        storedCode.userId,
      ]);

      // 删除已使用的验证码
      delete verificationCodes[email];

      return success(res, null, "密码重置成功，请登录");
    } catch (err) {
      console.error("Reset password error:", err);
      return fail(res, "服务器内部错误", 500);
    }
  },
};

module.exports = authController;
