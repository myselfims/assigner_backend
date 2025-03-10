import ActivityLog from "../db/activityLog.js";
import { Project } from "../db/project.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { subDays, format } from "date-fns"; // Import date-fns for handling dates

export const getWorkspaceActivityScore = asyncMiddleware(async (req, res) => {
    try {
        const { workspaceId } = req.params;

        // Get all projects in the workspace
        const projects = await Project.findAll({
            where: { workspaceId },
            attributes: ["id", "name"],
        });

        if (!projects.length) {
            return res.status(404).json({ error: "No projects found in this workspace" });
        }

        // Get all activity logs in the workspace
        const activityLogs = await ActivityLog.findAll({
            where: { projectId: projects.map(p => p.id) },
            attributes: ["projectId", "createdAt"],
        });

        // Step 1: Generate full month days list
        const today = new Date();
        const daysInMonth = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd")).reverse();

        // Step 2: Create a data map with all days set to 0 initially
        const dataMap = new Map(daysInMonth.map(day => [day, { day }]));

        // Step 3: Process activity logs & count activity per day
        activityLogs.forEach(log => {
            const day = format(new Date(log.createdAt), "yyyy-MM-dd");
            if (!dataMap.has(day)) return;

            const project = projects.find(p => p.id === log.projectId);
            if (project) {
                dataMap.get(day)[project.name] = (dataMap.get(day)[project.name] || 0) + 1;
            }
        });

        // Step 4: Convert Map to Array (chartData)
        const chartData = Array.from(dataMap.values()).map(entry => ({
            ...entry,
            ...projects.reduce((acc, proj) => ({ ...acc, [proj.name]: entry[proj.name] || 0 }), {})
        }));

        return res.json(chartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});


