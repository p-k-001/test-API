const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { body, validationResult } = require("express-validator");

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
  // { id: 1, name: "John Doe", email: "john@example.com", age: 20, role: "admin" },
  // { id: 2, name: "Jane Smith", email: "jane@example.com", age: 31, role: "guest" },
  // { id: 2, name: "Adam Black", email: "adam@example.com", age: 15, role: "user" },
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   role:
 *                     type: string
 *                     enum: [admin, user]
 *                   adult:
 *                     type: boolean
 *                     description: Whether the user is an adult (18+)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *                   enum: [admin, user]
 *                 adult:
 *                   type: boolean
 *                   description: Whether the user is an adult (18+)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
 *               - age
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 125
 *                 description: User's age (0-125)
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: User's role (must be either admin or user)
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 adult:
 *                   type: boolean
 *                   description: Whether the user is an adult (18+)
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 */
app.post(
  "/users",
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email format is required"),
    body("age")
      .isInt({ min: 0, max: 125 })
      .withMessage("Age must be between 0 and 125"),
    body("role")
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = getNextId();

    const newUser = {
      id: id,
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      role: req.body.role,
      adult: isAdult(req.body.age),
    };
    users.push(newUser);
    return res.status(201).json(newUser);
  }
);

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
 *                 description: User's full name (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional)
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 125
 *                 description: User's age (0-125) (optional)
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: User's role (admin or user) (optional)
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *               age: 30
 *               role: user
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 adult:
 *                   type: boolean
 *                   description: Whether the user is an adult (18+)
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */

app.put(
  "/users/:id",
  [
    body("name")
      .optional({ checkFalsy: true })
      .isString()
      .notEmpty()
      .withMessage("Name is required"),
    body("email")
      .optional({ checkFalsy: true })
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email format is required"),
    body("age")
      .optional({ nullable: true })
      .isInt({ min: 0, max: 125 })
      .withMessage("Age must be between 0 and 125"),
    body("role")
      .optional({ checkFalsy: true })
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = users.find((u) => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.age !== undefined) user.age = req.body.age;
    if (req.body.role !== undefined) user.role = req.body.role;
    user.adult = isAdult(user.age);

    return res.json(user);
  }
);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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

/**
 * @openapi
 * /next-id:
 *   get:
 *     summary: Get next id
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 next-id:
 *                   type: integer
 */
app.get("/next-id", (req, res) => {
  res.json({ "next-id": getNextId() });
});

const getNextId = () => {
  return users.length > 0 ? users[users.length - 1].id + 1 : 1;
};

const isAdult = (age) => {
  return age >= 18;
};

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
