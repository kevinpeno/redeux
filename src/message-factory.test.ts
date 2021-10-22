import {
	createMessageFactory,
	createPayloadMessageFactory,
} from "./message-factory"

describe("createMessageFactory", () => {
	it("emits a an object that can be used for managing messages", () => {
		const messageFactory = createMessageFactory("@@REDEUX::TEST")

		expect(messageFactory).toMatchInlineSnapshot(`
		Object {
		  "create": [Function],
		  "type": Symbol(@@REDEUX::TEST),
		  "validate": [Function],
		}
	`)
	})
	it("sets the message type to a symbol containing the friendly name", () => {
		const message = createMessageFactory("@@REDEUX::TEST").create()

		expect(message.type).toMatchInlineSnapshot(`Symbol(@@REDEUX::TEST)`)
	})
	it("provides an accessor that can be used to uniquely identify the message type across calls", () => {
		const messageFactory = createMessageFactory("@@REDEUX::TEST")
		const message1 = messageFactory.create()
		const message2 = messageFactory.create()

		expect(message1.type).toBe(messageFactory.type)
		expect(message2.type).toBe(messageFactory.type)
	})
	describe("validation", () => {
		it("will validate an unknown message to determine if it was created by this factory", () => {
			const messageFactory = createMessageFactory("@@REDEUX::TEST")
			const message = messageFactory.create()

			expect(messageFactory.validate(message)).toBe(true)
		})
		it("will fail validation if the message is not an object", () => {
			const messageFactory = createMessageFactory("@@REDEUX::TEST")
			const message = false
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message does not contain a `type` attribute", () => {
			const messageFactory = createMessageFactory("@@REDEUX::TEST")
			const message = {
				something: false,
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message `type` attribute does not match the factory's type", () => {
			const messageFactory = createMessageFactory("@@REDEUX::TEST")
			const message = {
				type: "@@REDEUX::TEST",
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message `type` attribute does not match the expected type", () => {
			const messageFactory = createMessageFactory("@@REDEUX::TEST")
			const message = {
				type: Symbol("@@REDEUX::TEST"),
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
	})
})

describe("createPayloadMessageFactory", () => {
	it("emits a an object that can be used for managing messages", () => {
		const payloadFactory = () => true
		const payloadValidator = (_payload: unknown): _payload is boolean => true
		const messageFactory = createPayloadMessageFactory(
			"@@REDEUX::TEST",
			payloadFactory,
			payloadValidator,
		)

		expect(messageFactory).toMatchInlineSnapshot(`
		Object {
		  "create": [Function],
		  "type": Symbol(@@REDEUX::TEST),
		  "validate": [Function],
		}
	`)
	})
	it("provides the ability to pass in a payload factory for setting data on the message", () => {
		const payloadFactory = () => true
		const payloadValidator = (_payload: unknown): _payload is boolean => true
		const messageFactory = createPayloadMessageFactory(
			"@@REDEUX::TEST",
			payloadFactory,
			payloadValidator,
		)

		expect(messageFactory.create()).toMatchInlineSnapshot(`
			Object {
			  "payload": true,
			  "type": Symbol(@@REDEUX::TEST),
			}
		`)
	})
	it("allows the payload factory to accept parameters with type safety", () => {
		const payloadFactory = (setMe: boolean, notSet: null) => {
			return setMe ? "set" : notSet
		}

		const payloadValidator = (
			_payload: unknown,
		): _payload is ReturnType<typeof payloadFactory> => true
		const messageFactory = createPayloadMessageFactory(
			"@@REDEUX::TEST",
			payloadFactory,
			payloadValidator,
		)

		// @ts-expect-error Expected 2 arguments, but got 0.ts(2554)
		const _notEnoughParams = messageFactory.create()
		// @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'boolean'.ts(2345)
		const _improperParams1 = messageFactory.create("string", "string")
		// @ts-expect-error Argument of type '"string"' is not assignable to parameter of type 'null'.ts(2345)
		const _improperParams2 = messageFactory.create(true, "string")
		// @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'boolean'.ts(2345)
		const _improperParams3 = messageFactory.create("string", null)

		const goodMessage = messageFactory.create(false, null)

		expect(goodMessage).toMatchInlineSnapshot(`
			Object {
			  "payload": null,
			  "type": Symbol(@@REDEUX::TEST),
			}
		`)
	})
	it("will throw an error on `create` when payload factory does not match validator requirements", () => {
		const payloadFactory = () => true
		const payloadValidator = (payload: unknown): payload is string =>
			typeof payload === "string"
		const messageFactory = createPayloadMessageFactory(
			"@@REDEUX::TEST",
			// @ts-expect-error want a runtime check to enforce as well
			payloadFactory,
			payloadValidator,
		)

		expect(messageFactory.create).toThrowErrorMatchingInlineSnapshot(
			`"payload does not meet validator requirements"`,
		)
	})
	describe("validation", () => {
		it("will validate an unknown message against a payload validator", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = messageFactory.create()

			expect(messageFactory.validate(message)).toBe(true)
		})
		it("will fail validation if the message is not an object", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)
			const message = false

			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message does not contain a `type` attribute", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = {
				something: false,
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message `type` attribute does not match the factory's type", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = {
				type: "@@REDEUX::TEST",
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail validation if the message `type` attribute does not match the expected type", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = {
				type: Symbol("@@REDEUX::TEST"),
			}
			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail to validate an unknown message if `payload` is missing", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = {
				type: messageFactory.type,
			}

			expect(messageFactory.validate(message)).toBe(false)
		})
		it("will fail to validate an unknown message if `payload` is rejected by payload validator", () => {
			const payloadFactory = () => false
			const payloadValidator = (payload: unknown): payload is boolean =>
				typeof payload === "boolean"
			const messageFactory = createPayloadMessageFactory(
				"@@REDEUX::TEST",
				payloadFactory,
				payloadValidator,
			)

			const message = {
				type: messageFactory.type,
				payload: "true",
			}

			expect(messageFactory.validate(message)).toBe(false)
		})
	})
})
