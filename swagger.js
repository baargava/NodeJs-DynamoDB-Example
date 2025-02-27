const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My Node.js API",
            version: "1.0.0",
            description: "API documentation for my Express.js application",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
    },
    apis: ["./routes/*.js"], // Path to API route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
