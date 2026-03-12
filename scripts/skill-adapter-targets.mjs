import path from 'node:path';

export const adapterTargets = [
  {
    name: 'claude',
    agentLabel: 'Claude 系エージェント',
    adapterLabel: 'Claude adapter',
    rootSegments: ['.claude', 'skills'],
  },
  {
    name: 'codex',
    agentLabel: 'Codex 系エージェント',
    adapterLabel: 'Codex adapter',
    rootSegments: ['.agents', 'skills'],
  },
];

export function resolveAdapterRoot(repoRoot, target) {
  return path.join(repoRoot, ...target.rootSegments);
}
