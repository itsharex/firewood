import { Input, Button, Select, DatePicker, message, Tooltip, Tag, Empty } from 'antd';
import { CopyOutlined, DeleteOutlined, SwapRightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import ToolLayout from '../../components/ToolLayout';
import { usePersistentState } from '../../hooks/usePersistentState';
import styles from './Timestamp.module.css';

type TimestampUnit = 'milliseconds' | 'seconds';

interface HistoryRecord {
  id: string;
  type: 'ts-to-date' | 'date-to-ts';
  timestamp: string;
  date: string;
  unit: TimestampUnit;
  convertedAt: number;
}

const MAX_HISTORY = 50;

const unitOptions = [
  { value: 'seconds', label: '秒' },
  { value: 'milliseconds', label: '毫秒' },
];

function toTimestamp(value: Dayjs, unit: TimestampUnit) {
  return unit === 'milliseconds' ? String(value.valueOf()) : String(value.unix());
}

function parseTimestamp(ts: string, unit: TimestampUnit) {
  const num = Number(ts);
  if (isNaN(num)) return null;
  return unit === 'seconds' ? dayjs.unix(num) : dayjs(num);
}

function formatHistoryForCopy(record: HistoryRecord) {
  const typeLabel =
    record.type === 'ts-to-date'
      ? '时间戳 → 日期'
      : '日期 → 时间戳';

  const lines = [
    typeLabel,
    `日期: ${record.date}`,
    `时间戳: ${record.timestamp}（${record.unit === 'seconds' ? '秒' : '毫秒'}）`
  ];
  if (record.type === 'ts-to-date') {
    [lines[1], lines[2]] = [lines[2], lines[1]];
  }
  return lines.join('\n');
}

export default function Timestamp() {
  const [ts, setTs] = usePersistentState('tool:timestamp:ts', '');
  const [tsUnit, setTsUnit] = usePersistentState<TimestampUnit>('tool:timestamp:ts-unit', 'seconds');
  const [dateValue, setDateValue] = usePersistentState<string | null>('tool:timestamp:date', null);
  const [tsResult, setTsResult] = usePersistentState('tool:timestamp:ts-result', '');
  const [dateResult, setDateResult] = usePersistentState('tool:timestamp:date-result', '');
  const [dateUnit, setDateUnit] = usePersistentState<TimestampUnit>('tool:timestamp:date-unit', 'milliseconds');
  const [history, setHistory] = usePersistentState<HistoryRecord[]>('tool:timestamp:history', []);
  const date: Dayjs | null = dateValue ? dayjs(dateValue) : null;

  const addHistory = (record: Omit<HistoryRecord, 'id' | 'convertedAt'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: crypto.randomUUID(),
      convertedAt: Date.now(),
    };
    setHistory((prev) => [newRecord, ...prev].slice(0, MAX_HISTORY));
  };

  const clearHistory = () => setHistory([]);

  const tsToDate = () => {
    const d = parseTimestamp(ts, tsUnit);
    if (!d) return;
    const result = d.format('YYYY-MM-DD HH:mm:ss');
    setTsResult(result);
    addHistory({ type: 'ts-to-date', timestamp: ts, date: result, unit: tsUnit });
  };

  const dateToTs = () => {
    if (!date) return;
    const result = toTimestamp(date, dateUnit);
    setDateResult(result);
    addHistory({ type: 'date-to-ts', timestamp: result, date: date.format('YYYY-MM-DD HH:mm:ss'), unit: dateUnit });
  };

  const now = () => {
    setTs(tsUnit === 'seconds' ? String(dayjs().unix()) : String(dayjs().valueOf()));
    setTsResult(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  };

  const today = () => {
    const todayStart = dayjs().startOf('second');
    setDateValue(todayStart.toISOString());
    setDateResult(toTimestamp(todayStart, dateUnit));
  };

  const handleTsUnitChange = (value: TimestampUnit) => {
    setTsUnit(value);
    if (ts) {
      const d = parseTimestamp(ts, value);
      if (d) setTsResult(d.format('YYYY-MM-DD HH:mm:ss'));
    }
  };

  const handleDateUnitChange = (value: TimestampUnit) => {
    setDateUnit(value);
    if (date) {
      setDateResult(toTimestamp(date, value));
    }
  };

  return (
    <ToolLayout title="时间戳转换" description="Unix 时间戳与人类可读日期互转">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 时间戳 → 日期 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>时间戳 → 日期</h4>
          <div className={styles.row}>
            <div className={styles.label}>
              <span>时间戳</span>
              <Select
                value={tsUnit}
                onChange={handleTsUnitChange}
                options={unitOptions}
                size="small"
                style={{ width: 72 }}
              />
            </div>
            <div className={styles.value}>
              <Input
                value={ts}
                onChange={(e) => setTs(e.target.value)}
                placeholder="输入 Unix 时间戳"
                onPressEnter={tsToDate}
              />
              <Button type="primary" onClick={tsToDate}>转 换</Button>
              <Button onClick={now}>当前时间</Button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>结果</div>
            <div className={styles.value}>
              <Input value={tsResult} readOnly />
              <Tooltip title="复制">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  disabled={!tsResult}
                  onClick={() => { navigator.clipboard.writeText(tsResult); message.success('已复制'); }}
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* 日期 → 时间戳 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>日期 → 时间戳</h4>
          <div className={styles.row}>
            <div className={styles.label}>选择日期</div>
            <div className={styles.value}>
              <DatePicker
                value={date}
                showTime={{ defaultOpenValue: dayjs().startOf('day') }}
                onChange={(d) => setDateValue(d ? d.toISOString() : null)}
                style={{ flex: 1 }}
              />
              <Button type="primary" onClick={dateToTs}>转 换</Button>
              <Button onClick={today}>当前日期</Button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>
              <span>时间戳</span>
              <Select
                value={dateUnit}
                onChange={handleDateUnitChange}
                options={unitOptions}
                size="small"
                style={{ width: 72 }}
              />
            </div>
            <div className={styles.value}>
              <Input value={dateResult} readOnly />
              <Tooltip title="复制">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  disabled={!dateResult}
                  onClick={() => { navigator.clipboard.writeText(dateResult); message.success('已复制'); }}
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* 转换历史 */}
        <div className={styles.section}>
          <div className={styles.historyHeader}>
            <h4 className={styles.sectionTitle} style={{ flex: 1, borderBottom: 'none' }}>
              转换历史
              {history.length > 0 && <span className={styles.historyCount}>{history.length}</span>}
            </h4>
            {history.length > 0 && (
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={clearHistory}
                className={styles.clearBtn}
              >
                清空
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <div className={styles.historyEmpty}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无转换记录" />
            </div>
          ) : (
            <div className={styles.historyList}>
              {history.map((record) => (
                <div key={record.id} className={styles.historyItem}>
                  <div className={styles.historyItemMain}>
                    <Tag
                      color={record.type === 'ts-to-date' ? 'blue' : 'green'}
                      className={styles.historyTag}
                    >
                      {record.type === 'ts-to-date' ? '时间戳转日期' : '日期转时间戳'}
                    </Tag>
                    <div className={styles.historyDetail}>
                      <span className={styles.historyTs}>{record.timestamp}</span>
                      <SwapRightOutlined className={styles.historyArrow} />
                      <span className={styles.historyDate}>{record.date}</span>
                    </div>
                    <span className={styles.historyUnit}>{record.unit === 'seconds' ? '秒' : '毫秒'}</span>
                    <span className={styles.historyTime}>
                      {dayjs(record.convertedAt).format('HH:mm:ss')}
                    </span>
                  </div>
                  <Tooltip title="复制转换详情">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      className={styles.historyCopyBtn}
                      onClick={() => {
                        navigator.clipboard.writeText(formatHistoryForCopy(record));
                        message.success('已复制');
                      }}
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
