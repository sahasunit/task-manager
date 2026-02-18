import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const router = Router();

//get all tasks
router.get("/", async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const tasks = await prisma.task.findMany({
            where: {userId: req.userId},
        });

        return res.status(200).json(tasks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Something went wrong on server side"});
    }
})

//create a new task
router.post("/", async (req, res) => {
    try {
        const {title, description} = req.body;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!title) {
            return res.status(400).json({error: "Title is required"})
        }

        const task = await prisma.task.create({
            data: {
                title, 
                description,
                userId: req.userId
            }
        })

        return res.status(201).json({
            message: "Task created",
            task,
        })

    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({error: "Task already exists"});
        }
        console.error(error);
        return res.status(500).json({error: "Something went wrong on server side"});
    }
})

//update an existing task
router.patch("/:id", async (req, res) => {
    try {
        const {id: taskId} = req.params;
        const {title, description, status} = req.body;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!taskId) {
            return res.status(400).json({ message: "Task ID required" });
        }

        //validate status if provided
        const allowedStatus = ["todo", "in_progress", "done"];
        if (status && !allowedStatus.includes(status)){
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData: Prisma.TaskUpdateInput = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const task = await prisma.task.updateMany({
            where: {
                id: taskId,
                userId: req.userId
            },
            data: updateData
        })

        if (task.count === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const {id: taskId} = req.params;

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!taskId) {
            return res.status(400).json({ message: "Task ID required" });
        }

        const task = await prisma.task.deleteMany({
            where: {
                id: taskId,
                userId: req.userId
            }
        })

        if (task.count === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
    
})

export default router;