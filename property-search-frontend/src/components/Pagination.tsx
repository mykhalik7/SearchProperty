type Props = { page:number; total:number; limit:number; onPage:(p:number)=>void }
export default function Pagination({ page, total, limit, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}>Prev</button>
      <span className="text-sm">Page {page} / {pages}</span>
      <button className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPage(Math.min(pages, page + 1))}
        disabled={page >= pages}>Next</button>
    </div>
  )
}
