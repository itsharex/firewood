import { useEffect, useState } from 'react';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { notification, Button, Progress, Space } from 'antd';

interface UpdateInfo {
  version: string;
  body: string | null;
}

export default function Updater() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 延迟 3 秒再检查，避免影响启动体验
    const timer = setTimeout(() => checkForUpdate(), 3000);
    return () => clearTimeout(timer);
  }, []);

  const checkForUpdate = async () => {
    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      if (shouldUpdate && manifest) {
        showUpdateNotification({ version: manifest.version, body: manifest.body ?? null });
      }
    } catch {
      // 网络不可达时静默忽略
    }
  };

  const showUpdateNotification = (info: UpdateInfo) => {
    const key = 'firewood-update';
    notification.info({
      key,
      message: `🎉 发现新版本 v${info.version}`,
      description: info.body || '包含最新功能与问题修复。',
      duration: 0,
      placement: 'bottomRight',
      btn: (
        <Space>
          <Button size="small" onClick={() => notification.destroy(key)}>
            稍后更新
          </Button>
          <Button
            type="primary"
            size="small"
            loading={downloading}
            onClick={() => startUpdate(key)}
          >
            立即更新
          </Button>
        </Space>
      ),
    });
  };

  const startUpdate = async (notifKey: string) => {
    notification.destroy(notifKey);
    setDownloading(true);
    setProgress(0);

    // 显示下载进度通知
    const downloadKey = 'firewood-downloading';
    notification.open({
      key: downloadKey,
      message: '正在下载更新…',
      description: <ProgressBar progress={progress} />,
      duration: 0,
      placement: 'bottomRight',
    });

    try {
      // 模拟进度（Tauri v1 updater 不暴露进度事件，用动画代替）
      const progressTimer = setInterval(() => {
        setProgress((p) => {
          const next = p + Math.random() * 8;
          if (next >= 95) {
            clearInterval(progressTimer);
            return 95;
          }
          notification.open({
            key: downloadKey,
            message: '正在下载更新…',
            description: <ProgressBar progress={next} />,
            duration: 0,
            placement: 'bottomRight',
          });
          return next;
        });
      }, 300);

      await installUpdate();
      clearInterval(progressTimer);

      notification.destroy(downloadKey);
      notification.success({
        message: '更新完成',
        description: '即将重启应用以完成更新…',
        duration: 2,
        placement: 'bottomRight',
      });

      setTimeout(() => relaunch(), 2000);
    } catch (e) {
      setDownloading(false);
      notification.destroy(downloadKey);
      notification.error({
        message: '更新失败',
        description: String(e),
        placement: 'bottomRight',
      });
    }
  };

  return null;
}

function ProgressBar({ progress }: { progress: number }) {
  return <Progress percent={Math.round(progress)} size="small" />;
}
