const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://test-api-ui-teal.vercel.app",
];

app.use(bodyParser.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
  },
  apis: ["./api/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.get("/api-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let users = [
  // { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
  // { id: 2, name: "Jane Smith", email: "jane@example.com", role: "guest" },
  // { id: 2, name: "Adam Black", email: "adam@example.com", role: "user" },
];

/**
 * @openapi
 * /hello:
 *   get:
 *     summary: testing service
 *     responses:
 *       200:
 *         description: returns greeting
 */
app.get("/hello", (req, res) => {
  res.json({ message: "Hello, API Testing!" });
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/users", (req, res) => {
  res.json(users);
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
app.get("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */
app.post("/users", (req, res) => {
  const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;

  console.log(id);
  const newUser = {
    id: id,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;

  res.json(user);
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
app.delete("/users/:id", (req, res) => {
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex === -1)
    return res.status(404).json({ message: "User not found" });

  users.splice(userIndex, 1);
  res.status(204).send();
});

/**
 * @openapi
 * /users:
 *   delete:
 *     summary: Delete all users
 *     responses:
 *       204:
 *         description: All users deleted
 */
app.delete("/users", (req, res) => {
  users = [];
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
