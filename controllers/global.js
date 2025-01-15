import { AccountType, Role } from "../db/models.js";
import { asyncMiddleware } from "../middlewares/async.js";


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
  