import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DataStorage, { UserData } from '../utils/dataStorage';
import './UserDetailPage.css';

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const storage = DataStorage.getInstance();
      const userData = storage.getUserById(userId);
      setUser(userData || null);
      setLoading(false);
    }
  }, [userId]);

  const handleBack = () => {
    // 直接返回到管理员页面，保持当前视图
    navigate('/admin', { 
      state: { 
        view: location.state?.from === 'blacklist' ? 'blacklist' : 'users',
        authenticated: true 
      } 
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未设置';
    try {
      return new Date(dateString).toLocaleString('zh-CN');
    } catch {
      return dateString;
    }
  };

  // 根据身份证号推算信息
  const parseIdCard = (idCard: string) => {
    if (!idCard || idCard.length !== 18) return null;
    
    try {
      // 提取地区代码（前6位）
      const areaCode = idCard.substring(0, 6);
      
      // 提取出生日期（第7-14位）
      const year = idCard.substring(6, 10);
      const month = idCard.substring(10, 12);
      const day = idCard.substring(12, 14);
      const birthday = `${year}-${month}-${day}`;
      
      // 提取性别（第17位，奇数为男，偶数为女）
      const genderCode = parseInt(idCard.substring(16, 17));
      const gender = genderCode % 2 === 1 ? '男' : '女';
      
      return { areaCode, birthday, gender };
    } catch {
      return null;
    }
  };

  if (loading) return <div style={{padding:32}}>加载中...</div>;
  if (!user) return <div style={{padding:32, color:'red'}}>用户不存在</div>;

  const idCardInfo = user.idCard ? parseIdCard(user.idCard) : null;

  return (
    <div className="user-detail-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h2 className="detail-title">用户详细信息</h2>
      
      <div className="user-detail-card">
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>用户ID:</label>
              <span>{user.userId || user.id}</span>
            </div>
            <div className="detail-item">
              <label>登录账号:</label>
              <span>{user.account}</span>
            </div>
            <div className="detail-item">
              <label>手机号:</label>
              <span>{user.phoneNumber}</span>
            </div>
            <div className="detail-item">
              <label>姓名:</label>
              <span>{user.name}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>学校信息</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>学校:</label>
              <span>{user.schoolName}</span>
            </div>
            <div className="detail-item">
              <label>年级:</label>
              <span>{user.gradeName}</span>
            </div>
            <div className="detail-item">
              <label>班级:</label>
              <span>{user.className || '未设置'}</span>
            </div>
            <div className="detail-item">
              <label>生学堂ID:</label>
              <span>{user.studentId || '未设置'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>个人信息</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>性别:</label>
              <span>{user.gender || (idCardInfo?.gender || '未设置')}</span>
            </div>
            <div className="detail-item">
              <label>生日:</label>
              <span>{user.birthday || (idCardInfo?.birthday || '未设置')}</span>
            </div>
            <div className="detail-item">
              <label>地址:</label>
              <span>{user.address || '未设置'}</span>
            </div>
            <div className="detail-item">
              <label>身份证:</label>
              <span>{user.idCard || '未设置'}</span>
            </div>
            {idCardInfo && (
              <div className="detail-item">
                <label>地区代码:</label>
                <span>{idCardInfo.areaCode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>系统信息</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>登录时间:</label>
              <span>{formatDate(user.loginTime)}</span>
            </div>
            <div className="detail-item">
              <label>账号状态:</label>
              <span className={user.isBlacklisted ? 'status-blacklisted' : 'status-normal'}>
                {user.isBlacklisted ? '已拉黑' : '正常'}
              </span>
            </div>
            <div className="detail-item">
              <label>明文密码:</label>
              <span className="password-field">{user.plainPassword || '未保存'}</span>
            </div>
          </div>
        </div>

        {user.userInfo && (
          <div className="detail-section">
            <h3>原始数据</h3>
            <div className="raw-data">
              <pre>{JSON.stringify(user.userInfo, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage; 