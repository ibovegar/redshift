import { useEffect } from 'react';
import { connect } from 'react-redux';
import { Route, Routes, Navigate } from 'react-router';
import Layout from 'components/layout/layout.component';
import { Tactical, Marketplace, Inventory, Engineering } from 'containers';
import { loadUserStats } from 'store/user';
import { AppState } from 'store';

interface Props {
  credits: number;
  loadUserStats: () => void;
}

const App = (props: Props) => {
  const { credits, loadUserStats } = props;

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  return (
    <Layout authenticated credits={credits}>
      <Routes>
        <Route path="/" element={<Navigate to="/tactical" replace />} />
        <Route path="/tactical/*" element={<Tactical />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/engineering/*" element={<Engineering />} />
      </Routes>
    </Layout>
  );
};

const mapStateToProps = (state: AppState) => ({
  credits: state.user.credits
});

const mapDispatchToProps = {
  loadUserStats
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
