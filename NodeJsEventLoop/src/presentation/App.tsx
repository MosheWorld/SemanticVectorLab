import { useEffect, useState } from "react";
import {
  advanceSimulation,
  canAdvanceSimulation,
  canRewindSimulation,
  createSimulationSession,
  resetSimulation,
  rewindSimulation,
  selectCurrentSnapshot,
} from "../domain/simulation/SimulationSessionController";
import type { LessonDefinition } from "../domain/simulation/types";
import { eventLoopLessons } from "../lessons/eventLoopLessons";
import { CodePanel } from "./components/CodePanel";
import { ConsolePanel } from "./components/ConsolePanel";
import { LessonStepNavigation } from "./components/LessonStepNavigation";
import { RuntimeDiagram } from "./components/RuntimeDiagram";
import { SimulationControls } from "./components/SimulationControls";

const firstLesson = eventLoopLessons[0];

if (firstLesson === undefined) {
  throw new Error("The lesson catalog must include at least one lesson.");
}

const initialSession = createSimulationSession(firstLesson);

export const App = (): React.JSX.Element => {
  const [session, setSession] = useState(initialSession);
  const snapshot = selectCurrentSnapshot(session);

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent): void => {
      if (event.key === "ArrowRight") {
        setSession((currentSession) => canAdvanceSimulation(currentSession) ? advanceSimulation(currentSession) : currentSession);
      }

      if (event.key === "ArrowLeft") {
        setSession((currentSession) => canRewindSimulation(currentSession) ? rewindSimulation(currentSession) : currentSession);
      }
    };

    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => { window.removeEventListener("keydown", handleKeyboardNavigation); };
  }, []);

  const selectLesson = (lesson: LessonDefinition): void => {
    setSession(createSimulationSession(lesson));
  };

  return (
    <main className={session.lesson.focus === "complete-runtime" ? "application-shell complete-runtime-lesson" : "application-shell"}>
      <header className="hero">
        <h1>Event Loop Lab</h1>
        <p className="hero-description">
          Run the runtime one transition at a time. Watch each callback earn its turn.
        </p>
      </header>

      <LessonStepNavigation activeLessonId={session.lesson.id} lessons={eventLoopLessons} onLessonSelected={selectLesson} />

      <section className="lesson-heading" aria-labelledby="lesson-title">
        <div>
          <p className="lesson-level">{session.lesson.level}</p>
          <h2 id="lesson-title">{session.lesson.title}</h2>
          <p>{session.lesson.description}</p>
        </div>
        <p className="step-counter">
          Transition {session.snapshotIndex + 1} of {session.lesson.snapshots.length}
        </p>
      </section>

      <aside className="lesson-takeaway" aria-label="Rule to remember">
        <span>Rule to remember</span>
        <strong>{session.lesson.takeaway}</strong>
      </aside>

      <div className="transition-progress" aria-label={`Transition ${String(session.snapshotIndex + 1)} of ${String(session.lesson.snapshots.length)}`} aria-valuemax={session.lesson.snapshots.length} aria-valuemin={1} aria-valuenow={session.snapshotIndex + 1} role="progressbar">
        <span style={{ width: `${String(((session.snapshotIndex + 1) / session.lesson.snapshots.length) * 100)}%` }} />
      </div>

      <section className="lab-grid" aria-label="Event loop simulation">
        <CodePanel activeLineNumber={snapshot.activeLineNumber} sourceCode={session.lesson.sourceCode} followActiveLine={session.lesson.focus === "complete-runtime"} />
        <RuntimeDiagram activeCycleStage={snapshot.activeCycleStage} activePhase={snapshot.activePhase} focus={session.lesson.focus} snapshotId={snapshot.id} tokens={snapshot.tokens} transitionTitle={snapshot.transitionTitle} />
        <ConsolePanel entries={snapshot.consoleEntries} />
      </section>

      <section className="explanation-card" key={snapshot.id} aria-live="polite">
        <p className="eyebrow">WHAT JUST HAPPENED</p>
        <h3>{snapshot.transitionTitle}</h3>
        <p>{snapshot.explanation}</p>
      </section>

      <SimulationControls
        canAdvance={canAdvanceSimulation(session)}
        canRewind={canRewindSimulation(session)}
        onAdvance={() => {
          setSession(advanceSimulation);
        }}
        onReset={() => {
          setSession(resetSimulation);
        }}
        onRewind={() => {
          setSession(rewindSimulation);
        }}
      />
    </main>
  );
};
