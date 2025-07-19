const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理 https://api.sxw.cn
  app.use(
    '/api/passport',
    createProxyMiddleware({
      target: 'https://api.sxw.cn',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('pid', 'SXT');
        proxyReq.setHeader('appType', 'student');
        proxyReq.setHeader('operatingSystem', 'android');
        proxyReq.setHeader('User-Agent', 'Dalvik/2.1.0 (Linux; U; Android 12)');
      }
    })
  );
  app.use(
    '/api/platform',
    createProxyMiddleware({
      target: 'https://api.sxw.cn',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        // 强制设置请求头（验证码登录时）
        if (req.url.includes('/api/platform/api/user/get_user_info/1')) {
          try {
            const cookies = req.headers.cookie || '';
            // 通过cookie或自定义头传递accountType
            const accountType = cookies.includes('accountType=8') || req.headers['accounttype'] === '8';
            if (accountType) {
              proxyReq.setHeader('versionName', '3.3.5');
              proxyReq.setHeader('versionCode', '335');
              proxyReq.setHeader('appType', 'student');
              proxyReq.setHeader('operatingSystem', 'android');
              proxyReq.setHeader('pid', 'SXT');
              proxyReq.setHeader('Content-Type', 'application/json;charset=UTF-8');
              proxyReq.setHeader('User-Agent', 'Dalvik/2.1.0 (Linux; U; Android 12)');
              proxyReq.setHeader('Host', 'api.sxw.cn');
              proxyReq.setHeader('Connection', 'Keep-Alive');
              proxyReq.setHeader('Accept-Encoding', 'gzip');
            }
          } catch(e) {}
        } else {
          proxyReq.setHeader('pid', 'SXT');
          proxyReq.setHeader('appType', 'student');
          proxyReq.setHeader('operatingSystem', 'android');
          proxyReq.setHeader('User-Agent', 'Dalvik/2.1.0 (Linux; U; Android 12)');
        }
      }
    })
  );
  // 代理 https://portal.sxw.cn
  app.use(
    '/api/sxt-h5',
    createProxyMiddleware({
      target: 'https://portal.sxw.cn',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('pid', 'SXT');
        proxyReq.setHeader('appType', 'student');
        proxyReq.setHeader('operatingSystem', 'android');
        proxyReq.setHeader('User-Agent', 'sxt_android3.3.5');
      }
    })
  );
}; 