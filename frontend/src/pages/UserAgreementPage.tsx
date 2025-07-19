import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserAgreementPage.css';

const UserAgreementPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="agreement-container">
      <button className="back-btn pretty-back" style={{marginBottom:8}} onClick={handleBack}>← 返回</button>
      <h1 className="agreement-title">用户与隐私协议</h1>
      
      <div className="agreement-content">
        <section>
          <h2>1. 服务说明</h2>
          <p>本系统是基于生学堂平台的成绩查询与分析工具，为用户提供便捷的成绩查看、分析和统计功能。本协议旨在明确用户使用本系统时的权利和义务，以及我们如何保护您的隐私。</p>
        </section>

        <section>
          <h2>2. 账号使用</h2>
          <p>2.1 本系统不具有账号注册功能，用户需确保已拥有有效的生学堂学生账号。</p>
          <p>2.2 用户应妥善保管自己的账号信息，不得将账号提供给他人使用。</p>
          <p>2.3 用户应对使用本账号进行的所有活动承担责任。</p>
          <p>2.4 如发现账号被盗用或异常登录，应立即联系客服处理。</p>
        </section>

        <section>
          <h2>3. 数据使用与隐私保护</h2>
          <p>3.1 本系统仅用于查询和分析用户本人的成绩数据。</p>
          <p>3.2 所有成绩数据来源于生学堂官方平台，本系统不承担数据准确性责任。</p>
          <p>3.3 用户数据仅存储在本地设备中，不会上传至第三方服务器。</p>
          <p>3.4 我们承诺不会收集、存储或传输用户的个人敏感信息。</p>
          <p>3.5 用户有权随时删除本地存储的数据。</p>
          <p>3.6 我们采用行业标准的安全措施保护用户数据。</p>
        </section>

        <section>
          <h2>4. 使用规范</h2>
          <p>4.1 用户应遵守相关法律法规，不得利用本系统进行违法活动。</p>
          <p>4.2 用户不得恶意攻击系统或干扰系统正常运行。</p>
          <p>4.3 用户应尊重知识产权，不得复制、传播本系统的技术内容。</p>
          <p>4.4 用户不得利用本系统进行商业用途或盈利活动。</p>
          <p>4.5 用户应文明使用，不得发布不当言论或内容。</p>
        </section>

        <section>
          <h2>5. 免责声明</h2>
          <p>5.1 本系统仅作为工具使用，不承担因使用本系统而产生的任何直接或间接损失。</p>
          <p>5.2 系统可能因网络、服务器等原因出现暂时性故障，用户应予以理解。</p>
          <p>5.3 本系统保留随时修改或终止服务的权利。</p>
          <p>5.4 因不可抗力因素导致的服务中断，本系统不承担责任。</p>
        </section>

        <section>
          <h2>6. 隐私政策</h2>
          <p>6.1 我们仅收集必要的用户信息用于系统功能实现。</p>
          <p>6.2 我们不会向第三方出售、出租或分享用户个人信息。</p>
          <p>6.3 用户有权了解我们收集的个人信息类型和用途。</p>
          <p>6.4 用户有权要求删除或更正不准确的个人信息。</p>
          <p>6.5 我们会在必要时更新隐私政策，并通过系统公告通知用户。</p>
        </section>

        <section>
          <h2>7. 联系方式</h2>
          <p>如有问题、建议或隐私相关投诉，请联系：yly.l@qq.com</p>
          <p>我们将在收到邮件后尽快回复处理。</p>
        </section>

        <section>
          <h2>8. 协议更新</h2>
          <p>8.1 本协议可能会不定期更新，更新后的协议将在系统中公布。</p>
          <p>8.2 继续使用本系统即表示接受更新后的协议。</p>
          <p>8.3 重大变更将通过系统公告或邮件方式通知用户。</p>
        </section>

        <div className="agreement-footer">
          <p>最后更新时间：2025年7月20日</p>
          <p>© 2025 狐三岁. 保留所有权利。</p>
        </div>
      </div>
    </div>
  );
};

export default UserAgreementPage; 