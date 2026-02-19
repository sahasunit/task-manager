import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
}

const Task = ({onLogout}: {onLogout: () => void}) => {
    const [tasks, setTasks]= useState<Task[]>([]);

    const intialTaskData = {
        title: "",
        description: "",
    }

    const [taskData, setTaskData] = useState(intialTaskData);
    const [isCreating, setIsCreating] = useState(false);

    const updateTaskData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        setTaskData((prev) =>({ 
            ...prev,
            [name]: value
        }))
    };


    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await apiFetch("/tasks");
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    }

    const createTask = async () => {
        if(!taskData.title.trim()) return;

        setIsCreating(true);

        try {
            const title = taskData.title;
            const description = taskData.description;

            await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify({title, description}),
            })

            setTaskData(intialTaskData);

            await loadTasks();

        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    }

    const deleteTask = async (id: string) => {
        try {
            await apiFetch(`/tasks/${id}`, {
                method: "DELETE"
            });
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error(error);
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            await apiFetch(`/tasks/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });

            setTasks((prev) => 
                prev.map((t) => 
                    t.id === id ? {...t, status} : t
                )
            );
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div
            style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}
        >
            <button onClick={onLogout}>Logout</button>
            <div>
                <h1>Create New Task</h1>
                <div>
                    <label htmlFor="title">Title</label>
                    <input 
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={taskData.title}
                        onChange={updateTaskData}
                        placeholder="New task title"
                        style={{
                            marginLeft: 8
                        }}
                    />
                </div>
                <div
                    style={{
                        marginTop: 8
                    }}
                >
                    <label htmlFor="description">Description</label>
                    <input 
                        id="description"
                        name="description"
                        type="text"
                        value={taskData.description}
                        onChange={updateTaskData}
                        placeholder="What's the task about?"
                        style={{
                            marginLeft: 8
                        }}
                    />
                </div>
                <button 
                    onClick={createTask}
                    disabled={isCreating || !taskData.title.trim()}
                    style={{
                        marginTop: 8
                    }}
                >
                    {isCreating ? "Creating..." : "Add"}
                </button>
            </div>
            <div>
                <h2>Your Tasks</h2>
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <strong>{task.title}</strong>
                            <p>{task.description}</p>
                            <select
                                value={task.status}
                                onChange={(e) => updateStatus(task.id, e.target.value)}
                                style={{
                                    display: "block",
                                    marginRight: 10
                                }}
                            >
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                            <button 
                                onClick={() => deleteTask(task.id)}
                                style={{
                                    marginTop: 8,
                                    marginBottom: 8
                                }}
                            >Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Task;