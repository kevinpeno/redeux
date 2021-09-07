import { Message, redeux } from "./index";

const reduxTest = (name = "@@REDEUX::TEST") => ({
	type: Symbol(name),
});

describe("redeux", () => {
	describe("queue", () => {
		it("can return the current stack as an array", () => {
			const queue = redeux();
			expect(queue.entries()).toMatchInlineSnapshot(`Array []`);
		});

		it("allows setting the initial state", () => {
			const message = reduxTest();
			const queue = redeux([message]);
			expect(queue.entries()).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "type": Symbol(@@REDEUX::TEST),
			  },
			]
		`);
		});

		it("allows pushing a new message onto the stack", () => {
			const queue = redeux();
			const message = reduxTest();
			queue.push(message);
			expect(queue.entries()).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "type": Symbol(@@REDEUX::TEST),
			  },
			]
		`);
		});

		it("clears the queue when flushed", () => {
			const queue = redeux();
			const message = reduxTest();
			queue.push(message);
			queue.flush();
			expect(queue.entries()).toMatchInlineSnapshot(`Array []`);
		});
	});

	describe("observer", () => {
		it("can listen for messages when subscribed to the queue", () => {
			const queue = redeux();
			const observerCreator = () => {
				let observedMessages = [];
				function observer(messages: readonly Message[]) {
					observedMessages = observedMessages.concat(messages);
				}

				observer.getAllMessages = () => observedMessages;
				return observer;
			};

			const observer = observerCreator();
			queue.subscribe(Symbol("@@REDEUX::TEST::OBSERVER"), observer);
			queue.push(reduxTest());
			queue.flush();

			expect(observer.getAllMessages()).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "type": Symbol(@@REDEUX::TEST),
			  },
			]
		`);
		});

		it("can be unsubscribed and will no longer receive messages", () => {
			const queue = redeux();
			const observerId = Symbol("@@REDEUX::TEST::OBSERVER")
			const observerCreator = () => {
				let observedMessages = [];
				function observer(messages: readonly Message[]) {
					observedMessages = observedMessages.concat(messages);
				}

				observer.getAllMessages = () => observedMessages;
				return observer;
			};

			const observer = observerCreator();
			queue.subscribe(observerId, observer);
			queue.unsubscribe(observerId);
			queue.push(reduxTest());
			queue.flush();

			expect(observer.getAllMessages()).toMatchInlineSnapshot(`Array []`);
		})

		it("can push new messages onto the queue during processing", () => {
			const queue = redeux();
			const observer = (messages: readonly Message[], dispatch: (message: Message) => void) => {
				dispatch(reduxTest("@@REDEUX::TEST::OBSERVER_MESSAGE"))
			};

			queue.subscribe(Symbol("@@REDEUX::TEST::OBSERVER"), observer);
			queue.push(reduxTest("@@REDEUX::TEST::INITIAL_MESSAGE"));
			queue.flush();

			expect(queue.entries()).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "type": Symbol(@@REDEUX::TEST::OBSERVER_MESSAGE),
			  },
			]
		`);
		})
	});
});
