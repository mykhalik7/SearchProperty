import { Link } from 'react-router-dom'
import type { Property } from '../types'
export default function PropertyCard({ p }: { p: Property }) {
  return (
    <div className="rounded-2xl bg-white shadow p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{p.address}</h3>
        <span className="text-sm rounded px-2 py-1 bg-gray-100">{p.type}</span>
      </div>
      <div className="text-xl font-bold">${p.price?.toLocaleString()}</div>
      <p className="text-sm text-gray-600">{p.description}</p>
      <div className="text-sm text-gray-500">{(p.spaces || []).length} spaces</div>
      <Link to={`/property/${p.id}`} className="mt-auto text-blue-600 hover:underline">View details →</Link>
    </div>
  )
}
