import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './QuestionDetailPage.css';

const QUESTION_URL = '/api/sxt-h5/api/gateway/analysis/AnalysisMobileStudentApi_findStudentQuestion';

const QuestionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId, courseId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const classId = localStorage.getItem('classId');
    if (!token || !userId || !classId || !courseId) {
      navigate('/login');
      return;
    }
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || ''
        };
        const body = {
          isLoading: true,
          classId,
          studentId: userId,
          examCourseId: courseId,
          courseChooseTrend: 1
        };
        const res = await fetch(QUESTION_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.code === 200 && data.success) {
          setQuestions(data.data || []);
        } else {
          setError(data.message || '获取小题得分失败');
        }
      } catch {
        setError('网络错误或服务器无响应');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate, courseId]);

  // 返回按钮
  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate(`/exam/${examId}`);
  };

  if (loading) return <div style={{padding:32}}>加载中...</div>;
  if (error) return <div style={{color:'red',padding:32}}>{error}</div>;
  if (!questions.length) return <div style={{padding:32}}>暂无小题得分数据</div>;

  return (
    <div className="question-detail-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h2 className="question-detail-title">小题得分明细</h2>
      <div className="question-table-wrapper">
        <table className="question-table">
          <thead>
            <tr>
              <th>题号</th>
              <th>知识点</th>
              <th>能力</th>
              <th>得分</th>
              <th>满分</th>
              <th>本班占比</th>
              <th>本校占比</th>
              <th>全市占比</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={q.questionId} className={idx%2===0 ? 'even-row' : 'odd-row'}>
                <td className="question-no">{q.questionNo}</td>
                <td className="question-point">{q.pointName}</td>
                <td className="question-ability">{q.abilityName}</td>
                <td className="question-score">{q.score}</td>
                <td className="question-total">{q.totalScore}</td>
                <td className="question-ratio class-ratio">{q.classRatio ? (q.classRatio*100).toFixed(2)+'%' : '-'}</td>
                <td className="question-ratio school-ratio">{q.schoolRatio ? (q.schoolRatio*100).toFixed(2)+'%' : '-'}</td>
                <td className="question-ratio city-ratio">{q.cityRatio ? (q.cityRatio*100).toFixed(2)+'%' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="question-summary">
        <div className="summary-item">
          <span className="summary-label">总题数：</span>
          <span className="summary-value">{questions.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">总得分：</span>
          <span className="summary-value">{questions.reduce((sum, q) => sum + q.score, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">总满分：</span>
          <span className="summary-value">{questions.reduce((sum, q) => sum + q.totalScore, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage; 