import type { ReactNode, LazyExoticComponent, FC } from 'react';

export interface ToolMeta {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  component: LazyExoticComponent<FC>;
  visible?: boolean; // 默认为 true，可选字段
}
