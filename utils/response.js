/**
 * 成功响应
 * @param {object} res - express response
 * @param {*} data - 返回数据
 * @param {string} message - 提示信息
 */
function success(res, data = null, message = "操作成功") {
  res.json({
    code: 200,
    message,
    data,
  });
}

/**
 * 失败响应
 * @param {object} res - express response
 * @param {string} message - 错误信息
 * @param {number} code - 状态码
 */
function fail(res, message = "操作失败", code = 400) {
  res.status(code).json({
    code,
    message,
    data: null,
  });
}

module.exports = { success, fail };
