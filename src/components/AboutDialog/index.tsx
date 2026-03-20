import { useEffect, useMemo, useState } from 'react';
import { AppstoreOutlined, CodeOutlined, RocketOutlined } from '@ant-design/icons';
import { listen } from '@tauri-apps/api/event';
import { getVersion } from '@tauri-apps/api/app';
import { Modal, Tag, Typography, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import { fetchReleaseNotesByVersionCached } from '../../utils/updateNotes';
import styles from './AboutDialog.module.css';

export default function AboutDialog() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesVersion, setNotesVersion] = useState('');
  const [notesBody, setNotesBody] = useState('');

  const metaTags = useMemo(
    () => ['Tauri', 'React', 'TypeScript'],
    [],
  );

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setup = async () => {
      unlisten = await listen('app://about-firewood', async () => {
        const currentVersion = await getVersion();
        setVersion(currentVersion);
        setOpen(true);
      });
    };

    void setup();

    return () => {
      unlisten?.();
    };
  }, []);

  const openVersionNotes = async () => {
    setNotesOpen(true);
    setNotesLoading(true);

    try {
      const currentVersion = version || (await getVersion());
      const releaseNotes = await fetchReleaseNotesByVersionCached(currentVersion);
      setNotesVersion(releaseNotes.version);
      setNotesBody(releaseNotes.body);
    } catch {
      setNotesVersion(version || '0.0.0');
      setNotesBody('当前版本的发布说明加载失败，请稍后重试。');
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={null}
        width={520}
        footer={null}
        centered
        onCancel={() => setOpen(false)}
        className={styles.modal}
        styles={{ body: { padding: 0 } }}
      >
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.badge}>
              <RocketOutlined />
            </div>
            <div>
              <Typography.Title level={3} className={styles.title}>
                Firewood
              </Typography.Title>
              <Typography.Text className={styles.subtitle}>
                A compact toolbox that keeps everyday dev workflows fast and focused.
              </Typography.Text>
            </div>
          </div>

          <div className={styles.infoRow}>
            <button type="button" className={`${styles.infoItem} ${styles.infoItemButton}`} onClick={openVersionNotes}>
              <CodeOutlined />
              <span>Version {version || '0.0.0'}</span>
              <span className={styles.infoHint}>查看修改点</span>
            </button>
            <div className={styles.infoItem}>
              <AppstoreOutlined />
              <span>Desktop Utility Suite</span>
            </div>
          </div>

          <div className={styles.tags}>
            {metaTags.map((tag) => (
              <Tag key={tag} className={styles.tag}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={notesOpen}
        title={`版本更新说明 · v${notesVersion || version || '0.0.0'}`}
        width={640}
        footer={null}
        centered
        onCancel={() => setNotesOpen(false)}
      >
        {notesLoading ? (
          <div className={styles.notesLoading}>
            <Spin size="small" />
            <Typography.Text type="secondary">正在加载更新说明...</Typography.Text>
          </div>
        ) : (
          <div className={styles.notesBody}>
            <ReactMarkdown>{notesBody}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </>
  );
}
