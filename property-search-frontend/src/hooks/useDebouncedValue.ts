import { useEffect, useState, useRef } from 'react'

export default function useDebouncedValue<T>(value: T, delay = 300) {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)
	const firstRender = useRef(true)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false
			return
		}

		timeoutRef.current = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [value, delay])

	return debouncedValue
}
