import Joi from "joi";
import { User } from "../db/user.js";
import { Project } from "../db/project.js";
import { UserProject } from "../db/userProject.js";
import { Status } from "../db/status.js";
import { asyncMiddleware } from "../middlewares/async.js";
import { defaultStatuses } from "../config/globalConfig.js";
import { where } from "sequelize";
import { Role } from "../db/roleAndDesignation.js";


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

    const project = await Project.create({
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

    const statusPromises = defaultStatuses.map((status) =>
      Status.create({ name: status, projectId: project.id })
    );

    await Promise.all(statusPromises);

    res.status(201).json({
      message: "Project created successfully with default statuses.",
      project,
    });


    
})


export const getStatuses = async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const statuses = await Status.findAll({
        where: { projectId },
        attributes: ["id", "name"],
      });
  
      res.status(200).json(statuses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  export const updateStatuses = async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const statuses = req.body.statuses;
  
      if (!Array.isArray(statuses)) {
        return res.status(400).json({ message: "Invalid statuses format." });
      }
  
      // Iterate over statuses and handle updates or creations
      for (let status of statuses) {
        if (status.id) {
          // Update existing status
          const existingStatus = await Status.findOne({ where: { id: status.id, projectId } });
  
          if (existingStatus) {
            await existingStatus.update({ name: status.name, isDefault: status.isDefault });
          } else {
            return res.status(404).json({ message: `Status with id ${status.id} not found.` });
          }
        } else {
          // Create new status if it doesn't have an ID
          await Status.create({ name: status.name, projectId });
        }
      }
  
      // Fetch updated statuses to return
      const updatedStatuses = await Status.findAll({ where: { projectId } });
  
      res.status(200).json(updatedStatuses);
    } catch (err) {
      console.error("Error updating statuses:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  export const getTeamMembers = asyncMiddleware(async (req, res) => {
    try {
      const { projectId } = req.params;
  
      // Fetch user projects and include the associated user object
      const userProjects = await UserProject.findAll({
        where: { projectId, status:'active' },
        include: [
          {
            model: User, // The associated User model
            as: 'user', // Alias used for the association
            attributes: { exclude: ['password'] }, // Exclude sensitive fields like password
          },
          {
            model: Role, // The associated User model
            as: 'role', // Alias used for the association
          },
        ],
        raw: true, // Flatten the result
        nest: false, // Avoid nested objects
      });

      console.log(userProjects)

      const result = userProjects.map((item) => {
        const flattenedItem = { ...item }; // Copy all keys
        // Merge keys prefixed with `user.` into the main object
        Object.keys(flattenedItem).forEach((key) => {
          if (key.startsWith('user.')) {
            const newKey = key.replace('user.', ''); // Remove `user.` prefix
            flattenedItem[newKey] = flattenedItem[key]; // Add new key
            delete flattenedItem[key]; // Remove old `user.` key
          }
        });
        return flattenedItem;
      });
  
      console.log('User projects are:', result);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'An error occurred while fetching team members' });
    }
  });


  export const updateMember = asyncMiddleware(async (req, res) => {
    try {
      const { projectId, userId } = req.params;
      const {roleId} = req.body;
  
      // Fetch user projects and include the associated user object
      const userProject = await UserProject.findOne({
        where: { projectId, userId }
      });

      userProject.status = 'active'
      userProject.roleId = parseInt(roleId);
      userProject.save()
      
      res.status(200).json(userProject);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'An error occurred while fetching team members' });
    }
  });
  


export const getProjects = asyncMiddleware(async (req, res) => {
    try {
        const userId = req.user.id;

        const createdProjects = await Project.findAll({
            where: { createdBy : userId },
            include: {
              model: User,
              as: "leadUser", // Fetch the lead details
              attributes: ["id", "name", "email"], // Only select necessary fields
            },
        });
        const assignedProjects = await UserProject.findAll({
          where: { userId },
          include: {
            model: Project,
            as : 'project'
          },
        });
        
        if (!createdProjects) {
            return res.status(404).json({ message: 'No projects found for this user.' });
        }

        console.log(createdProjects)

        // Helper function to get team size for a project
        const getTeamSize = async (projectId) => {
            // Get the number of users assigned to this project from the UserProject table
            const teamCount = await UserProject.count({ where: { projectId } });
            return teamCount; // This will be the team size
        };

        // Combine created and assigned projects
        const projects = [
            ...createdProjects.map(async (project) => {
                const teamSize = await getTeamSize(project.id);
                return {
                    ...project.toJSON(), // Converts sequelize model to plain object
                    role: 'Created by You',
                    teamSize: teamSize + 1, // Add 1 for the creator
                };
            }),
            ...assignedProjects.map(async ({project}) => {
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

export const getSingleProject = asyncMiddleware(async (req, res) => {
  try {
      const userId = req.user.id;
      const { projectId } = req.params;

      // Check if the user is the creator of the project
      const createdProject = await Project.findOne({
          where: { id: projectId, createdBy: userId },
      });

      // Check if the user is assigned to the project
      const assignedProject = await UserProject.findOne({
          where: { userId, projectId },
          include: {
              model: Project,
              as: 'project',
          },
      });

      // If the user has no access to the project
      if (!createdProject && !assignedProject) {
          return res.status(403).json({ message: 'Access denied to this project.' });
      }

      // Get the project details
      const project = createdProject ? createdProject : assignedProject.project;

      // Get team size for the project
      const teamSize = await UserProject.count({ where: { projectId } });

      // Respond with project details
      res.status(200).json({
          ...project.toJSON(),
          role: createdProject ? 'Created by You' : 'Assigned to You',
          teamSize: createdProject ? teamSize + 1 : teamSize,
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
  }
});
