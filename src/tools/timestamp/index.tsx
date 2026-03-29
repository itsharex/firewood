import { Input, Button, Select, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import ToolLayout from '../../components/ToolLayout';
import { usePersistentState } from '../../hooks/usePersistentState';
import styles from './Timestamp.module.css';

type TimestampUnit = 'milliseconds' | 'seconds';

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

export default function Timestamp() {
  const [ts, setTs] = usePersistentState('tool:timestamp:ts', '');
  const [tsUnit, setTsUnit] = usePersistentState<TimestampUnit>('tool:timestamp:ts-unit', 'seconds');
  const [dateValue, setDateValue] = usePersistentState<string | null>('tool:timestamp:date', null);
  const [tsResult, setTsResult] = usePersistentState('tool:timestamp:ts-result', '');
  const [dateResult, setDateResult] = usePersistentState('tool:timestamp:date-result', '');
  const [dateUnit, setDateUnit] = usePersistentState<TimestampUnit>('tool:timestamp:date-unit', 'milliseconds');
  const date: Dayjs | null = dateValue ? dayjs(dateValue) : null;

  const tsToDate = () => {
    const d = parseTimestamp(ts, tsUnit);
    if (!d) return;
    setTsResult(d.format('YYYY-MM-DD HH:mm:ss'));
  };

  const dateToTs = () => {
    if (!date) return;
    setDateResult(toTimestamp(date, dateUnit));
  };

  const now = () => {
    setTs(tsUnit === 'seconds' ? String(dayjs().unix()) : String(dayjs().valueOf()));
    setTsResult(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  };

  const today = () => {
    const todayStart = dayjs().startOf('day');
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
              />
              <Button type="primary" onClick={tsToDate}>转换</Button>
              <Button onClick={now}>当前时间</Button>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>结果</div>
            <div className={styles.value}>
              <Input value={tsResult} readOnly />
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
              <Button type="primary" onClick={dateToTs}>转换</Button>
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
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
