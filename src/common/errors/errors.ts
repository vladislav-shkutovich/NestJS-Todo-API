export class NotFoundError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = this.constructor.name
  }
}

export class ValidationError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = this.constructor.name
  }
}
