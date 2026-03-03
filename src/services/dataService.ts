import { AppData } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// 使用相对路径，生产环境通过 Nginx 反向代理访问
const API_URL = '/api';
const STORAGE_KEY = 'teaching-system-data';
const BACKUP_REMINDER_KEY = 'teaching-system-backup-reminder';
const VERSION = '1.0.0';

const getDefaultData = (): AppData => ({
  teachers: [],
  students: [],
  schedules: [],
  version: VERSION,
});

// 从服务器加载数据
export const loadData = async (): Promise<AppData> => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) {
      throw new Error('无法连接到数据服务器');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('从服务器加载数据失败，尝试从localStorage加载:', error);
    // 如果服务器不可用，尝试从localStorage加载
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
    return getDefaultData();
  }
};

// 保存数据到服务器
export const saveData = async (data: AppData): Promise<void> => {
  const dataToSave = {
    ...data,
    version: VERSION,
  };
  
  try {
    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSave),
    });
    
    if (!response.ok) {
      throw new Error('保存到服务器失败');
    }
    
    // 同时保存到localStorage作为备份
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('✅ 数据已保存到服务器和本地缓存');
  } catch (error) {
    console.error('保存到服务器失败，仅保存到localStorage:', error);
    // 如果服务器不可用，至少保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }
};

export const clearData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportData = async (data: AppData): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  const zip = new JSZip();

  // 添加完整数据
  zip.file('complete-data.json', JSON.stringify(data, null, 2));

  // 分别添加各个模块的数据
  zip.file('teachers.json', JSON.stringify(data.teachers, null, 2));
  zip.file('students.json', JSON.stringify(data.students, null, 2));
  zip.file('schedules.json', JSON.stringify(data.schedules, null, 2));

  // 添加备份信息
  const backupInfo = {
    backupTime: new Date().toISOString(),
    version: data.version,
    teacherCount: data.teachers.length,
    studentCount: data.students.length,
    scheduleCount: data.schedules.length,
  };
  zip.file('backup-info.txt', 
    `教学管理系统数据备份\n` +
    `备份时间：${backupInfo.backupTime}\n` +
    `系统版本：${backupInfo.version}\n` +
    `教师数量：${backupInfo.teacherCount}\n` +
    `学生数量：${backupInfo.studentCount}\n` +
    `课程数量：${backupInfo.scheduleCount}\n`
  );

  // 生成并下载 ZIP 文件
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `teaching-system-backup-${timestamp}.zip`);
  
  updateBackupReminder();
};

export const importData = (callback: (data: AppData) => void): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip,.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.zip')) {
        // 处理 ZIP 文件
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // 尝试读取 complete-data.json
        const completeDataFile = zipContent.file('complete-data.json');
        if (!completeDataFile) {
          alert('ZIP 文件中未找到 complete-data.json');
          return;
        }
        
        const text = await completeDataFile.async('text');
        const data = JSON.parse(text) as AppData;
        callback(data);
      } else {
        // 处理 JSON 文件
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const data = JSON.parse(text) as AppData;
          callback(data);
        };
        reader.onerror = () => {
          alert('文件读取失败');
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('数据导入失败，请检查文件格式');
    }
  };
  input.click();
};

export const getLastBackupDate = (): Date | null => {
  const stored = localStorage.getItem(BACKUP_REMINDER_KEY);
  return stored ? new Date(stored) : null;
};

export const updateBackupReminder = (): void => {
  localStorage.setItem(BACKUP_REMINDER_KEY, new Date().toISOString());
};

export const shouldShowBackupReminder = (): boolean => {
  const lastBackup = getLastBackupDate();
  if (!lastBackup) return true;
  
  const daysSinceBackup = Math.floor((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceBackup >= 7;
};
