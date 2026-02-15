import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TradesProvider } from './context/TradesContext';
import { PageLayout } from './components/layout';
import {
  Dashboard,
  Trades,
  NewTrade,
  TradeDetail,
  Analytics,
  Settings,
  Capital,
  Auth
} from './pages';

function App() {
  return (
    <ThemeProvider>
      <TradesProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PageLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/trades/:id" element={<TradeDetail />} />
              <Route path="/new-trade" element={<NewTrade />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/capital" element={<Capital />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TradesProvider>
    </ThemeProvider>
  );
}

export default App;
