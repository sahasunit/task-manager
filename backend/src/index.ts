import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use("/auth", authRoutes);

app.get("/health", (_, res) => {
    res.json({status: "ok"})
});

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
})