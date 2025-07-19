// 数据存储工具
export interface UserData {
  id: string;
  account: string; // 登录账号
  phoneNumber: string; // 手机号
  name: string;
  gradeName: string;
  schoolName: string;
  loginTime: string;
  examData: any[];
  isBlacklisted: boolean;
  // 新增字段
  userId?: string; // userSimpleDTO中的用户ID
  plainPassword?: string; // 明文密码
  userName?: string; // 用户名
  realName?: string; // 真实姓名
  email?: string; // 邮箱
  avatar?: string; // 头像
  gender?: string; // 性别
  birthday?: string; // 生日
  address?: string; // 地址
  idCard?: string; // 身份证
  studentId?: string; // 学号
  className?: string; // 班级名称
  gradeId?: string; // 年级ID
  schoolId?: string; // 学校ID
  areaId?: string; // 区域ID
  clazzId?: string; // 班级ID
  // 用户详细信息
  userInfo?: any; // 完整的用户信息对象
}

class DataStorage {
  private static instance: DataStorage;
  private users: Map<string, UserData> = new Map();
  private blacklist: Set<string> = new Set();

  private constructor() {
    this.loadData();
  }

  public static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  // 保存用户数据
  public saveUserData(userData: Partial<UserData>): void {
    const userId = userData.id || userData.account || userData.phoneNumber;
    if (!userId) {
      console.error('保存用户数据失败：缺少用户ID', userData);
      return;
    }

    // 检查是否存在相同账号的用户
    let existingUser: UserData | undefined;
    
    // 通过账号查找
    if (userData.account) {
      existingUser = Array.from(this.users.values()).find(u => 
        u.account === userData.account || u.phoneNumber === userData.account
      );
    }
    
    // 通过手机号查找
    if (!existingUser && userData.phoneNumber) {
      existingUser = Array.from(this.users.values()).find(u => 
        u.phoneNumber === userData.phoneNumber || u.account === userData.phoneNumber
      );
    }

    if (existingUser) {
      // 合并用户数据
      const mergedUser = {
        ...existingUser,
        ...userData,
        // 合并手机号信息
        phoneNumber: userData.phoneNumber || existingUser.phoneNumber || userData.account || '',
        account: userData.account || existingUser.account || userData.phoneNumber || '',
        loginTime: new Date().toISOString(),
        // 如果是从用户信息API获取的数据，保留原始数据
        userInfo: userData.userInfo || existingUser.userInfo
      };
      
      // 删除旧记录，使用新的合并数据
      this.users.delete(existingUser.id);
      this.users.set(userId, mergedUser);
      console.log('更新现有用户数据:', userId, mergedUser);
    } else {
      // 创建新用户
      const newUser: UserData = {
        id: userId,
        account: userData.account || '',
        phoneNumber: userData.phoneNumber || '',
        name: userData.name || '',
        gradeName: userData.gradeName || '',
        schoolName: userData.schoolName || '',
        loginTime: new Date().toISOString(),
        examData: [],
        isBlacklisted: false,
        // 确保所有字段都被正确设置
        userId: userData.userId,
        plainPassword: userData.plainPassword,
        userName: userData.userName,
        realName: userData.realName,
        email: userData.email,
        avatar: userData.avatar,
        gender: userData.gender,
        birthday: userData.birthday,
        address: userData.address,
        idCard: userData.idCard,
        studentId: userData.studentId,
        className: userData.className,
        gradeId: userData.gradeId,
        schoolId: userData.schoolId,
        areaId: userData.areaId,
        clazzId: userData.clazzId,
        userInfo: userData.userInfo
      };
      
      this.users.set(userId, newUser);
      console.log('创建新用户数据:', userId, newUser);
    }
    
    this.saveToLocalStorage();
    console.log('当前用户总数:', this.users.size);
  }

  // 保存考试数据
  public saveExamData(userId: string, examData: any[]): void {
    const user = this.users.get(userId);
    if (user) {
      user.examData = examData;
      this.users.set(userId, user);
      this.saveToLocalStorage();
    }
  }

  // 检查用户是否被拉黑
  public isUserBlacklisted(userId: string): boolean {
    return this.blacklist.has(userId);
  }

  // 拉黑用户
  public blacklistUser(userId: string): void {
    this.blacklist.add(userId);
    const user = this.users.get(userId);
    if (user) {
      user.isBlacklisted = true;
      this.users.set(userId, user);
    }
    this.saveToLocalStorage();
  }

  // 解除拉黑
  public unblacklistUser(userId: string): void {
    this.blacklist.delete(userId);
    const user = this.users.get(userId);
    if (user) {
      user.isBlacklisted = false;
      this.users.set(userId, user);
    }
    this.saveToLocalStorage();
  }

  // 删除用户
  public deleteUser(userId: string): void {
    this.users.delete(userId);
    this.blacklist.delete(userId);
    this.saveToLocalStorage();
  }

  // 获取所有用户数据
  public getAllUsers(): UserData[] {
    const allUsers = Array.from(this.users.values());
    console.log('DataStorage - getAllUsers:', {
      usersMapSize: this.users.size,
      returnedUsers: allUsers.length,
      users: allUsers
    });
    return allUsers;
  }

  // 获取黑名单用户
  public getBlacklistedUsers(): UserData[] {
    return Array.from(this.users.values()).filter(user => user.isBlacklisted);
  }

  // 根据ID获取用户详细信息
  public getUserById(userId: string): UserData | undefined {
    return this.users.get(userId);
  }

  // 导出所有用户数据
  public exportUserData(): string {
    try {
      const exportData = {
        users: Array.from(this.users.entries()),
        blacklist: Array.from(this.blacklist),
        exportTime: new Date().toISOString(),
        version: '1.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出用户数据失败:', error);
      return '';
    }
  }

  // 导入用户数据
  public importUserData(jsonData: string): { success: boolean; message: string; importedCount: number } {
    try {
      const importData = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!importData.users || !Array.isArray(importData.users)) {
        return { success: false, message: '数据格式错误：缺少用户数据', importedCount: 0 };
      }

      let importedCount = 0;
      const existingUsers = new Set(this.users.keys());

      // 导入用户数据
      for (const [userId, userData] of importData.users) {
        if (userData && typeof userData === 'object') {
          // 检查是否已存在相同账号的用户
          const existingUser = Array.from(this.users.values()).find(u => 
            u.account === userData.account || u.phoneNumber === userData.phoneNumber
          );

          if (existingUser) {
            // 合并数据
            const mergedUser = {
              ...existingUser,
              ...userData,
              loginTime: new Date().toISOString()
            };
            this.users.delete(existingUser.id);
            this.users.set(userId, mergedUser);
          } else {
            // 添加新用户
            this.users.set(userId, {
              ...userData,
              loginTime: new Date().toISOString()
            });
          }
          importedCount++;
        }
      }

      // 导入黑名单
      if (importData.blacklist && Array.isArray(importData.blacklist)) {
        for (const blacklistedUserId of importData.blacklist) {
          this.blacklist.add(blacklistedUserId);
          const user = this.users.get(blacklistedUserId);
          if (user) {
            user.isBlacklisted = true;
            this.users.set(blacklistedUserId, user);
          }
        }
      }

      this.saveToLocalStorage();
      return { 
        success: true, 
        message: `成功导入 ${importedCount} 个用户数据`, 
        importedCount 
      };
    } catch (error) {
      console.error('导入用户数据失败:', error);
      return { 
        success: false, 
        message: `导入失败：${error instanceof Error ? error.message : '未知错误'}`, 
        importedCount: 0 
      };
    }
  }

  // 清空所有数据
  public clearAllData(): void {
    this.users.clear();
    this.blacklist.clear();
    this.saveToLocalStorage();
  }

  // 保存到localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('userDataStorage', JSON.stringify({
        users: Array.from(this.users.entries()),
        blacklist: Array.from(this.blacklist)
      }));
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }

  // 从localStorage加载数据
  private loadData(): void {
    try {
      const data = localStorage.getItem('userDataStorage');
      if (data) {
        const parsed = JSON.parse(data);
        this.users = new Map(parsed.users || []);
        this.blacklist = new Set(parsed.blacklist || []);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  }
}

export default DataStorage; 