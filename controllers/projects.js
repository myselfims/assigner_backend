import Joi from "joi";
import { User, Project, UserProjects } from '../db/models.js';
import { asyncMiddleware } from "../middlewares/async.js";

User.associate({ Project });
Project.associate({ User });

export const addProject = asyncMiddleware( async (req, res)=>{
    const schema = Joi.object({
        name : Joi.string().required(),
        lead : Joi.number().required(),
        startDate : Joi.date().required(),
        status : Joi.string(),
        priority : Joi.string(),
        budget : Joi.number(),
        deadline : Joi.date(),
        description : Joi.string()
    })

    const {error} = schema.validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({where:{id:req.body.lead}})
    if (!user) return res.status(400).send('User not found! ')
        let body = req.body;

    Project.create({
        name: body.name, // or whatever fields you have in your model
        lead: body.lead,
        teamSize: body.teamSize,
        startDate: body.startDate,
        status: body.status,
        budget: body.budget,
        deadline: body.deadline,
        priority: body.priority,
        description: body.description, // Example for a description field
        createdBy : req.user.id
        // Add other fields as necessary based on your model
    })
    .then(project => {
        res.status(201).json(project); // Respond with the newly created project
    })
    .catch(err => {
        // Handle error
        res.status(500).json({ error: err.message });
    });
    
})



export const getProjects = asyncMiddleware(async (req, res) => {
    try {
        const userId = req.user.id;

        const userProjects = await User.findOne({
            where: { id: userId },
            include: [
                { model: Project, as: 'createdProjects' }, // Projects created by the user
                { model: Project, as: 'assignedProjects' }, // Projects assigned to the user
            ],
        });

        if (!userProjects) {
            return res.status(404).json({ message: 'No projects found for this user.' });
        }

        // Helper function to get team size for a project
        const getTeamSize = async (projectId) => {
            // Get the number of users assigned to this project from the UserProjects table
            const teamCount = await UserProjects.count({ where: { projectId } });
            return teamCount; // This will be the team size
        };

        // Combine created and assigned projects
        const projects = [
            ...userProjects.createdProjects.map(async (project) => {
                const teamSize = await getTeamSize(project.id);
                return {
                    ...project.toJSON(), // Converts sequelize model to plain object
                    role: 'Created by You',
                    teamSize: teamSize + 1, // Add 1 for the creator
                };
            }),
            ...userProjects.assignedProjects.map(async (project) => {
                const teamSize = await getTeamSize(project.id);
                return {
                    ...project.toJSON(),
                    role: 'Assigned to You',
                    teamSize: teamSize,
                };
            }),
        ];

        // Wait for all async operations to complete
        const resolvedProjects = await Promise.all(projects);

        // Respond with the combined projects
        res.status(200).json(resolvedProjects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
