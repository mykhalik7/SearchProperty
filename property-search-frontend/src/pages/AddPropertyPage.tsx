import { FormEvent, useState, useEffect } from 'react'
import { createProperty } from '../api'
import type { Property, Space } from '../types'
import { useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'

const PROP_TYPES = ['house', 'apartment', 'condo'] as const
const SPACE_TYPES = ['bedroom', 'kitchen', 'bathroom', 'living room'] as const

export default function AddPropertyPage() {
	const navigate = useNavigate()
	const [payload, setPayload] = useState<Property>({
		address: '',
		type: 'house',
		price: 0,
		description: '',
		spaces: [],
	})
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [spacesUpdating, setSpacesUpdating] = useState(false)
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
	const [touched, setTouched] = useState<Record<string, boolean>>({})

	useEffect(() => {
		const errors: Record<string, string> = {}

		if (touched.address && !payload.address.trim()) {
			errors.address = 'Address is required'
		}

		if (touched.price) {
			if (!payload.price) errors.price = 'Price is required'
			else if (payload.price <= 0) errors.price = 'Price must be positive'
		}

		payload.spaces?.forEach((space, idx) => {
			if (touched[`space_size_${idx}`] && (!space.size || space.size <= 0)) {
				errors[`space_size_${idx}`] = 'Size must be positive'
			}
		})

		setFieldErrors(errors)
	}, [payload, touched])

	function addSpace() {
		setSpacesUpdating(true)
		setPayload(p => ({
			...p,
			spaces: [...(p.spaces || []), { type: 'bedroom', size: 100 } as Space],
		}))
		setTimeout(() => setSpacesUpdating(false), 300)
	}

	function removeSpace(idx: number) {
		setSpacesUpdating(true)
		setPayload(p => ({
			...p,
			spaces: (p.spaces || []).filter((_, i) => i !== idx),
		}))
		setTimeout(() => setSpacesUpdating(false), 300)
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault()

		const allTouched: Record<string, boolean> = {
			address: true,
			price: true,
		}
		payload.spaces?.forEach((_, idx) => {
			allTouched[`space_size_${idx}`] = true
		})
		setTouched(allTouched)

		const hasAddressError = !payload.address.trim()
		const hasPriceError = !payload.price || payload.price <= 0
		const hasSizeErrors = payload.spaces?.some(s => !s.size || s.size <= 0)

		if (hasAddressError || hasPriceError || hasSizeErrors) {
			setError('Please fix form errors before submitting')
			return
		}

		setSubmitting(true)
		setError(null)

		try {
			await createProperty(payload)
			navigate('/', { state: { success: 'Property created successfully' } })
		} catch (err: any) {
			setError(err?.response?.data?.error || err?.message || 'Error')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form
			onSubmit={onSubmit}
			className='bg-white rounded-2xl shadow p-4 flex flex-col gap-4 max-w-2xl'
		>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>Add Property</h2>
				<Link to='/' className='text-blue-600 hover:underline'>
					← Back to search
				</Link>
			</div>
			{error && (
				<div role='alert' className='text-red-600'>
					{error}
				</div>
			)}
			<label className='text-sm'>
				Address
				<input
					aria-label='Address'
					aria-invalid={!!fieldErrors.address}
					aria-describedby={fieldErrors.address ? 'address-error' : undefined}
					className={`block w-full border rounded px-2 py-1 ${
						fieldErrors.address ? 'border-red-500' : ''
					}`}
					value={payload.address}
					onChange={e => setPayload(p => ({ ...p, address: e.target.value }))}
					onBlur={() => setTouched(t => ({ ...t, address: true }))}
				/>
				{fieldErrors.address && (
					<p id='address-error' className='text-red-500 text-xs mt-1'>
						{fieldErrors.address}
					</p>
				)}
			</label>
			<label className='text-sm'>
				Type
				<select
					aria-label='Property type'
					className='block w-full border rounded px-2 py-1'
					value={payload.type}
					onChange={e =>
						setPayload(p => ({ ...p, type: e.target.value as any }))
					}
				>
					{PROP_TYPES.map(t => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
			</label>
			<label className='text-sm'>
				Price (USD)
				<input
					aria-label='Price'
					aria-invalid={!!fieldErrors.price}
					aria-describedby={fieldErrors.price ? 'price-error' : undefined}
					inputMode='numeric'
					className={`block w-full border rounded px-2 py-1 ${
						fieldErrors.price ? 'border-red-500' : ''
					}`}
					value={payload.price}
					onChange={e =>
						setPayload(p => ({ ...p, price: Number(e.target.value) }))
					}
					onBlur={() => setTouched(t => ({ ...t, price: true }))}
				/>
				{fieldErrors.price && (
					<p id='price-error' className='text-red-500 text-xs mt-1'>
						{fieldErrors.price}
					</p>
				)}
			</label>
			<label className='text-sm'>
				Description
				<textarea
					aria-label='Description'
					className='block w-full border rounded px-2 py-1'
					value={payload.description}
					onChange={e =>
						setPayload(p => ({ ...p, description: e.target.value }))
					}
				/>
			</label>

			<div className='flex items-center justify-between'>
				<h3 className='font-semibold flex items-center gap-2'>
					Spaces
					{spacesUpdating && <Spinner size='sm' />}
				</h3>
				<button
					type='button'
					onClick={addSpace}
					className='px-3 py-1 rounded border flex items-center gap-1'
				>
					+ Add space
				</button>
			</div>
			<div className='flex flex-col gap-3'>
				{(payload.spaces || []).map((s, idx) => (
					<div
						key={idx}
						className='border rounded p-3 grid grid-cols-1 md:grid-cols-3 gap-3'
					>
						<label className='text-sm'>
							Type
							<select
								aria-label='Space type'
								className='block w-full border rounded px-2 py-1'
								value={s.type}
								onChange={e => {
									const type = e.target.value as any
									setPayload(p => ({
										...p,
										spaces: (p.spaces || []).map((sp, i) =>
											i === idx ? { ...sp, type } : sp
										),
									}))
								}}
							>
								{SPACE_TYPES.map(t => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</label>
						<label className='text-sm'>
							Size (sqft)
							<input
								aria-label='Space size'
								aria-invalid={!!fieldErrors[`space_size_${idx}`]}
								aria-describedby={
									fieldErrors[`space_size_${idx}`]
										? `space-size-error-${idx}`
										: undefined
								}
								inputMode='numeric'
								className={`block w-full border rounded px-2 py-1 ${
									fieldErrors[`space_size_${idx}`] ? 'border-red-500' : ''
								}`}
								value={s.size}
								onChange={e => {
									const size = Number(e.target.value)
									setPayload(p => ({
										...p,
										spaces: (p.spaces || []).map((sp, i) =>
											i === idx ? { ...sp, size } : sp
										),
									}))
								}}
								onBlur={() =>
									setTouched(t => ({ ...t, [`space_size_${idx}`]: true }))
								}
							/>
							{fieldErrors[`space_size_${idx}`] && (
								<p
									id={`space-size-error-${idx}`}
									className='text-red-500 text-xs mt-1'
								>
									{fieldErrors[`space_size_${idx}`]}
								</p>
							)}
						</label>
						<label className='text-sm md:col-span-1 md:col-start-1 md:col-end-3'>
							Description
							<input
								aria-label='Space description'
								className='block w-full border rounded px-2 py-1'
								value={s.description || ''}
								onChange={e => {
									const description = e.target.value
									setPayload(p => ({
										...p,
										spaces: (p.spaces || []).map((sp, i) =>
											i === idx ? { ...sp, description } : sp
										),
									}))
								}}
							/>
						</label>
						<div className='flex items-end'>
							<button
								aria-label='Remove space'
								type='button'
								onClick={() => removeSpace(idx)}
								className='px-3 py-1 rounded border text-red-600'
							>
								Remove
							</button>
						</div>
					</div>
				))}
			</div>

			<div className='flex gap-3 items-center'>
				<button
					type='button'
					className='px-4 py-2 rounded border border-gray-300 hover:bg-gray-50'
					onClick={() => navigate('/')}
					disabled={submitting}
				>
					Cancel
				</button>
				<button
					disabled={submitting || Object.keys(fieldErrors).length > 0}
					className='px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none flex items-center gap-2'
					type='submit'
					aria-busy={submitting}
				>
					{submitting && <Spinner size='sm' />}
					{submitting ? 'Submitting…' : 'Create Property'}
				</button>
			</div>
		</form>
	)
}
