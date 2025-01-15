import { Role, AccountType } from './models.js'; // Adjust the import path based on your project structure

export const seedRoles = async () => {
  try {
    const roles = [
      { name: 'Admin', description: 'Full access to all features and settings.' },
      { name: 'Manager', description: 'Can manage tasks, users, and view reports.' },
      { name: 'Contributor', description: 'Can create and edit tasks assigned to them.' },
      { name: 'Viewer', description: 'Can view tasks and reports without making changes.' },
    ];

    // Use bulkCreate to insert multiple records
    await Role.bulkCreate(roles, { ignoreDuplicates: true });

    console.log('Roles have been populated successfully!');
  } catch (error) {
    console.error('Error populating roles:', error);
  }
};

export const seedAccountTypes = async () => {
  try {
    const types = [
      { type: 'Individual', icon : "FaUser"},
      { type: 'Team', icon : 'FaUsers'},
      { type: 'Organization', icon : 'FaBuilding' },
    ];

    // Use bulkCreate to insert multiple records
    await AccountType.bulkCreate(types, { ignoreDuplicates: true });

    console.log('Roles have been populated successfully!');
  } catch (error) {
    console.error('Error populating roles:', error);
  }
};
