export const queryKeys = {
  user: ['user'] as const,
  spacecrafts: ['spacecrafts'] as const,
  spacecraft: (id: string) => ['spacecrafts', id] as const,
  upgrades: ['upgrades'] as const,
  missions: ['missions'] as const,
  store: ['store'] as const
}
