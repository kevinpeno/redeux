import { expectType, TypeEqual } from "ts-expect"
import { isArrayOf, isRecordOf, PredicateType } from "./utils"

describe("utils", () => {
	describe("isRecordOf", () => {
		it("returns false if argument is not an object", () => {
			expect(isRecordOf(false, "a")).toBe(false)
			expect(isRecordOf("bad string", "a")).toBe(false)
			expect(isRecordOf(9000, "a")).toBe(false)
			expect(isRecordOf(Symbol("some symbol"), "a")).toBe(false)
		})
		it("returns false if argument a `null` object", () => {
			expect(isRecordOf(null, "a")).toBe(false)
		})
		it("returns false if argument does not contain all keys", () => {
			const thing = {
				b: true,
			}
			expect(isRecordOf(thing, "a", "b")).toBe(false)
		})
		it("returns false if argument containing keys has a key with the value of `undefined`", () => {
			const thing = {
				a: undefined,
			}
			expect(isRecordOf(thing, "a")).toBe(false)
		})
		it("returns true when all keys are defined on the supplied argument", () => {
			const thing = {
				a: "some value",
				b: true,
			}
			expect(isRecordOf(thing, "a", "b")).toBe(true)
		})
	})
	describe("isArrayOf", () => {
		it("returns false if any item in the array fails to meet validator conditions", () => {
			const validator = () => false
			const things = [1]
			expect(isArrayOf(things, validator)).toBe(false)
		})
		it("returns true if the array is empty regardless of validator conditions", () => {
			const validator = () => false
			const things: unknown[] = []
			expect(isArrayOf(things, validator)).toBe(true)
		})
		it("returns true if every item in the array meets the validator conditions", () => {
			const validator = (i: number) => i < 20
			const things = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			expect(isArrayOf(things, validator)).toBe(true)
		})
		it("will guard into the type predicate provided by the validator if all elements meet validator requirements", () => {
			type ExpectedType = number
			const validator = (x: unknown): x is ExpectedType => Number.isInteger(x)
			const things: unknown[] = [1, 2, 3]
			const testFn = jest.fn()

			// @ts-expect-error `type 'unknown' is not assignable to type 'number'.ts(2345)`
			expectType<ExpectedType[]>(things)

			if (isArrayOf(things, validator)) {
				expectType<ExpectedType[]>(things)
				testFn()
			}

			expect(testFn).toHaveBeenCalled()
		})
	})
	describe("PredicateType", () => {
		it("returns a basic predicate", () => {
			const predicateFn = (thing: unknown): thing is boolean =>
				typeof thing === "boolean"
			type Results = TypeEqual<PredicateType<typeof predicateFn>, boolean>

			expect(expectType<Results>(true)).toEqual(expectType(null))
		})
		it("returns a complex predicate", () => {
			const predicateFn = (thing: {
				type: string
			}): thing is typeof thing & { payload: unknown } => "payload" in thing
			type Results = TypeEqual<
				PredicateType<typeof predicateFn>,
				{ type: string } & { payload: unknown }
			>

			expect(expectType<Results>(true)).toEqual(expectType(null))
		})
		it("returns predicate even if more arguments are supplied", () => {
			const predicateFn = (thing: unknown, _other: any): thing is boolean =>
				typeof thing === "boolean"
			type Results = TypeEqual<PredicateType<typeof predicateFn>, boolean>

			expect(expectType<Results>(true)).toEqual(expectType(null))
		})
		it("returns never if a predicate is not found", () => {
			const predicateFn = (_: any) => true
			type Results = TypeEqual<PredicateType<typeof predicateFn>, never>

			expect(expectType<Results>(true)).toEqual(expectType(null))
		})
		it("returns never if predicate is not based on the first argument", () => {
			const predicateFn = (_thing: unknown, other: unknown): other is boolean =>
				typeof other === "boolean"
			type Results = TypeEqual<PredicateType<typeof predicateFn>, never>

			expect(expectType<Results>(true)).toEqual(expectType(null))
		})
		it("throws a type error if use with asset definitions", () => {
			const testAssert = (thing: unknown): asserts thing is false => {
				if (typeof thing === "boolean" && thing === false) {
					throw new Error("why you giving me falsy things?")
				}
			}

			type Results = TypeEqual<
				// @ts-expect-error `Type '(thing: unknown) => asserts thing is false' does not satisfy the constraint '(...x: any[]) => boolean'. ts(2344)`
				PredicateType<typeof testAssert>,
				false
			>

			expect(expectType<Results>(false)).toEqual(expectType(null))
		})
	})
})
