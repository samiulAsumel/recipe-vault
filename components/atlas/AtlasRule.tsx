interface AtlasRuleProps {
  className?: string;
}

/** Map-scale-bar rule: a hairline with small regular tick marks, not a decorative divider. */
export function AtlasRule({ className }: AtlasRuleProps): React.JSX.Element {
  return <div aria-hidden className={`atlas-rule ${className ?? ""}`} />;
}
