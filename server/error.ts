class APIError extends Error {
    public status: number;

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
