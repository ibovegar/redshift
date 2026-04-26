import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Spacecraft, Mission } from 'models';
import { AppState } from 'store';
import { MissionTag } from 'components/ui';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { loadSpacecrafts, getAllspacecrafts } from 'store/spacecrafts';
import { loadMissions, getAllMissions } from 'store/missions';
import MissionViewer from './mission-viewer/mission-viewer.component';

const tagPositions: any = [
  {
    x: 5,
    y: 20
  },
  {
    x: 32,
    y: 35
  },
  {
    x: 26,
    y: 65
  },
  {
    x: 70,
    y: 30
  },
  {
    x: 100,
    y: 100
  }
];

interface Props {
  isLoading: boolean;
  spacecrafts: Spacecraft[];
  missions: Mission[];
  loadSpacecrafts: () => void;
  loadMissions: () => void;
}

const Tactical = (props: Props) => {
  const { missions, loadSpacecrafts, loadMissions } = props;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadSpacecrafts();
    loadMissions();
  }, [loadSpacecrafts, loadMissions]);

  const handleSelectMission = useCallback(
    (missionId: string) => {
      navigate(missionId);
    },
    [navigate]
  );

  const isWatchingMission = location.pathname !== '/tactical';

  return (
    <>
      {missions.map((mission: Mission, index: number) => (
        <MissionTag
          key={mission.id}
          mission={mission}
          position={tagPositions[index]}
          disabled={isWatchingMission || mission.completed}
          onSelect={() => handleSelectMission(mission.id)}
        />
      ))}
      <Routes>
        <Route path=":missionId" element={<MissionViewer />} />
      </Routes>
    </>
  );
};

const mapStateToProps = (state: AppState) => ({
  isLoading: state.spacecrafts.isLoading,
  spacecrafts: getAllspacecrafts(state),
  missions: getAllMissions(state)
});

const mapDispatchToProps = {
  loadSpacecrafts,
  loadMissions
};

export default connect(mapStateToProps, mapDispatchToProps)(Tactical);
