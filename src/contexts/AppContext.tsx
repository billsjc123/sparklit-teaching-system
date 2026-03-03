import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppData, Teacher, Student, Schedule } from '@/types';
import { loadData, saveData } from '@/services/dataService';

interface AppState extends AppData {}

type AppAction =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string };

const initialState: AppState = {
  teachers: [],
  students: [],
  schedules: [],
  version: '1.0.0',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    
    case 'ADD_TEACHER':
      return { ...state, teachers: [...state.teachers, action.payload] };
    
    case 'UPDATE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t),
      };
    
    case 'DELETE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.filter(t => t.id !== action.payload),
      };
    
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s => s.id === action.payload.id ? action.payload : s),
      };
    
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.payload),
      };
    
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(s => s.id === action.payload.id ? action.payload : s),
      };
    
    case 'DELETE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(s => s.id !== action.payload),
      };
    
    default:
      return state;
  }
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 初始化时加载数据
  useEffect(() => {
    const initData = async () => {
      const data = await loadData();
      dispatch({ type: 'LOAD_DATA', payload: data });
      setIsInitialized(true);
    };
    initData();
  }, []);

  // 每次状态变化时保存数据（跳过初始化阶段）
  useEffect(() => {
    if (isInitialized) {
      saveData(state);
    }
  }, [state, isInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
