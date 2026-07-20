import type { LessonDefinition, SimulationSession, SimulationSnapshot } from "./types";

export const createSimulationSession = (lesson: LessonDefinition): SimulationSession => ({
  lesson,
  snapshotIndex: 0,
});

export const selectCurrentSnapshot = (session: SimulationSession): SimulationSnapshot => {
  const currentSnapshot = session.lesson.snapshots[session.snapshotIndex];

  if (currentSnapshot === undefined) {
    throw new Error("The simulation session points to an unavailable snapshot.");
  }

  return currentSnapshot;
};

export const advanceSimulation = (session: SimulationSession): SimulationSession => ({
  ...session,
  snapshotIndex: Math.min(session.snapshotIndex + 1, session.lesson.snapshots.length - 1),
});

export const rewindSimulation = (session: SimulationSession): SimulationSession => ({
  ...session,
  snapshotIndex: Math.max(session.snapshotIndex - 1, 0),
});

export const resetSimulation = (session: SimulationSession): SimulationSession => ({
  ...session,
  snapshotIndex: 0,
});

export const canAdvanceSimulation = (session: SimulationSession): boolean =>
  session.snapshotIndex < session.lesson.snapshots.length - 1;

export const canRewindSimulation = (session: SimulationSession): boolean => session.snapshotIndex > 0;
