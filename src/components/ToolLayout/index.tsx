import type { ReactNode } from 'react';
import { Typography } from 'antd';
import styles from './ToolLayout.module.css';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function ToolLayout({ title, description, children }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Typography.Title level={4} className={styles.title}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text type="secondary">{description}</Typography.Text>
        )}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
