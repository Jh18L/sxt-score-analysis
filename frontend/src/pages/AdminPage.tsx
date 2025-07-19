import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataStorage, { UserData } from '../utils/dataStorage';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState<'users' | 'blacklist'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [blacklistedUsers, setBlacklistedUsers] = useState<UserData[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const ADMIN_PASSWORD = 'admin123'; // 实际应用中应该更安全

  useEffect(() => {
    // 检查是否有返回状态，设置当前视图和登录状态
    if (location.state?.view) {
      setCurrentView(location.state.view);
    }
    
    // 如果从详情页面返回且已认证，保持登录状态
    if (location.state?.authenticated) {
      setIsAuthenticated(true);
    }
    
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, location.state]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密码错误');
    }
  };

  const loadUsers = () => {
    const storage = DataStorage.getInstance();
    const allUsers = storage.getAllUsers();
    const blacklistedUsers = storage.getBlacklistedUsers();
    
    console.log('AdminPage - 加载用户数据:', {
      totalUsers: allUsers.length,
      blacklistedUsers: blacklistedUsers.length,
      users: allUsers
    });
    
    setUsers(allUsers);
    setBlacklistedUsers(blacklistedUsers);
  };

  const handleBlacklistUser = (userId: string) => {
    const storage = DataStorage.getInstance();
    storage.blacklistUser(userId);
    loadUsers();
  };

  const handleUnblacklistUser = (userId: string) => {
    const storage = DataStorage.getInstance();
    storage.unblacklistUser(userId);
    loadUsers();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('确定要删除此用户吗？此操作不可恢复。')) {
      const storage = DataStorage.getInstance();
      storage.deleteUser(userId);
      loadUsers();
    }
  };

  const handleViewUserDetail = (userId: string) => {
    const fromPage = currentView === 'blacklist' ? 'blacklist' : 'users';
    navigate(`/admin/user/${userId}`, { state: { from: fromPage } });
  };

  const handleBack = () => {
    navigate('/login');
  };

  // 导出用户数据
  const handleExportData = () => {
    const storage = DataStorage.getInstance();
    const exportData = storage.exportUserData();
    
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('数据导出成功！');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError('数据导出失败');
    }
  };

  // 导入用户数据
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const storage = DataStorage.getInstance();
      const result = storage.importUserData(content);
      
      if (result.success) {
        setMessage(result.message);
        loadUsers(); // 重新加载用户列表
      } else {
        setError(result.message);
      }
      
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
    };
    
    reader.readAsText(file);
    
    // 清空文件输入，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 清空所有数据
  const handleClearAllData = () => {
    if (window.confirm('确定要清空所有用户数据吗？此操作不可恢复！')) {
      const storage = DataStorage.getInstance();
      storage.clearAllData();
      loadUsers();
      setMessage('所有数据已清空');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
        <h2 className="admin-title">管理员登录</h2>
        <div className="admin-login-form">
          <input
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button className="admin-login-btn" onClick={handleLogin}>登录</button>
          {error && <div className="admin-error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h2 className="admin-title">管理员控制台</h2>
      
      {/* 数据管理按钮 */}
      <div className="data-management">
        <button className="data-btn export-btn" onClick={handleExportData}>
          导出用户数据
        </button>
        <button className="data-btn import-btn" onClick={() => fileInputRef.current?.click()}>
          导入用户数据
        </button>
        <button className="data-btn clear-btn" onClick={handleClearAllData}>
          清空所有数据
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          style={{ display: 'none' }}
        />
      </div>

      {/* 消息提示 */}
      {message && <div className="admin-message success">{message}</div>}
      {error && <div className="admin-message error">{error}</div>}
      
      <div className="admin-nav">
        <button 
          className={`admin-nav-btn ${currentView === 'users' ? 'active' : ''}`}
          onClick={() => setCurrentView('users')}
        >
          用户管理 ({users.length})
        </button>
        <button 
          className={`admin-nav-btn ${currentView === 'blacklist' ? 'active' : ''}`}
          onClick={() => setCurrentView('blacklist')}
        >
          黑名单 ({blacklistedUsers.length})
        </button>
      </div>

      {currentView === 'users' && (
        <div className="admin-content">
          <h3>用户列表</h3>
          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="user-item" onClick={() => handleViewUserDetail(user.id)}>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-details">
                    <span>账号: {user.account}</span>
                    <span>手机: {user.phoneNumber}</span>
                    <span>年级: {user.gradeName}</span>
                    <span>学校: {user.schoolName}</span>
                    <span>登录时间: {new Date(user.loginTime).toLocaleString()}</span>
                  </div>
                </div>
                <div className="user-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="action-btn blacklist-btn"
                    onClick={() => handleBlacklistUser(user.id)}
                    disabled={user.isBlacklisted}
                  >
                    {user.isBlacklisted ? '已拉黑' : '拉黑'}
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'blacklist' && (
        <div className="admin-content">
          <h3>黑名单用户</h3>
          <div className="user-list">
            {blacklistedUsers.map(user => (
              <div key={user.id} className="user-item blacklisted" onClick={() => handleViewUserDetail(user.id)}>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-details">
                    <span>账号: {user.account}</span>
                    <span>手机: {user.phoneNumber}</span>
                    <span>年级: {user.gradeName}</span>
                    <span>学校: {user.schoolName}</span>
                    <span>登录时间: {new Date(user.loginTime).toLocaleString()}</span>
                  </div>
                </div>
                <div className="user-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="action-btn unblacklist-btn"
                    onClick={() => handleUnblacklistUser(user.id)}
                  >
                    解除拉黑
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 