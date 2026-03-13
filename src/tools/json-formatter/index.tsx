import { useState } from 'react';
import { Button, Space, Alert, Row, Col } from 'antd';
import Editor from '@monaco-editor/react';
import ToolLayout from '../../components/ToolLayout';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout title="JSON 格式化" description="JSON 格式化、压缩与语法校验">
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={format}>格式化</Button>
        <Button onClick={minify}>压缩</Button>
        <Button danger onClick={clear}>清空</Button>
      </Space>

      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 12 }} showIcon />
      )}

      <Row gutter={16} style={{ height: 'calc(100% - 80px)' }}>
        <Col span={12}>
          <Editor
            height="100%"
            language="json"
            value={input}
            onChange={(v) => setInput(v ?? '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 13 }}
          />
        </Col>
        <Col span={12}>
          <Editor
            height="100%"
            language="json"
            value={output}
            theme="vs-dark"
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
          />
        </Col>
      </Row>
    </ToolLayout>
  );
}
