
import { taskApi } from './api';

(async () => {
    try {
        const newTask = {
            title: "Build a Web3 Dashboard",
            description: "Create a responsive dashboard for cryptocurrency tracking",
            bounty: 1000,
            // Fixed: Convert deadline to proper Date object
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            providerId: "0x1234567890abcdef",
            category: "Web Development",
            skills: ["React", "TypeScript", "Web3.js", "Smart Contracts"],
            attachments: ["https://example.com/project-specs.pdf"]
        };

        const createdTask = await taskApi.createTask(newTask);
        console.log('Successfully created task:', createdTask);

        // Verify the task was created by fetching it
        const fetchedTask = await taskApi.getTask(createdTask.id);
        console.log('Fetched created task:', fetchedTask);
    } catch (error) {
        console.error('Error in task operations:', error);
    }
})();
