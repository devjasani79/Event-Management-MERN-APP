const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

connectDb();

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins (change this to your frontend URL in production)
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Attach io instance to every request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
const eventRoutes = require("./routes/eventRoutes");
app.use("/api", eventRoutes); 

// Error Handling Middleware
app.use(errorHandler);

// Socket.io connection
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start the server using `server.listen`, NOT `app.listen`
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
