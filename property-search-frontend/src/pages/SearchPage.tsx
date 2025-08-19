import { useEffect, useMemo, useState } from 'react'
import { fetchProperties, fetchSpaceStats } from '../api'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import SortSelect from '../components/SortSelect'
import Spinner from '../components/Spinner'
import useDebouncedValue from '../hooks/useDebouncedValue'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const TYPES = ['', 'house', 'apartment', 'condo'] as const

export default function SearchPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const [type, setType] = useState(searchParams.get('type') || '')
	const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
	const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
	const [sort, setSort] = useState(searchParams.get('sort') || '')
	const [page, setPage] = useState(
		parseInt(searchParams.get('page') || '1', 10)
	)
	const [limit, setLimit] = useState(
		parseInt(searchParams.get('limit') || '6', 10)
	)

	const [loading, setLoading] = useState(false)
	const [filtering, setFiltering] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(
		location.state?.success || null
	)
	const [data, setData] = useState<{ total: number; items: any[] }>({
		total: 0,
		items: [],
	})
	const [stats, setStats] = useState<{
		overall: number
		perProperty: any[]
	} | null>(null)

	const debouncedMin = useDebouncedValue(minPrice, 400)
	const debouncedMax = useDebouncedValue(maxPrice, 400)

	useEffect(() => {
		const params = new URLSearchParams()
		if (type) params.set('type', type)
		if (debouncedMin) params.set('min_price', debouncedMin)
		if (debouncedMax) params.set('max_price', debouncedMax)
		if (sort) params.set('sort', sort)
		if (page > 1) params.set('page', page.toString())
		if (limit !== 6) params.set('limit', limit.toString())

		setSearchParams(params, { replace: true })
	}, [type, debouncedMin, debouncedMax, page, limit, sort, setSearchParams])

	useEffect(() => {
		if (success) {
			const timer = setTimeout(() => {
				setSuccess(null)
				navigate(location.pathname + location.search, { replace: true })
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [success, navigate, location.pathname, location.search])

	useEffect(() => {
		if (minPrice || maxPrice) {
			setFiltering(true)
		}
	}, [minPrice, maxPrice])

	useEffect(() => {
		setFiltering(false)
	}, [debouncedMin, debouncedMax])

	useEffect(() => {
		setLoading(true)
		setError(null)

		fetchProperties({
			type: type || undefined,
			min_price: debouncedMin || undefined,
			max_price: debouncedMax || undefined,
			page,
			limit,
			sort: sort || undefined,
		})
			.then(setData)
			.catch(e => setError(e?.message || 'Error'))
			.finally(() => setLoading(false))
	}, [type, debouncedMin, debouncedMax, page, limit, sort])

	useEffect(() => {
		fetchSpaceStats()
			.then(setStats)
			.catch(() => {})
	}, [])

	useEffect(() => {
		setPage(1)
	}, [type, debouncedMin, debouncedMax, sort])

	const resultSummary = useMemo(() => {
		const filters = []
		if (type) filters.push(`type=${type}`)
		if (debouncedMin) filters.push(`min=${debouncedMin}`)
		if (debouncedMax) filters.push(`max=${debouncedMax}`)
		return filters.length ? filters.join(', ') : 'none'
	}, [type, debouncedMin, debouncedMax])

	return (
		<div className='flex flex-col gap-6'>
			<section
				aria-label='Search filters'
				className='bg-white rounded-2xl shadow p-4 flex flex-wrap gap-4 items-end'
			>
				<label className='text-sm flex flex-col'>
					Type
					<select
						aria-label='Type filter'
						className='border rounded px-2 py-1'
						value={type}
						onChange={e => setType(e.target.value)}
					>
						{TYPES.map(t => (
							<option key={t} value={t}>
								{t || 'Any'}
							</option>
						))}
					</select>
				</label>
				<label className='text-sm flex flex-col'>
					Min price
					<input
						aria-label='Min price'
						inputMode='numeric'
						className='border rounded px-2 py-1'
						value={minPrice}
						onChange={e => setMinPrice(e.target.value)}
						placeholder='0'
					/>
				</label>
				<label className='text-sm flex flex-col'>
					Max price
					<input
						aria-label='Max price'
						inputMode='numeric'
						className='border rounded px-2 py-1'
						value={maxPrice}
						onChange={e => setMaxPrice(e.target.value)}
						placeholder='500000'
					/>
				</label>
				<SortSelect value={sort} onChange={setSort} />
				<label className='text-sm flex items-center gap-2'>
					Show:
					<select
						aria-label='Page size'
						className='border rounded px-2 py-1'
						value={String(limit)}
						onChange={e => setLimit(Number(e.target.value))}
					>
						{[6, 9, 12].map(n => (
							<option key={n} value={n}>
								{n}
							</option>
						))}
					</select>
				</label>
				{stats && (
					<div className='ml-auto text-sm text-gray-600' aria-live='polite'>
						Avg space size overall: <strong>{stats.overall?.toFixed(1)}</strong>{' '}
						sqft
					</div>
				)}
			</section>

			<div className='flex flex-col gap-2'>
				<div className='flex items-center gap-2'>
					<p className='text-sm text-gray-600'>
						Active filters: {resultSummary}
					</p>
					{filtering && <Spinner size='sm' />}
				</div>
				{success && (
					<div
						role='alert'
						className='bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-between'
					>
						<span>{success}</span>
						<button
							type='button'
							onClick={() => setSuccess(null)}
							aria-label='Dismiss'
							className='ml-2 text-xl'
						>
							&times;
						</button>
					</div>
				)}
				{error && (
					<div
						role='alert'
						className='bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2'
					>
						{error}
					</div>
				)}
			</div>

			{loading ? (
				<>
					<Spinner size='lg' />
					<div
						role='status'
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
					>
						{Array.from({ length: limit }).map((_, i) => (
							<div
								key={i}
								className='rounded-2xl bg-white shadow p-4 flex flex-col gap-2 animate-pulse'
							>
								<div className='h-6 bg-gray-200 rounded w-3/4'></div>
								<div className='h-7 bg-gray-200 rounded w-1/2 mt-2'></div>
								<div className='h-4 bg-gray-200 rounded w-full'></div>
								<div className='h-4 bg-gray-200 rounded w-1/4 mt-auto'></div>
							</div>
						))}
					</div>
				</>
			) : (
				<section
					aria-label='Results grid'
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
				>
					{data.items.map((p: any) => (
						<PropertyCard key={p.id} p={p} />
					))}
				</section>
			)}

			<div className='flex justify-between items-center'>
				<div className='text-sm text-gray-500'>{data.total} result(s)</div>
				<Pagination
					page={page}
					total={data.total}
					limit={limit}
					onPage={setPage}
				/>
			</div>
		</div>
	)
}
