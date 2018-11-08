/**
 * Generic API error to return to the client
 *
 * Extends the standard error by adding an optional status code (default 500)
 */
class APIError extends Error {
    public status: number;

    /**
     * Create new instance of Error
     * @param message The error message
     * @param status The status code, defaults to 500
     */
    constructor(message: string, status?: number) {
        super(message);

        if (status) {
            this.status = status;
        } else {
            this.status = 500;
        }
    }
}

export default APIError;
