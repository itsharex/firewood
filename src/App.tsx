import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import Sidebar from './components/Sidebar';
import AboutDialog from './components/AboutDialog';
import Updater from './components/Updater';
import tools from './router/tools';
import { useToolVisibility } from './hooks/useToolVisibility';
import './App.css';

const { Content } = Layout;

function App() {
  const toolIds = tools.map((t) => t.id);
  const { visibility, toggleToolVisibility } = useToolVisibility(toolIds);

  return (
    <BrowserRouter>
      <Updater />
      <AboutDialog />
      <Layout style={{ height: '100vh' }}>
        <Sidebar visibility={visibility} onToggleToolVisibility={toggleToolVisibility} />
        <Content style={{ overflow: 'auto', background: '#fff' }}>
          <Suspense fallback={<Spin style={{ margin: 40 }} />}>
            <Routes>
              <Route path="/" element={<Navigate to={`/${tools[0].id}`} replace />} />
              {tools.map((tool) => (
                <Route
                  key={tool.id}
                  path={`/${tool.id}`}
                  element={<tool.component />}
                />
              ))}
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
