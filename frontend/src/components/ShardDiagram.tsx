const SHARDS = [
  { x: 18, label: 'shard 0', port: ':5442' },
  { x: 118, label: 'shard 1', port: ':5443' },
  { x: 218, label: 'shard 2', port: ':5444' },
];

/**
 * Where a row lands. The whole shard-key argument is about routing, so this is
 * the one place a diagram beats prose. Decorative — aria-hidden, with the
 * routing rule stated as real text directly beneath it.
 *
 * Colours come from Tailwind utility classes rather than presentation
 * attributes: `fill="var(--color-ink)"` is not reliably resolved on an SVG
 * attribute, whereas the utility compiles to a real CSS declaration.
 */
export function ShardDiagram() {
  return (
    <figure className="mt-8 border border-hairline bg-paper p-5 sm:p-7">
      <svg
        viewBox="0 0 320 160"
        className="h-auto w-full font-mono"
        aria-hidden="true"
        focusable="false"
        role="presentation"
        fontSize="9"
      >
        {/* order_id → hash */}
        <rect x="1" y="18" width="86" height="26" className="fill-none stroke-hairline" />
        <text x="11" y="35" className="fill-ink">
          order_id
        </text>

        <line x1="87" y1="31" x2="115" y2="31" className="stroke-hairline" />

        <rect x="115" y="18" width="90" height="26" className="fill-none stroke-signal" />
        <text x="125" y="35" className="fill-signal">
          CRC32 % 3
        </text>

        {/* drop to the bus, then one drop per shard */}
        <path
          d="M160 44 V72 M60 72 H260 M60 72 V96 M160 72 V96 M260 72 V96"
          className="fill-none stroke-hairline"
        />

        {SHARDS.map((shard) => (
          <g key={shard.label}>
            <rect x={shard.x} y="96" width="84" height="44" className="fill-none stroke-ink" />
            <text x={shard.x + 12} y="116" className="fill-ink">
              {shard.label}
            </text>
            <text x={shard.x + 12} y="130" className="fill-graphite">
              {shard.port}
            </text>
          </g>
        ))}

        <text x="1" y="155" className="fill-graphite">
          postgres · docker
        </text>
      </svg>

      <figcaption className="mt-4 font-mono text-2xs leading-relaxed text-graphite">
        Routing is <span className="text-ink">CRC32(order_id) % 3</span>, computed in-process — no
        mapping table, no extra round-trip. A lookup by <span className="text-ink">order_id</span>{' '}
        reaches exactly one shard; a lookup by <span className="text-ink">customer_id</span> fans out
        to all three and merges.
      </figcaption>
    </figure>
  );
}
