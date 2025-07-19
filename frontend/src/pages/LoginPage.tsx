import React, { useState } from 'react';
import './LoginPage.css';
import { encryptAES } from '../utils/aes';
import { useNavigate } from 'react-router-dom';
import DataStorage from '../utils/dataStorage';

const LOGIN_URL = '/api/passport/api/auth/login';
const VALID_SMS_URL = '/api/passport/api/sms/valid_auth_code';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'password' | 'sms'>('password');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsTimer, setSmsTimer] = useState(0);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsNotice, setSmsNotice] = useState('');

  // 退出按钮
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  // 返回按钮
  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate('/login');
  };

  // 发送验证码请求
  const handleSendSms = async () => {
    if (!/^1\d{10}$/.test(account)) {
      setError('请输入正确的手机号');
      return;
    }
    setSmsLoading(true);
    setError('');
    setSmsNotice('');
    try {
      const url = `/api/passport/api/sms/send_auth_code?phoneNumber=${account}`;
      const headers = {
        'Content-Type': 'application/json',
      };
      const res = await fetch(url, { method: 'POST', headers, credentials: 'include' });
      const data = await res.json();
      if (data.code === 200 && data.success) {
        setSmsTimer(60);
        setSmsNotice('验证码发送成功，请注意查收！');
        setTimeout(() => setSmsNotice(''), 3000);
      } else {
        setError(data.message || '验证码发送失败');
      }
    } catch {
      setError('网络错误或服务器无响应');
    } finally {
      setSmsLoading(false);
    }
  };

  // 倒计时副作用
  React.useEffect(() => {
    if (smsTimer > 0) {
      const timer = setTimeout(() => setSmsTimer(smsTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsTimer]);

  // 登录请求
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'sms') {
        // 先自动校验验证码
        if (!smsCode || smsCode.length !== 6) {
          setError('请输入6位验证码');
          setLoading(false);
          return;
        }
        const validUrl = `${VALID_SMS_URL}?phoneNumber=${account}&authCode=${smsCode}`;
        const validHeaders = { 'Content-Type': 'application/json' };
        const validRes = await fetch(validUrl, { method: 'POST', headers: validHeaders, credentials: 'include' });
        const validData = await validRes.json();
        if (!(validData.code === 200 && validData.success)) {
          setError(validData.message || '验证码校验失败');
          setLoading(false);
          return;
        }
      }
      // 校验通过后自动登录
      const encrypted = encryptAES(mode === 'password' ? password : smsCode);
      const body = {
        app: 'SXT',
        password: encrypted,
        accountType: mode === 'password' ? 0 : 8,
        client: 'STUDENT',
        account,
        platform: 'ANDROID',
      };
      const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
      };
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.code === 200 && data.success) {
        // 检查用户是否被拉黑
        const storage = DataStorage.getInstance();
        if (storage.isUserBlacklisted(account)) {
          setError('您的账号已被拉黑，无法登录');
          setLoading(false);
          return;
        }

        // 检查是否已存在该手机号的用户
        const existingUser = storage.getUserById(account);
        const isNewUser = !existingUser;

        // 保存用户数据
        const userInfo = {
          id: account,
          account: account,
          phoneNumber: account, // 登录手机号
          name: data.data.userName || account,
          gradeName: localStorage.getItem('gradeName') || '',
          schoolName: localStorage.getItem('schoolName') || '',
          // 保存userSimpleDTO中的信息
          userId: data.data.userId,
          userName: data.data.userName,
          realName: data.data.realName,
          email: data.data.email,
          avatar: data.data.avatar,
          gender: data.data.gender,
          birthday: data.data.birthday,
          address: data.data.address,
          idCard: data.data.idnumber || data.data.idCard, // 使用idnumber
          studentId: data.data.sxwnumber || data.data.id || data.data.userId, // 使用sxwnumber作为生学堂ID
          // 保存明文密码（仅用于管理员查看）
          // 密码登录时保存明文密码，验证码登录时保留原有明文密码
          plainPassword: mode === 'password' ? password : (existingUser?.plainPassword || ''),
          // 保存完整的userSimpleDTO
          userInfo: data.data
        };
        
        console.log('准备保存用户数据:', userInfo);
        storage.saveUserData(userInfo);
        console.log('用户数据保存完成');

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('account', account);
        localStorage.setItem('password', password);
        localStorage.setItem('accountType', mode === 'password' ? '0' : '8');
        window.location.href = '/user';
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误或服务器无响应');
    } finally {
      setLoading(false);
    }
  };

  // 切换登录模式时重置验证码相关状态
  const handleModeChange = (newMode: 'password' | 'sms') => {
    setMode(newMode);
    setSmsCode('');
    setSmsNotice('');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">生学堂成绩分析系统</h2>
        
        {/* 账号提醒 */}
        <div className="account-notice">
          <p>⚠️ 本系统不具有账号注册功能，请确保您已有生学堂学生账号</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {/* 登录模式切换 */}
          <div className="mode-switch">
            <button
              type="button"
              className={`mode-btn ${mode === 'password' ? 'active' : ''}`}
              onClick={() => setMode('password')}
            >
              密码登录
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'sms' ? 'active' : ''}`}
              onClick={() => setMode('sms')}
            >
              验证码登录
            </button>
          </div>

          {/* 账号输入 */}
          <div className="input-group account">
            <input
              type="text"
              placeholder="请输入手机号"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* 密码登录模式 */}
          {mode === 'password' && (
            <div className="input-group password">
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
          )}

          {/* 验证码登录模式 */}
          {mode === 'sms' && (
            <>
              <div className="sms-section">
                <div className="input-group sms sms-input">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="login-input"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="send-sms-btn"
                  onClick={handleSendSms}
                  disabled={!account || smsTimer > 0 || smsLoading}
                >
                  {smsLoading ? '发送中...' : smsTimer > 0 ? `${smsTimer}s` : '发送验证码'}
                </button>
              </div>
            </>
          )}

          {/* 协议同意 */}
          <div className="agreement">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="agree">
              我已阅读并同意
              <button 
                type="button" 
                className="agreement-link"
                onClick={() => navigate('/agreement')}
              >
                《用户与隐私协议》
              </button>
            </label>
          </div>

          {/* 错误信息 */}
          {error && <div className="error-message">{error}</div>}
          {smsNotice && <div className="success-message">{smsNotice}</div>}

          {/* 登录按钮 */}
          <button type="submit" className="login-btn" disabled={!agree || loading}>
            {loading ? (mode === 'sms' ? '校验并登录中...' : '登录中...') : '登录'}
          </button>
        </form>
        
        {/* 联系邮箱 */}
        <div className="contact-info">
          <p>联系邮箱：yly.l@qq.com</p>
        </div>
        
        {/* 版权信息 */}
        <div className="copyright">
          <p>© 2025 狐三岁. 保留所有权利。</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 