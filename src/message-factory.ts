import { isRecordOf, PredicateType } from "./utils"

export type Message = {
	type: symbol
}

export function createMessageFactory(name: string) {
	const type = Symbol(name)
	const validator = (message: unknown): message is Message =>
		isRecordOf(message, "type") && message.type === type

	const creator = () => {
		return Object.freeze({
			type,
		})
	}

	return Object.freeze({
		get create() {
			return creator
		},
		get type() {
			return type
		},
		get validate() {
			return validator
		},
	})
}

/**
 * A Payload message is any message that contains additional data for a given message
 */
export type PayloadMessage<T = unknown> = Message & {
	payload: T
}

/**
 * Create a message factory capable of sending additional data on a message
 */
export function createPayloadMessageFactory<
	Validator extends (payload: unknown) => boolean,
	// We enforce the predicate as the return type because validator owns the type assersion
	Factory extends (...args: any[]) => PredicateType<Validator>,
>(name: string, payloadFactory: Factory, payloadValidator: Validator) {
	const messageFactory = createMessageFactory(name)
	const creator = (...args: Parameters<Factory>) => {
		const payload = payloadFactory.apply(null, args)

		if (!payloadValidator(payload)) {
			throw new Error("payload does not meet validator requirements")
		}

		return Object.freeze({
			...messageFactory.create(),
			...{
				payload,
			},
		})
	}
	const validator = (message: unknown): message is ReturnType<typeof creator> =>
		messageFactory.validate(message) &&
		isRecordOf(message, "payload") &&
		payloadValidator(message.payload)

	return Object.freeze({
		...messageFactory,
		...{
			get create() {
				return creator
			},
			get validate() {
				return validator
			},
		},
	})
}
