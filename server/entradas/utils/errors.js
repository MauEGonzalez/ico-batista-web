export class HttpError extends Error {
  constructor(status, message, code, data) {
    super(message);
    this.status = status;
    this.code = code || null;
    this.data = data || null;
  }
}
