/**
 * Returns true if the `thing` is a record that contains `keys` with a
 * value other than `undefined`
 */
export function isRecordOf<
	// `keyof any` is used because that's what `Record` uses for its keys and because it prevents `as const` and other complexities
	Keys extends Array<string | symbol>
>(
	thing: unknown,
	// rest arguments are used because it allows union of keys without the use of `as const` and other complexities
	...keys: Keys
): thing is Record<Keys[number], unknown> {
	return (
		typeof thing === 'object'
		&& thing !== null
		&& keys.every((key) => key in thing && typeof thing[key] !== 'undefined')
	)
}

/**
 * Attempts to force a localized flattening of cobbled together types merge/intersections
 */
export type Flatten<T> = {
	[k in keyof T]: T[k]
}

export type PredicateType<T extends (x: unknown) => boolean> = T extends (x: unknown) => x is infer P ? P : never
