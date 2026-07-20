import type { EventLoopCycleStage } from "../../../domain/simulation/types";

interface CycleNodeProperties {
  readonly activeCycleStage: EventLoopCycleStage | undefined;
  readonly examples: readonly string[];
  readonly note: string;
  readonly stage: EventLoopCycleStage;
  readonly title: string;
  readonly subtitle: string;
}

const CycleNode = ({ activeCycleStage, examples, note, stage, subtitle, title }: CycleNodeProperties): React.JSX.Element => (
  <li className={activeCycleStage === stage ? "cycle-node active-cycle-node" : "cycle-node"}>
    <span className="cycle-node-marker" aria-hidden="true" />
    <div><strong>{title}</strong><small>{subtitle}</small></div>
    {examples.length === 0 ? null : <aside className="cycle-code-example" role="tooltip">
      <span>Common examples</span>
      <p>{note}</p>
      <ul>{examples.map((example) => <li key={example}><code>{example}</code></li>)}</ul>
    </aside>}
  </li>
);

interface PriorityCheckpointProperties {
  readonly activeCycleStage: EventLoopCycleStage | undefined;
  readonly stage: EventLoopCycleStage;
}

const PriorityCheckpoint = ({ activeCycleStage, stage }: PriorityCheckpointProperties): React.JSX.Element => (
  <li className={activeCycleStage === stage ? "priority-checkpoint active-priority-checkpoint" : "priority-checkpoint"}>
    <span className="checkpoint-label">After each callback</span>
    <span className="checkpoint-queue"><strong>1</strong> nextTick queue</span>
    <span className="checkpoint-arrow" aria-hidden="true">→</span>
    <span className="checkpoint-queue"><strong>2</strong> V8 microtask queue</span>
    <small>Promise handlers, queueMicrotask, resumed await</small>
  </li>
);

export const EventLoopCycleOverview = ({ activeCycleStage }: { readonly activeCycleStage: EventLoopCycleStage | undefined }): React.JSX.Element => (
  <section className="runtime-diagram cycle-overview" aria-label="libuv event loop cycle">
    <div className="runtime-heading">
      <div><p className="eyebrow">THE LIBUV CYCLE</p><h2>One loop iteration, from start to repeat</h2></div>
      <span className="runtime-version">concept map</span>
    </div>
    <div className="scheduling-model" aria-label="How the earlier queue model maps to Node.js">
      <article>
        <span>Earlier simplified model</span>
        <strong>Callback queue</strong>
        <p>One box grouped every non-microtask callback so the first lessons stayed approachable.</p>
      </article>
      <span className="model-arrow" aria-hidden="true">→</span>
      <article>
        <span>Accurate Node.js model</span>
        <strong>Several phase queues</strong>
        <p>Timers, poll I/O, <code>setImmediate</code>, and close callbacks wait in different places.</p>
      </article>
      <span className="model-arrow" aria-hidden="true">+</span>
      <article className="microtask-definition">
        <span>Between JavaScript callbacks</span>
        <strong>Priority checkpoint</strong>
        <p><code>nextTick</code> first, then V8 microtasks: Promise handlers, <code>queueMicrotask</code>, and resumed <code>await</code>.</p>
      </article>
    </div>
    <div className="cycle-map">
      <div className={activeCycleStage === "alive-check" ? "loop-alive-card active-cycle-node" : "loop-alive-card"}>
        <span>Decision</span><strong>Is the loop alive?</strong><small>No work remains, Node can exit. Otherwise, continue.</small>
      </div>
      <ol className="cycle-path">
        <CycleNode activeCycleStage={activeCycleStage} examples={["socket.on('error', onError)", "server.on('error', onError)"]} note="This phase has its own FIFO callback queue. Only certain system operations deferred from the previous iteration appear here." stage="pending" subtitle="Phase queue: deferred system callbacks" title="Pending callbacks" />
        <PriorityCheckpoint activeCycleStage={activeCycleStage} stage="pending-priority-checkpoint" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["Internal to Node.js and libuv"]} note="Your application does not place JavaScript callbacks in this phase." stage="idle" subtitle="Internal libuv work" title="Idle handles" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["Internal to Node.js and libuv"]} note="This prepares polling. It is not related to async or await syntax." stage="prepare" subtitle="Prepare to poll" title="Prepare handles" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["fs.readFile('data.txt', onRead)", "server.on('request', onRequest)", "socket.on('data', onData)"]} note="The poll queue holds ready I/O callbacks. Each callback moves to the call stack and runs synchronously, one at a time." stage="poll" subtitle="Phase queue: most I/O callbacks" title="Poll for I/O" />
        <PriorityCheckpoint activeCycleStage={activeCycleStage} stage="poll-priority-checkpoint" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["setImmediate(onImmediate)", "setImmediate(() => console.log('check'))"]} note="The check phase has its own FIFO queue for setImmediate callbacks. A callback then moves to the call stack." stage="check" subtitle="Phase queue: setImmediate callbacks" title="Check handles" />
        <PriorityCheckpoint activeCycleStage={activeCycleStage} stage="check-priority-checkpoint" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["socket.on('close', onClose)", "server.on('close', onClose)"]} note="The close phase has its own queue. These callbacks announce that a handle has finished closing." stage="close" subtitle="Phase queue: close notifications" title="Close callbacks" />
        <PriorityCheckpoint activeCycleStage={activeCycleStage} stage="close-priority-checkpoint" />
        <CycleNode activeCycleStage={activeCycleStage} examples={[]} note="" stage="update-time" subtitle="Internal clock bookkeeping" title="Update loop time" />
        <CycleNode activeCycleStage={activeCycleStage} examples={["setTimeout(onReady, 0)", "setTimeout(onReady, 1000)", "setInterval(onTick, 1000)"]} note="Eligible timer callbacks run from the timers phase queue. The delay is a minimum threshold, not a guaranteed execution time." stage="timers" subtitle="Phase queue: due timer callbacks" title="Run due timers" />
        <PriorityCheckpoint activeCycleStage={activeCycleStage} stage="timers-priority-checkpoint" />
      </ol>
      <div className={activeCycleStage === "repeat" ? "cycle-return active-cycle-return" : "cycle-return"}>
        <span aria-hidden="true">↻</span><strong>Work remains?</strong><small>Begin the next iteration</small>
      </div>
    </div>
  </section>
);

