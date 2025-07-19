import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 预留页面组件
import LoginPage from './pages/LoginPage';
import UserInfoPage from './pages/UserInfoPage';
import ExamListPage from './pages/ExamListPage';
import ExamDetailPage from './pages/ExamDetailPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ScoreAnalysisPage from './pages/ScoreAnalysisPage';
import AdminPage from './pages/AdminPage';
import UserDetailPage from './pages/UserDetailPage';
import UserAgreementPage from './pages/UserAgreementPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<LoginPage />} />
        {/* 用户协议页 */}
        <Route path="/agreement" element={<UserAgreementPage />} />
        {/* 用户信息页 */}
        <Route path="/user" element={<UserInfoPage />} />
        {/* 考试列表页 */}
        <Route path="/exams" element={<ExamListPage />} />
        {/* 成绩分析页 */}
        <Route path="/exam/:examId" element={<ExamDetailPage />} />
        {/* 成绩分析页面 */}
        <Route path="/analysis/:examId" element={<ScoreAnalysisPage />} />
        {/* 小题得分页 */}
        <Route path="/exam/:examId/:courseId" element={<QuestionDetailPage />} />
        {/* 管理员页面 */}
        <Route path="/admin" element={<AdminPage />} />
        {/* 用户详情页面 */}
        <Route path="/admin/user/:userId" element={<UserDetailPage />} />
        {/* 默认跳转到登录页 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
