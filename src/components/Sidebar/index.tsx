import { Layout, Menu, Button, Dropdown, Checkbox } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { FireOutlined, MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import tools from '../../router/tools';
import styles from './Sidebar.module.css';

interface SidebarProps {
  visibility: Record<string, boolean>;
  onToggleToolVisibility: (toolId: string) => void;
}

const { Sider } = Layout;

export default function Sidebar({ visibility, onToggleToolVisibility }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = location.pathname.replace('/', '') || tools[0].id;

  // 过滤出可见的工具
  const visibleTools = tools.filter((t) => visibility[t.id] ?? true);

  const menuItems = visibleTools.map((t) => ({
    key: t.id,
    icon: t.icon,
    label: t.name,
  }));

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
      <Menu
        mode="inline"
        selectedKeys={[currentKey]}
        items={menuItems}
        onClick={({ key }) => navigate(`/${key}`)}
        className={styles.menu}
      />
    </Sider>
  );
}
