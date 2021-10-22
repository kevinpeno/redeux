/**
 * Returns true if the `thing` is a record that contains `keys` with a
 * value other than `undefined`
 */
export function isRecordOf<Keys extends (keyof (keyof Record<any, unknown>))[]>(
	thing: unknown,
	// rest arguments are used because it allows union of keys without the use of `as const` and other complexities
	...keys: Keys
): thing is Record<Keys[number], unknown> {
	return (
		typeof thing === "object" &&
		thing !== null &&
		keys.every(
			(key) =>
				// @ts-expect-error https://github.com/microsoft/TypeScript/issues/33205#issuecomment-528182920
				thing.hasOwnProperty(key) && typeof thing?.[key] !== "undefined",
		)
	)
}

export function isArrayOf<T extends (...x: any[]) => boolean>(
	thing: unknown,
	validator: T,
): thing is Array<PredicateType<T>> {
	return Array.isArray(thing) && thing.every(validator)
}

/**
 * For use to extract the predicate that has been set on a typeguard
 */
export type PredicateType<T extends (...x: any[]) => boolean> = T extends (
	target: any,
	...rest: any[]
) => target is infer P
	? P
	: never
