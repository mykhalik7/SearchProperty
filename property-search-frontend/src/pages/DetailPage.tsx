import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProperty } from '../api'
import type { Property } from '../types'
import Spinner from '../components/Spinner'

const SPACE_TYPES = [
	'',
	'bedroom',
	'kitchen',
	'bathroom',
	'living room',
] as const

export default function DetailPage() {
	const { id } = useParams()
	const [data, setData] = useState<Property | null>(null)
	const [loading, setLoading] = useState(true)
	const [filtering, setFiltering] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [type, setType] = useState('')

	useEffect(() => {
		setLoading(true)
		setError(null)
		fetchProperty(id!)
			.then(setData)
			.catch(err => setError(err?.message || 'Error loading property'))
			.finally(() => setLoading(false))
	}, [id])

	useEffect(() => {
		if (type) {
			setFiltering(true)
			const timer = setTimeout(() => {
				setFiltering(false)
			}, 300)
			return () => clearTimeout(timer)
		}
	}, [type])

	const filteredSpaces = useMemo(() => {
		const spaces = data?.spaces || []
		return type ? spaces.filter(s => s.type === type) : spaces
	}, [data, type])

	if (loading) {
		return (
			<div className='flex flex-col gap-6'>
				<Spinner size='lg' />
				<div role='status' className='animate-pulse flex flex-col gap-4'>
					<div className='h-8 bg-gray-200 rounded w-3/4'></div>
					<div className='h-4 bg-gray-200 rounded w-1/2'></div>
					<div className='h-20 bg-gray-200 rounded w-full'></div>
					<div className='h-8 bg-gray-200 rounded w-1/3'></div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						{[1, 2, 3, 4].map(i => (
							<div key={i} className='bg-gray-200 rounded-xl h-24'></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div
				role='alert'
				className='bg-red-50 text-red-600 border border-red-200 rounded-lg p-4'
			>
				<p>{error}</p>
				<Link
					to='/'
					className='mt-3 inline-block text-blue-600 hover:underline'
				>
					Back to search
				</Link>
			</div>
		)
	}

	if (!data) return null

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2'>
				<h2 className='text-2xl font-bold'>{data.address}</h2>
				<Link to='/' className='text-blue-600 hover:underline self-start'>
					← Back to search
				</Link>
			</div>

			<div className='bg-white shadow-sm rounded-lg p-4'>
				<div className='inline-block px-2 py-1 bg-gray-100 rounded text-sm mb-2'>
					{data.type}
				</div>
				<div className='text-xl font-bold mb-2'>
					${data.price.toLocaleString()}
				</div>
				<p className='text-gray-700'>
					{data.description || 'No description available'}
				</p>
			</div>

			<div className='flex flex-wrap items-center justify-between gap-3 mt-2'>
				<h3 className='text-lg font-medium flex items-center gap-2'>
					Spaces ({filteredSpaces.length}){filtering && <Spinner size='sm' />}
				</h3>
				<label className='text-sm flex items-center gap-2'>
					Filter:
					<select
						aria-label='Space type filter'
						className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400'
						value={type}
						onChange={e => setType(e.target.value)}
					>
						{SPACE_TYPES.map(t => (
							<option key={t} value={t}>
								{t || 'Any'}
							</option>
						))}
					</select>
				</label>
			</div>

			{filteredSpaces.length === 0 ? (
				<p className='text-gray-500 italic'>
					No spaces match the current filter
				</p>
			) : (
				<ul
					className='grid grid-cols-1 md:grid-cols-2 gap-3'
					aria-label='Property spaces'
				>
					{filteredSpaces.map(s => (
						<li
							key={s.id}
							className='bg-white rounded-xl p-4 shadow transition hover:shadow-md'
						>
							<div className='flex justify-between items-center mb-2'>
								<h4 className='font-medium capitalize'>{s.type}</h4>
								<span className='font-semibold'>{s.size} sqft</span>
							</div>
							<p className='text-sm text-gray-600'>
								{s.description || 'No description available'}
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
