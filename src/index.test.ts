import { redeux } from "./index";

describe("redeux", () => {
	it("can be used like an array", () => {
		expect(redeux() instanceof Array).toEqual(true)
	})

	it("allows setting the initial queue state", () => {
		const event = {
			type: "@@REDEUX::TEST",
		}

		expect(redeux([ event ])).toContain(event)
	})

	it("allows dispatching a new message to the queue", () => {
		const queue = redeux()
		const event = {
			type: "@@REDEUX::TEST",
		}
		queue.push(event)
		expect(redeux([ event ])).toContain(event)
	})

	it("allows getting the current message queue", () => {
		const events = [{
			type: "@@REDEUX::TEST",
		}]

		expect(redeux(events)).toEqual(events)
	})
})
