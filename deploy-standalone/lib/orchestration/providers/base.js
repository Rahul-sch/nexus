export class BaseProvider {
    apiKey;
    constructor(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('API key cannot be empty');
        }
        this.apiKey = apiKey;
    }
}
//# sourceMappingURL=base.js.map