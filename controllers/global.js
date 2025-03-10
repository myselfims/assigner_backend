import { asyncMiddleware } from "../middlewares/async.js";
import { AccountType } from "../db/accountType.js";
import { Industry } from "../db/industry.js";
import { Role } from "../db/roleAndDesignation.js";
import { Request } from "../db/request.js";
import { User } from "../db/user.js";
import Workspace from "../db/workspace.js";
import { UserWorkspace } from "../db/userWorkspace.js";
import { createNotifications } from "../services/notificationService.js";


export const getAccountTypes = asyncMiddleware(async (req, res) => {
    try {
  
      // Fetch account types associated with the projectId
      const types = await AccountType.findAll();
  
      // Check if any account types were found
      if (types.length === 0) {
        return res.status(404).send("No account types found for the given project.");
      }
  
      // Send the account types to the client
      res.send(types);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send("An error occurred while fetching account types.");
    }
  });

export const getRoles = asyncMiddleware(async (req, res) => {
    try {
  
      // Fetch account types associated with the projectId
      const roles = await Role.findAll();
  
      // Check if any account types were found
      if (roles.length === 0) {
        return res.status(404).send("No account types found for the given project.");
      }
  
      // Send the account types to the client
      res.send(roles);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send("An error occurred while fetching account types.");
    }
  });

export const getIndustries = asyncMiddleware(async (req, res) => {
    try {
  
      // Fetch account types associated with the projectId
      const industries = await Industry.findAll();
  
      // Check if any account types were found
      if (industries.length === 0) {
        return res.status(404).send("No account industries found.");
      }
  
      // Send the account types to the client
      res.send(industries);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send("An error occurred while fetching industries.");
    }
  });
  
export const createRequest = asyncMiddleware(async (req, res) => {

  try{
    const { workspaceId, targetUserId, type } = req.body;
    const requesterId = req.user.id; // From JWT
  
    const request = await Request.create({
      workspaceId,
      requesterId,
      targetUserId,
      type,
      status: "Pending",
    });
  
    res.status(201).json({ message: "Request created", request });

  }catch(error){
    
  }
})

export const getRequests = asyncMiddleware(async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    console.log('fetching...');

    const requests = await Request.findAll({
      where: { targetUserId: userId }, // Wrap the condition in 'where'
      include : {
        model : User, 
        as : 'requester'
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


export const updateRequest = asyncMiddleware(async (req, res) => {
  try {
    const { requestId } = req.params; // Request ID from URL params
    const updatedData = req.body; // Fields to be updated from request body

    const request = await Request.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.type==="Ownership Transfer"){

      let workspaceAssociated = await UserWorkspace.findOne({where : {workspaceId : request.workspaceId, userId : request.targetUserId }})
      if (workspaceAssociated){
        workspaceAssociated.destroy()
      }

      let ownerRole = await Role.findOne({where : {name : "owner"}})
      let workspace = await Workspace.findOne({where : {id : request.workspaceId}})
      let existingOwner = await UserWorkspace.findOne({where : {workspaceId : request.workspaceId, roleId : ownerRole.id }})
      existingOwner.update({userId : request.targetUserId})
      console.log(existingOwner);
      createNotifications(request.requesterId, 'transferWorkspaceAccepted', {name : req.user.name, workspaceName : workspace.name }, req.io)

      req.io.to(`socket-${request.targetUserId}`).emit('workspace:ownership', {role : existingOwner, workspace})
      req.io.to(`socket-${request.requesterId}`).emit('workspace:ownership', {role : {}, workspace : {}})
      
      console.log('Owner updated')
    }

    await request.update(updatedData);

    res.status(200).json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});
