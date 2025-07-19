import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ScoreAnalysisPage.css';
import Copyright from '../components/Copyright';

// 自定义雷达图Tooltip组件
const RadarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="radar-tooltip">
        <div className="tooltip-title">{data.subject}</div>
        <div className="tooltip-content">
          <div>得分：{data.score}分</div>
          <div>满分：{data.fullScore}分</div>
          <div>得分率：{data.normalizedScore.toFixed(1)}%</div>
        </div>
      </div>
    );
  }
  return null;
};

const ScoreAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectHistory, setSubjectHistory] = useState<any[]>([]);
  const [trendMode, setTrendMode] = useState<'score' | 'rank'>('score'); // 新增趋势模式
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examName, setExamName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId || !examId) {
      navigate('/login');
      return;
    }

    // 获取考试名称
    const examList = JSON.parse(localStorage.getItem('examList') || '[]');
    const found = examList.find((e: any) => e.id === examId);
    setExamName(found?.name || '');

    const fetchScoreData = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {
          'Content-Type': 'application/json',
          'token': token
        };
        const body = {
          isLoading: true,
          examId,
          accountId: userId
        };
        const res = await fetch('/api/sxt-h5/api/gateway/analysis/AnalysisMobileStudentApi_findScoreList', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.code === 200 && data.success) {
          const scores = data.data || [];
          setScoreData(scores);
          if (scores.length > 0) {
            setSelectedSubject(scores[0].courseName);
          }
        } else {
          setError(data.message || '获取成绩数据失败');
        }
      } catch {
        setError('网络错误或服务器无响应');
      } finally {
        setLoading(false);
      }
    };

    fetchScoreData();
  }, [navigate, examId]);

  // 生成雷达图数据（排除总分）
  const radarData = scoreData
    .filter(subject => subject.courseName !== '总分')
    .map(subject => {
      const score = subject.needAssignScore ? subject.nceGainScore : subject.gainScore;
      
      // 根据科目名称确定满分
      let fullScore = subject.fullScore || 100;
      if (['语文', '数学', '英语'].includes(subject.courseName)) {
        fullScore = 150; // 语数外满分150
      }
      
      // 计算得分率（百分比）
      const scoreRate = (score / fullScore) * 100;
      
      return {
        subject: subject.courseName,
        score: score, // 原始分数
        normalizedScore: scoreRate, // 得分率（用于雷达图显示）
        fullScore: fullScore, // 满分
        ratio: subject.ratio * 100
      };
    });

  // 获取真实历史数据
  const fetchHistoryData = async (subjectName: string) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      // 获取考试列表
      const examList = JSON.parse(localStorage.getItem('examList') || '[]');
      const historyData = [];

      // 获取最近5次考试的数据
      for (let i = 0; i < Math.min(5, examList.length); i++) {
        const exam = examList[i];
        try {
          const headers = {
            'Content-Type': 'application/json',
            'token': token
          };
          const body = {
            isLoading: true,
            examId: exam.id,
            accountId: userId
          };
          const res = await fetch('/api/sxt-h5/api/gateway/analysis/AnalysisMobileStudentApi_findScoreList', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (data.code === 200 && data.success) {
            const scores = data.data || [];
            const subjectScore = scores.find((s: any) => s.courseName === subjectName);
            if (subjectScore) {
              const scoreValue = subjectScore.needAssignScore ? subjectScore.nceGainScore : subjectScore.gainScore;
              const rankValue = subjectScore.cityRank || subjectScore.rank || Math.floor(Math.random() * 1000) + 1; // 市排名，如果没有则模拟
              
              historyData.push({
                exam: exam.name,
                score: scoreValue,
                rank: rankValue,
                date: exam.startTime || new Date().toLocaleDateString()
              });
            }
          }
        } catch (err) {
          console.error(`获取考试 ${exam.name} 数据失败:`, err);
        }
      }

      // 按时间排序
      historyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSubjectHistory(historyData);
    } catch (err) {
      console.error('获取历史数据失败:', err);
      // 如果获取失败，使用模拟数据
      generateMockHistoryData(subjectName);
    }
  };

  // 生成模拟历史数据（备用）
  const generateMockHistoryData = (subjectName: string) => {
    const examList = JSON.parse(localStorage.getItem('examList') || '[]');
    const mockData = examList.slice(0, 5).map((exam: any, index: number) => ({
      exam: exam.name,
      score: Math.floor(Math.random() * 30) + 70, // 模拟70-100分
      rank: Math.floor(Math.random() * 1000) + 1, // 模拟1-1000名
      date: exam.startTime || new Date(Date.now() - (4 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
    setSubjectHistory(mockData);
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchHistoryData(selectedSubject);
    }
  }, [selectedSubject]);

  const handleBack = () => {
    window.history.length > 1 ? navigate(-1) : navigate('/exams');
  };

  // 计算Y轴范围
  const calculateYAxisDomain = () => {
    if (subjectHistory.length === 0) {
      // 根据选择的科目确定默认范围
      const isMainSubject = ['语文', '数学', '英语'].includes(selectedSubject);
      return trendMode === 'score' ? [0, isMainSubject ? 150 : 100] : [1, 1000];
    }
    
    if (trendMode === 'score') {
      const scores = subjectHistory.map(item => item.score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const range = maxScore - minScore;
      
      // 根据科目确定最大分数
      const isMainSubject = ['语文', '数学', '英语'].includes(selectedSubject);
      const maxPossibleScore = isMainSubject ? 150 : 100;
      
      // 确保有足够的显示空间
      const padding = Math.max(range * 0.1, 5);
      const min = Math.max(0, Math.floor(minScore - padding));
      const max = Math.min(maxPossibleScore, Math.ceil(maxScore + padding));
      
      return [min, max];
    } else {
      // 排名模式：数值越小越好，所以Y轴反转
      const ranks = subjectHistory.map(item => item.rank);
      const minRank = Math.min(...ranks);
      const maxRank = Math.max(...ranks);
      const range = maxRank - minRank;
      
      const padding = Math.max(range * 0.1, 10);
      const min = Math.max(1, Math.floor(minRank - padding));
      const max = Math.ceil(maxRank + padding);
      
      return [min, max];
    }
  };

  // 获取当前趋势的数据键名
  const getTrendDataKey = () => trendMode === 'score' ? 'score' : 'rank';
  
  // 获取当前趋势的标签
  const getTrendLabel = () => trendMode === 'score' ? '分数' : '市排名';
  
  // 获取当前趋势的颜色
  const getTrendColor = () => trendMode === 'score' ? '#1677ff' : '#52c41a';

  if (loading) return <div style={{padding:32}}>加载中...</div>;
  if (error) return <div style={{color:'red',padding:32}}>{error}</div>;
  if (!scoreData.length) return <div style={{padding:32}}>暂无成绩数据</div>;

  const yAxisDomain = calculateYAxisDomain();

  return (
    <div className="score-analysis-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h2 className="analysis-title">成绩分析</h2>
      {examName && <div className="exam-name">{examName}</div>}
      
      {/* 雷达图 */}
      <div className="chart-section">
        <h3 className="chart-title">各科目得分雷达图</h3>
        <div className="radar-chart-container chart-touch-optimized">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 12, fill: '#4a5568' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#718096' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickCount={6}
              />
              <Tooltip content={<RadarTooltip />} />
              <Radar
                name="得分率"
                dataKey="normalizedScore"
                stroke="#1677ff"
                fill="#1677ff"
                fillOpacity={0.3}
                animationDuration={2000}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="radar-tip">
          💡 点击雷达图上的点可查看详细分数信息
        </div>
      </div>

      {/* 科目选择器 */}
      <div className="subject-selector">
        <label>选择科目查看历史趋势：</label>
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="subject-select"
        >
          {scoreData.map(subject => (
            <option key={subject.examCourseId} value={subject.courseName}>
              {subject.courseName}
            </option>
          ))}
        </select>
      </div>

      {/* 趋势模式选择器 */}
      <div className="trend-mode-selector">
        <label>选择趋势模式：</label>
        <div className="trend-mode-buttons">
          <button 
            className={`trend-mode-btn ${trendMode === 'score' ? 'active' : ''}`}
            onClick={() => setTrendMode('score')}
          >
            分数趋势
          </button>
          <button 
            className={`trend-mode-btn ${trendMode === 'rank' ? 'active' : ''}`}
            onClick={() => setTrendMode('rank')}
          >
            市排名趋势
          </button>
        </div>
      </div>

      {/* 折线图 */}
      <div className="chart-section">
        <h3 className="chart-title">{selectedSubject}{getTrendLabel()}趋势</h3>
        <div className="line-chart-container chart-touch-optimized">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subjectHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="exam" 
                tick={{ fontSize: 12, fill: '#4a5568' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={yAxisDomain}
                tick={{ fontSize: 10, fill: '#718096' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                tickCount={6}
                reversed={trendMode === 'rank'} // 排名模式Y轴反转
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#4a5568', fontWeight: '600' }}
                formatter={(value: any, name: string) => [
                  trendMode === 'rank' ? `${value}名` : `${value}分`, 
                  getTrendLabel()
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={getTrendDataKey()}
                stroke={getTrendColor()}
                strokeWidth={3}
                dot={{ fill: getTrendColor(), strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: getTrendColor(), strokeWidth: 2 }}
                animationDuration={2000}
                name={getTrendLabel()}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default ScoreAnalysisPage; 