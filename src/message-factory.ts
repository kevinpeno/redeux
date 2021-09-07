import { Message } from ".";
import { isRecordOf } from "./utils";

export function createEmptyMessageFactory(name: string) {
	const type = Symbol(name)
	const validator = (message: unknown): message is Message =>
		isRecordOf(message, 'type') && message.type === type

	function messageFactory() {
		return {
			type,
		}
	}

	messageFactory.type = type
	messageFactory.validate = validator

	return messageFactory
}

/**
 * @todo fix output type
 * @todo fix validator assertion
 */
export function createPayloadMessageFactory<
	PayloadFactory extends (...args: unknown[]) => unknown,
	PayloadValidator extends (payload: unknown) => boolean
>(
	name: string,
	payloadFactory: PayloadFactory,
	payloadValidator: PayloadValidator
) {
	const basicFactory = createEmptyMessageFactory(name)

	function payloadMessageFactory(...args: Parameters<PayloadFactory>) {
		return Object.assign(basicFactory(), {
			payload: payloadFactory(args)
		})
	}

	return Object.assign(payloadMessageFactory, basicFactory, {
		validate: (message: unknown) =>
			basicFactory.validate(message)
			&& isRecordOf(message, 'payload')
			&& payloadValidator(message.payload)
	})
}
