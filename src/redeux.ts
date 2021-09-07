import { Message } from './message-factory'

export function redeux(initialQueue?: ConstructorParameters<typeof Redeux>[0]) {
  return new Redeux(initialQueue)
}

type Observer = (messages: readonly Message[], dispatch: Redeux['push']) => void

export class Redeux {
  #queue = new Set<Message>()
  #observers = new Map<symbol, Observer>()

  constructor(initialQueue: Message[] = []) {
    initialQueue.forEach((message) => this.push(message))
  }

  /**
   * Returns a copy of the current queue
   */
  entries() {
    return Object.freeze(Array.from(this.#queue.values()))
  }

  /**
   * push a new message onto the queue
   */
  push(message: Message) {
    this.#queue.add(
      Object.freeze(message)
    )
  }

  /**
   * Flush the current message queue to all observers
   */
  flush() {
    const currentStack = this.entries()
    this.#queue.clear()
    this.#observers.forEach((observer) =>
      observer(currentStack, this.push.bind(this))
    )
  }

  /**
   * Attach an observer to listen in on messages sent to the queue
   */
  subscribe(observerId: symbol, observer: Observer) {
    this.#observers.set(observerId, observer)
  }

  /**
   * Remove a previously attached observer
   */
  unsubscribe(observerId: symbol) {
    this.#observers.delete(observerId)
  }
}
