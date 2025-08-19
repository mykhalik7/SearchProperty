import axios from 'axios'
import type { Property } from './types'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5005'
export async function fetchProperties(params: Record<string, any>) {
  const res = await axios.get(`${API_BASE}/properties`, { params })
  return res.data as { total: number; items: Property[] }
}
export async function fetchProperty(id: number | string) {
  const res = await axios.get(`${API_BASE}/properties/${id}`)
  return res.data as Property
}
export async function createProperty(payload: Property) {
  const res = await axios.post(`${API_BASE}/properties`, payload)
  return res.data as { id: number }
}
export async function fetchSpaceStats() {
  const res = await axios.get(`${API_BASE}/stats/spaces`)
  return res.data as { overall: number; perProperty: Array<{property_id:number; address:string; avg_size:number}> }
}
