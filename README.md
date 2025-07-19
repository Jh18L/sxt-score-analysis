# 生学堂成绩分析系统

一个基于生学堂平台的成绩查询与分析工具，为学生提供便捷的成绩查看、分析和统计功能。

## 🌟 功能特点

### 📊 成绩分析
- **雷达图分析**：直观显示各科目得分情况，支持语数外150分制
- **历史趋势**：查看单科目分数和市排名变化趋势
- **智能Y轴**：根据科目自动调整图表显示范围
- **移动端优化**：完美适配手机和平板设备

### 📱 用户界面
- **现代化设计**：毛玻璃效果，渐变背景
- **响应式布局**：支持各种屏幕尺寸
- **双登录模式**：支持密码登录和验证码登录
- **用户协议**：完整的用户与隐私协议

### 🔐 数据安全
- **本地存储**：用户数据仅存储在本地设备
- **隐私保护**：不收集个人敏感信息
- **账号安全**：支持账号拉黑和黑名单管理

### 👨‍💼 管理功能
- **用户管理**：查看所有用户信息和数据
- **黑名单管理**：支持拉黑和解除拉黑用户
- **数据导出**：支持用户数据导出和导入
- **管理员权限**：密码保护的管理员入口

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/sxt-score-analysis.git
cd sxt-score-analysis
```

2. **安装依赖**
```bash
cd frontend
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 生产部署

1. **构建项目**
```bash
npm run build
```

2. **部署到服务器**
将 `build` 文件夹部署到您的Web服务器

## 📁 项目结构

```
sxt/
├── frontend/                 # 前端React应用
│   ├── public/              # 静态资源
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── utils/          # 工具函数
│   │   └── App.tsx         # 主应用组件
│   └── package.json
├── aes.js                   # AES加密工具
├── 程序说明.txt             # 项目说明文档
└── README.md               # 项目描述文件
```

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **图表库**：Recharts
- **路由管理**：React Router v6
- **样式方案**：CSS3 + 响应式设计
- **数据存储**：LocalStorage
- **加密方案**：AES加密

## 📱 页面功能

### 登录页面
- 支持密码和验证码两种登录方式
- 用户协议确认
- 账号注册提醒
- 移动端优化

### 用户信息页面
- 显示用户基本信息
- 快速跳转到考试列表
- 退出登录功能

### 考试列表页面
- 分页显示考试列表
- 考试状态显示
- 查看成绩和分析成绩功能

### 成绩分析页面
- 雷达图显示各科目得分
- 历史趋势折线图
- 支持分数和排名两种模式
- 科目选择器

### 管理员页面
- 用户数据管理
- 黑名单管理
- 数据导出导入
- 用户详情查看

## 🔧 配置说明

### 代理配置
项目使用代理中间件处理API请求，支持多个域名：

```javascript
// 支持的API域名
- /api/passport/* -> https://passport.sxw.cn
- /api/platform/* -> https://api.sxw.cn
- /api/sxt-h5/* -> https://api.sxw.cn
```

### 环境变量
创建 `.env` 文件配置环境变量：

```env
REACT_APP_API_BASE_URL=https://api.sxw.cn
REACT_APP_ENV=production
```

## 📄 用户协议

本系统遵循严格的隐私保护政策：

- 用户数据仅存储在本地设备
- 不会向第三方分享个人信息
- 支持用户随时删除本地数据
- 采用行业标准的安全措施

详细协议请查看：[用户与隐私协议](./frontend/src/pages/UserAgreementPage.tsx)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 联系方式

- **邮箱**：yly.l@qq.com
- **项目地址**：https://github.com/your-username/sxt-score-analysis

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢生学堂平台提供的API支持，以及所有为项目做出贡献的开发者。

---

© 2025 狐三岁. 保留所有权利。 