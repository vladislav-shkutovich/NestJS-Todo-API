export class NotFoundError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = this.constructor.name
  }
}

export class ConflictError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = this.constructor.name
  }
}

export class BadRequestError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = this.constructor.name
  }
}
