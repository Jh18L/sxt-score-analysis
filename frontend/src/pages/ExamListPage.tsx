import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamListPage.css';
import Copyright from '../components/Copyright';

const EXAM_LIST_URL = '/api/sxt-h5/api/gateway/exam/ExamQueryApi_pageForStudent';
const PAGE_SIZE = 10;

const ExamListPage: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    const fetchExams = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') || ''
        };
        const body = {
          isLoading: true,
          body: {
            pageableDto: { page, size: PAGE_SIZE },
            isObjective: false,
            semesterId: '',
            studentAccountId: userId,
            notNeedNceExam: false
          }
        };
        const res = await fetch(EXAM_LIST_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.code === 200 && data.success) {
          setExams(data.data.dataList || []);
          setTotalPage(data.data.totalPage || 1);
        } else {
          setError(data.message || '获取考试列表失败');
        }
      } catch {
        setError('网络错误或服务器无响应');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [navigate, page]);

  useEffect(() => {
    // 保存考试列表到localStorage
    if (exams.length > 0) {
      localStorage.setItem('examList', JSON.stringify(exams));
    }
  }, [exams]);

  const handleExamClick = (exam: any) => {
    navigate(`/exam/${exam.id}`);
  };

  // 返回按钮
  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate('/user');
  };

  return (
    <div className="exam-list-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h2 className="exam-list-title">考试列表</h2>
      {loading ? <div>加载中...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <>
          <div className="exam-card-list">
            {exams.map(exam => (
              <div className="exam-card" key={exam.id}>
                <div className="exam-card-header">
                  <div className="exam-card-title">{exam.name}</div>
                  <div className="exam-card-grade">{exam.gradeName}</div>
                </div>
                <div className="exam-card-info">
                  <div><b>开始时间：</b>{exam.startTime}</div>
                  <div><b>状态：</b>{exam.state === 7 ? <span style={{color:'#27ae60'}}>已发布</span> : <span style={{color:'#b3b3b3'}}>未发布</span>}</div>
                </div>
                <div className="exam-card-buttons">
                  <button className="exam-card-btn" onClick={()=>handleExamClick(exam)}>查看成绩</button>
                  <button className="exam-card-btn analysis-btn" onClick={()=>navigate(`/analysis/${exam.id}`)}>分析成绩</button>
                </div>
              </div>
            ))}
          </div>
          <div className="exam-list-pagination">
            <button disabled={page<=1} onClick={()=>setPage(page-1)}>上一页</button>
            <span>第 {page} / {totalPage} 页</span>
            <button disabled={page>=totalPage} onClick={()=>setPage(page+1)}>下一页</button>
          </div>
        </>
      )}
      <Copyright />
    </div>
  );
};

export default ExamListPage; 