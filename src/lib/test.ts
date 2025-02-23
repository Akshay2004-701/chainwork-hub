import { taskApi } from './api';


(async () => {
    try {
        const newTask = {
            id: 3, // replace it with getCounter() function in contractService.ts
            title: "Build a Web3 Dashboard",
            description: "Create a responsive dashboard for cryptocurrency tracking",
            bounty: 1000, // Amount in your preferred currency/token
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            providerId: "0x1234567890abcdef", // Example wallet address
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