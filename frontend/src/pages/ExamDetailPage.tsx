import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ExamDetailPage.css';

const SCORE_URL = '/api/sxt-h5/api/gateway/analysis/AnalysisMobileStudentApi_findScoreList';

const ExamDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examName, setExamName] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // 获取考试名称（从localStorage或URL参数等）
    const examList = JSON.parse(localStorage.getItem('examList') || '[]');
    const found = examList.find((e:any) => e.id === examId);
    setExamName(found?.name || '');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId || !examId) {
      navigate('/login');
      return;
    }
    const fetchScore = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || ''
        };
        const body = {
          isLoading: true,
          examId,
          accountId: userId
        };
        const res = await fetch(SCORE_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.code === 200 && data.success) {
          setScoreData(data.data || []);
        } else {
          setError(data.message || '获取成绩失败');
        }
      } catch {
        setError('网络错误或服务器无响应');
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('userSimpleDTO') || 'null');
    const gradeName = localStorage.getItem('gradeName') || '';
    const periodName = localStorage.getItem('periodName') || '';
    const areaDTO = JSON.parse(localStorage.getItem('areaDTO') || 'null');
    setUserInfo(user ? { 
      ...user, 
      gradeName, 
      periodName,
      schoolName: areaDTO?.name || '未知'
    } : null);
  }, [navigate, examId]);

  // 计算等级
  function getGradeLevel(score: number, details: any[]) {
    if (!details || details.length === 0) return '';
    const sortedLines = [...details].sort((a, b) => b.lineScore - a.lineScore);
    for (const line of sortedLines) {
      if (score >= line.lineScore) return line.lineName;
    }
    return 'Y';
  }

  // 返回按钮
  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate('/exams');
  };

  if (loading) return <div style={{padding:32}}>加载中...</div>;
  if (error) return <div style={{color:'red',padding:32}}>{error}</div>;
  if (!scoreData.length) return <div style={{padding:32}}>暂无成绩数据</div>;

  return (
    <div className="exam-detail-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <div className="exam-detail-header">
        <h2 className="exam-detail-title">成绩单</h2>
      </div>
      <div className="score-sheet-area">
        {examName && <div className="exam-name">{examName}</div>}
        {userInfo && (
          <div className="user-info-on-score">
            <span><b>姓名：</b>{userInfo.name}</span>
            <span><b>年级：</b>{userInfo.gradeName}</span>
            <span><b>学校：</b>{userInfo.schoolName || '未知'}</span>
          </div>
        )}
        <div className="score-table-wrapper">
          <table className="score-table">
            <thead>
              <tr>
                <th>科目</th>
                <th>分数</th>
                <th>等级</th>
                <th>全市排名</th>
                <th>区排名</th>
                <th>学校排名</th>
                <th>班级排名</th>
                <th>市占比</th>
                <th>区占比</th>
                <th>校占比</th>
                <th>分数线</th>
              </tr>
            </thead>
            <tbody>
              {scoreData.map(subject => {
                const hasAssignedScore = subject.needAssignScore;
                const finalScore = hasAssignedScore ? subject.nceGainScore : subject.gainScore;
                const rawScoreDisplay = hasAssignedScore ? `（原始分：${subject.gainScore}）` : '';
                const gradeLevel = getGradeLevel(finalScore, subject.details);
                // 交换T与A0颜色
                const gradeColor = gradeLevel === 'A0' ? '#27ae60' : gradeLevel === 'A' ? '#1677ff' : gradeLevel === 'T' ? '#e67e22' : gradeLevel === 'B' ? '#8e44ad' : gradeLevel === 'Y' ? '#c0392b' : '#333';
                return (
                  <tr key={subject.examCourseId}>
                    <td>
                      <span 
                        className="course-name-link" 
                        onClick={()=>navigate(`/exam/${examId}/${subject.examCourseId}`)}
                      >
                        {subject.courseName}
                      </span>
                    </td>
                    <td style={{fontWeight:600}}>{finalScore}{rawScoreDisplay}</td>
                    <td><span style={{color:gradeColor,fontWeight:700}}>{gradeLevel}</span></td>
                    <td>{subject.rank}</td>
                    <td>{subject.countyRank}</td>
                    <td>{subject.schoolRank}</td>
                    <td>{subject.classRank}</td>
                    <td>{(subject.ratio*100).toFixed(2)}%<br/><span className="score-table-hint">（推测参考人数：{subject.ratio && subject.rank ? Math.round(subject.rank/(1-subject.ratio)).toLocaleString() : '-'}人）</span></td>
                    <td>{(subject.countyRatio*100).toFixed(2)}%<br/><span className="score-table-hint">（推测参考人数：{subject.countyRatio && subject.countyRank ? Math.round(subject.countyRank/(1-subject.countyRatio)).toLocaleString() : '-'}人）</span></td>
                    <td>{(subject.schoolRatio*100).toFixed(2)}%</td>
                    <td>{subject.details?.map((line:any)=>(<div key={line.lineId}><span style={{fontWeight:600}}>{line.lineName}</span> <span style={{color:'#1677ff'}}>{line.lineScore}分</span>（{line.scoreLineNum}人）</div>))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="score-level-desc">
          <b>成绩等级说明：</b>
          <span><b style={{color:'#27ae60'}}>A0</b> 顶尖水平（前5%）</span>
          <span><b style={{color:'#1677ff'}}>A</b> 优秀水平（前15%）</span>
          <span><b style={{color:'#e67e22'}}>T</b> 特控线</span>
          <span><b style={{color:'#8e44ad'}}>B</b> 本科线</span>
          <span><b style={{color:'#c0392b'}}>Y</b> 预警线</span>
        </div>
        <div className="score-tip">
          💡 点击科目名称可查看详细的小题得分情况
        </div>
        <div className="score-time">
          信息获取时间：{new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ExamDetailPage; 