import type { EventLoopCycleStage, LessonDefinition } from "../domain/simulation/types";

interface CycleTransition {
  readonly id: string;
  readonly title: string;
  readonly stage: EventLoopCycleStage;
  readonly activeLineNumber: number;
  readonly explanation: string;
}

const cycleTransitions: readonly CycleTransition[] = [
  { id: "alive-check", title: "Check whether the loop is alive", stage: "alive-check", activeLineNumber: 1, explanation: "Node continues while something can still produce work, such as a server listening for connections, a pending file read, or a referenced timer. If nothing remains, the process can exit." },
  { id: "pending-callbacks", title: "Run deferred system callbacks", stage: "pending", activeLineNumber: 2, explanation: "libuv runs a small set of operating-system callbacks postponed from the previous iteration, such as certain TCP errors. Ordinary file and network results normally run during poll, not here." },
  { id: "pending-priority", title: "Drain priority work after a pending callback", stage: "pending-priority-checkpoint", activeLineNumber: 3, explanation: "After each pending callback returns, Node drains the nextTick queue and then V8 microtasks before taking another callback or continuing the cycle." },
  { id: "idle-handles", title: "Run libuv's internal idle work", stage: "idle", activeLineNumber: 4, explanation: "This is internal libuv bookkeeping. Application code does not schedule console.log, Promises, timers, or I/O here, so there is intentionally no JavaScript API example." },
  { id: "prepare-handles", title: "Prepare to wait for I/O", stage: "prepare", activeLineNumber: 5, explanation: "libuv and Node perform internal preparation immediately before poll, including deciding how the upcoming wait should behave. This is infrastructure, not an application callback queue." },
  { id: "poll-io", title: "Receive and run ready I/O", stage: "poll", activeLineNumber: 6, explanation: "Poll receives ready socket events and completed file-system work, then eligible JavaScript callbacks return to the call stack. Examples include fs.readFile callbacks, server request handlers, and socket data handlers." },
  { id: "poll-priority", title: "Drain priority work after an I/O callback", stage: "poll-priority-checkpoint", activeLineNumber: 7, explanation: "The highlighted checkpoint belongs specifically to the poll callback that just returned. Node runs its queued nextTicks first, then Promise and await microtasks, before selecting more I/O or moving to check." },
  { id: "check-handles", title: "Run setImmediate callbacks", stage: "check", activeLineNumber: 8, explanation: "Callbacks registered with setImmediate run in check, after poll. When setImmediate is scheduled inside an I/O callback, it commonly runs before a timer scheduled from that same callback." },
  { id: "check-priority", title: "Drain priority work after setImmediate", stage: "check-priority-checkpoint", activeLineNumber: 9, explanation: "After a setImmediate callback returns, Node drains nextTick and then V8 microtasks before running another eligible callback." },
  { id: "close-callbacks", title: "Run close callbacks", stage: "close", activeLineNumber: 10, explanation: "Close notifications for handles such as sockets run here, for example socket.on('close', ...). This is cleanup notification, not the same as merely calling socket.end()." },
  { id: "close-priority", title: "Drain priority work after a close callback", stage: "close-priority-checkpoint", activeLineNumber: 11, explanation: "If a close callback scheduled nextTick or Promise work, Node drains it now before continuing the libuv cycle." },
  { id: "update-time", title: "Refresh libuv's clock", stage: "update-time", activeLineNumber: 12, explanation: "libuv updates its cached time so timer thresholds can be compared efficiently. No user JavaScript callback is executed during this bookkeeping step." },
  { id: "run-timers", title: "Run timers whose thresholds passed", stage: "timers", activeLineNumber: 13, explanation: "Eligible setTimeout and setInterval callbacks return to the call stack. The delay is a minimum threshold, so setTimeout(callback, 0) means run no earlier than the timers phase when JavaScript and higher-priority queues allow it." },
  { id: "timers-priority", title: "Drain priority work after a timer callback", stage: "timers-priority-checkpoint", activeLineNumber: 14, explanation: "After each timer callback returns, Node drains nextTick and V8 microtasks before taking the next timer callback. Learning path 08 demonstrates this exact behavior." },
  { id: "repeat-loop", title: "Repeat or let Node exit", stage: "repeat", activeLineNumber: 15, explanation: "If referenced work remains, another iteration begins. A listening server, interval, open socket, or pending request can keep the loop alive. Otherwise uv_run returns and Node can exit." },
];

export const phaseOverviewLesson: LessonDefinition = {
  id: "event-loop-cycle-overview",
  title: "Meet the libuv event loop cycle",
  level: "intermediate",
  focus: "phase-overview",
  description: "Follow one modern Node.js loop iteration, see familiar APIs at each phase, and learn where nextTick, Promises, and await fit between callbacks.",
  takeaway: "The earlier callback queue expands into phase queues. Between JavaScript callbacks, Node drains nextTick and then V8 microtasks.",
  sourceCode: ["is the loop alive?", "run a pending callback", "drain its nextTick and microtask work", "run internal idle handles", "prepare to poll", "run a ready I/O callback", "drain its nextTick and microtask work", "run a setImmediate callback", "drain its nextTick and microtask work", "run a close callback", "drain its nextTick and microtask work", "update loop time", "run a due timer callback", "drain its nextTick and microtask work", "repeat while work remains"],
  snapshots: cycleTransitions.map((transition) => ({
    id: transition.id,
    transitionTitle: transition.title,
    activeLineNumber: transition.activeLineNumber,
    tokens: [],
    consoleEntries: [],
    activePhase: null,
    activeCycleStage: transition.stage,
    explanation: transition.explanation,
  })),
};
