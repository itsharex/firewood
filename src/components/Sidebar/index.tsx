import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { FireOutlined } from '@ant-design/icons';
import tools from '../../router/tools';
import styles from './Sidebar.module.css';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentKey = location.pathname.replace('/', '') || tools[0].id;

  const menuItems = tools.map((t) => ({
    key: t.id,
    icon: t.icon,
    label: t.name,
  }));

  return (
    <Sider width={200} className={styles.sider}>
      <div className={styles.logo}>
        <FireOutlined className={styles.logoIcon} />
        <span className={styles.logoText}>Firewood</span>
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
