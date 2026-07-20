import type { RuntimeLocation, RuntimeToken } from "../../../domain/simulation/types";

interface RuntimeZoneProperties {
  readonly description: string;
  readonly locations: readonly RuntimeLocation[];
  readonly title: string;
  readonly tokens: readonly RuntimeToken[];
}

export const RuntimeZone = ({ description, locations, title, tokens }: RuntimeZoneProperties): React.JSX.Element => {
  const matchingTokens = tokens.filter((token) => locations.includes(token.location));

  return (
    <section className={matchingTokens.length > 0 ? "diagram-zone active-zone" : "diagram-zone"} data-stack={locations.includes("call-stack") || undefined}>
      <div className="diagram-zone-heading">
        <div><h3>{title}</h3><p>{description}</p></div>
        <span className="queue-count">{matchingTokens.length}</span>
      </div>
      <div className="token-area">
        {matchingTokens.length === 0 ? <span className="empty-state">Waiting</span> : matchingTokens.map((token) => (
          <span className="runtime-token" data-token-id={token.id} key={token.id}>{locations.includes("call-stack") ? <small className="frame-state">{token === matchingTokens.at(-1) ? "Executing" : "Caller"}</small> : null}{token.label}</span>
        ))}
      </div>
    </section>
  );
};

