import { useState, useRef } from 'react';
import { Layout, Button, Dropdown, Checkbox } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { FireOutlined, MenuOutlined, HolderOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ToolMeta } from '../../types/tool';
import styles from './Sidebar.module.css';

interface SidebarProps {
  tools: ToolMeta[];
  visibility: Record<string, boolean>;
  onToggleToolVisibility: (toolId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const { Sider } = Layout;

export default function Sidebar({ tools, visibility, onToggleToolVisibility, onReorder }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = location.pathname.replace('/', '') || tools[0]?.id;

  // Drag state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 过滤出可见的工具
  const visibleTools = tools.filter((t) => visibility[t.id] ?? true);

  // View 菜单
  const viewMenuItems: MenuProps['items'] = [
    ...tools.map((tool) => ({
      key: tool.id,
      label: (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Checkbox
            checked={visibility[tool.id] ?? true}
            onChange={() => onToggleToolVisibility(tool.id)}
          />
          {tool.icon}
          <span>{tool.name}</span>
        </div>
      ),
    })),
    {
      type: 'divider' as const,
    },
    {
      key: 'show-all',
      label: '全部显示',
      onClick: () => {
        tools.forEach((tool) => {
          if (!visibility[tool.id]) {
            onToggleToolVisibility(tool.id);
          }
        });
      },
    },
    {
      key: 'hide-all',
      label: '全部隐藏',
      onClick: () => {
        tools.forEach((tool) => {
          if (visibility[tool.id]) {
            onToggleToolVisibility(tool.id);
          }
        });
      },
    },
  ];

  const handleDragStart = (e: React.DragEvent, visibleIdx: number) => {
    // Find the index in the full tools array
    const tool = visibleTools[visibleIdx];
    const fullIndex = tools.findIndex((t) => t.id === tool.id);
    dragIndexRef.current = fullIndex;
    e.dataTransfer.effectAllowed = 'move';
    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, visibleIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const tool = visibleTools[visibleIdx];
    const fullIndex = tools.findIndex((t) => t.id === tool.id);
    setDragOverIndex(fullIndex);
  };

  const handleDrop = (e: React.DragEvent, visibleIdx: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    const tool = visibleTools[visibleIdx];
    const to = tools.findIndex((t) => t.id === tool.id);
    if (from !== null && from !== to) {
      onReorder(from, to);
    }
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  return (
    <Sider width={200} className={styles.sider}>
      <div className={styles.logo}>
        <div className={styles.logoContent}>
          <FireOutlined className={styles.logoIcon} />
          <span className={styles.logoText}>Firewood</span>
        </div>
        <Dropdown
          menu={{ items: viewMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            size="small"
            icon={<MenuOutlined />}
            className={styles.viewButton}
          />
        </Dropdown>
      </div>
      <div className={styles.toolList}>
        {visibleTools.map((tool, visibleIdx) => {
          const fullIndex = tools.findIndex((t) => t.id === tool.id);
          const isSelected = tool.id === currentKey;
          const isDragOver = dragOverIndex === fullIndex;
          return (
            <div
              key={tool.id}
              className={`${styles.toolItem} ${isSelected ? styles.toolItemSelected : ''} ${isDragOver ? styles.toolItemDragOver : ''}`}
              draggable
              onClick={() => navigate(`/${tool.id}`)}
              onDragStart={(e) => handleDragStart(e, visibleIdx)}
              onDragOver={(e) => handleDragOver(e, visibleIdx)}
              onDrop={(e) => handleDrop(e, visibleIdx)}
              onDragEnd={handleDragEnd}
            >
              <HolderOutlined className={styles.dragHandle} />
              <span className={styles.toolIcon}>{tool.icon}</span>
              <span className={styles.toolName}>{tool.name}</span>
            </div>
          );
        })}
      </div>
    </Sider>
  );
}
