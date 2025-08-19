export default function SortSelect({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  return (
    <label className="text-sm flex items-center gap-2">
      Sort:
      <select aria-label="Sort order" className="border rounded px-2 py-1" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">None</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
      </select>
    </label>
  )
}
