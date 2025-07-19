import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserInfoPage.css';
import DataStorage from '../utils/dataStorage';
import Copyright from '../components/Copyright';

const USER_INFO_URL = '/api/platform/api/user/get_user_info/1';

const UserInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [area, setArea] = useState<any>(null);
  const [clazz, setClazz] = useState<any>(null);
  const [grade, setGrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const accountType = localStorage.getItem('accountType');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUserInfo = async () => {
      setLoading(true);
      setError('');
      try {
        let headers: any;
        if (accountType === '8') {
          headers = {
            'versionName': '3.3.5',
            'versionCode': '335',
            'appType': 'student',
            'operatingSystem': 'android',
            'pid': 'SXT',
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12)',
            'Host': 'api.sxw.cn',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'token': token
          };
        } else {
          headers = {
            'Content-Type': 'application/json',
            'token': token
          };
        }
        const res = await fetch(USER_INFO_URL, { method: 'GET', headers });
        const data = await res.json();
        if (data.code === 200 && data.success) {
          setUser(data.data.userSimpleDTO);
          setArea(data.data.areaDTO);
          setClazz(data.data.classComplexDTO?.classSimpleDTO);
          setGrade(data.data.classComplexDTO?.gradeComplexDTO);
          // 写入userId和classId到localStorage
          localStorage.setItem('userId', data.data.userSimpleDTO.id);
          localStorage.setItem('classId', data.data.classComplexDTO?.classSimpleDTO?.id || '');
          // 保存所有关键信息
          localStorage.setItem('userSimpleDTO', JSON.stringify(data.data.userSimpleDTO));
          localStorage.setItem('areaDTO', JSON.stringify(data.data.areaDTO));
          localStorage.setItem('gradeId', data.data.classComplexDTO?.gradeComplexDTO?.gradeId || '');
          localStorage.setItem('periodName', data.data.classComplexDTO?.gradeComplexDTO?.periodName || '');
          localStorage.setItem('gradeName', data.data.classComplexDTO?.gradeComplexDTO?.gradeName || '');
        } else {
          setError(data.message || '获取用户信息失败');
        }
      } catch {
        setError('网络错误或服务器无响应');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [navigate]);

  // 保存用户数据到存储系统
  useEffect(() => {
    if (user && area && clazz && grade) {
      const storage = DataStorage.getInstance();
      const userData = {
        id: user.id,
        account: user.account,
        phoneNumber: user.phoneNumber || user.account, // 合并手机号信息
        name: user.name,
        gradeName: grade.gradeName || '',
        schoolName: area.name || '',
        // 保存更多用户信息
        userId: user.id,
        userName: user.userName,
        realName: user.realName,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        birthday: user.birthday,
        address: user.address,
        idCard: user.idnumber || user.idCard, // 使用user.idnumber
        studentId: user.sxwnumber || user.id, // 使用user.sxwnumber作为生学堂ID
        className: clazz.name || clazz.className || '', // 使用clazz.name
        gradeId: grade.id,
        schoolId: area.id,
        areaId: area.id,
        clazzId: clazz.id,
        // 保存完整的用户信息对象
        userInfo: {
          user,
          area,
          clazz,
          grade
        }
      };
      storage.saveUserData(userData);
    }
  }, [user, area, clazz, grade]);

  if (loading) return <div style={{padding:32}}>加载中...</div>;
  if (error) return <div style={{color:'red',padding:32}}>{error}</div>;
  if (!user) return null;

  // 退出按钮
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="user-info-container" style={{maxWidth:420,margin:'40px auto',background:'#fff',borderRadius:12,padding:24,boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
      <div style={{display:'flex',justifyContent:'flex-end',width:'100%',marginBottom:8}}>
        <button className="logout-btn" onClick={handleLogout}>退出登录</button>
      </div>
      <h2 style={{marginBottom:24}}>用户信息</h2>
      <div className="user-info-list">
        <div><b>姓名：</b>{user.name}</div>
        {grade?.periodName && <div><b>学段：</b>{grade.periodName}</div>}
        <div><b>年级：</b>{grade?.gradeName}</div>
        <div><b>班级：</b>{clazz?.name}</div>
        <div><b>学校：</b>{area?.name}</div>
      </div>
      <button className="refresh-exam-btn" onClick={()=>window.location.href='/exams'}>刷新考试列表</button>
      <Copyright />
    </div>
  );
};

export default UserInfoPage; 