export default function Spinner({
	size = 'md',
}: {
	size?: 'sm' | 'md' | 'lg'
}) {
	const sizeClasses = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-2',
		lg: 'w-12 h-12 border-4',
	}

	return (
		<div className='flex justify-center items-center py-2'>
			<div
				className={`${sizeClasses[size]} border-t-blue-600 border-blue-300 rounded-full animate-spin`}
				role='status'
				aria-label='Loading'
			/>
		</div>
	)
}
