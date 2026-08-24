import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import AllExpensesScreen from './screens/AllExpensesScreen';
import WalletScreen from './screens/WalletScreen';
import GroupsScreen from './screens/GroupsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeScreen />} />
          <Route path="expenses" element={<AllExpensesScreen />} />
          <Route path="wallet" element={<WalletScreen />} />
          <Route path="groups" element={<GroupsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="ai" element={<AIAssistantScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
