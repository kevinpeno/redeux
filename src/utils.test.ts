import { isRecordOf } from "./utils"

describe('typeUtils/typeGuards.ts', () => {
	describe('isRecordOf', () => {
		it('returns true when all keys are defined on the supplied argument', () => {
			const thing = {
				a: 'some value',
				b: true,
			}
			expect(isRecordOf(thing, 'a', 'b')).toBe(true)
		})
		it('returns false if argument is not an object', () => {
			expect(isRecordOf(false, 'a')).toBe(false)
			expect(isRecordOf('bad string', 'a')).toBe(false)
			expect(isRecordOf(9000, 'a')).toBe(false)
			expect(isRecordOf(Symbol('some symbol'), 'a')).toBe(false)
		})
		it('returns false if argument an object of `null`', () => {
			expect(isRecordOf(null, 'a')).toBe(false)
		})
		it('returns false if argument does not contain all keys', () => {
			const thing = {
				b: true,
			}
			expect(isRecordOf(thing, 'a', 'b')).toBe(false)
		})
		it('returns false if argument containing keys has a key with the value of `undefined`', () => {
			const thing = {
				a: undefined,
			}
			expect(isRecordOf(thing, 'a')).toBe(false)
		})
	})
})
