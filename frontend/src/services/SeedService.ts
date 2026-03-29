import { request } from './ApiService'

export const SeedService = {
  seedSampleData: () => request<{ message: string }>('/events/dev', { method: 'POST' }),
}
