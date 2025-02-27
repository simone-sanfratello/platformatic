import fastify from "fastify";

export function create () {
    const app = fastify()

    globalThis.platformatic.setCustomHealthCheck(async () => {
        // ...
        return true
    })
    
    app.get('/', (req, res) => {
        res.send('Hello World')
    })

    return app
}