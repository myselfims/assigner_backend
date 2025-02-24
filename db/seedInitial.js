import { AccountType } from './accountType.js';
import { Role } from './roleAndDesignation.js';
import { Industry } from './industry.js';

export const seedRoles = async () => {
  try {
    const roles = [
      { name: 'Admin', description: 'Full access to all features and settings.' },
      { name: 'Manager', description: 'Can manage tasks, users, and view reports.' },
      { name: 'Contributor', description: 'Can create and edit tasks assigned to them.' },
      { name: 'Viewer', description: 'Can view tasks and reports without making changes.' },
      { name: 'Owner', description: 'Owner of the workspace or project.' },
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

export const seedIndustries = async () => {
  try {

    const industries = [
      {name: "Software Development", icon: 'FaLaptopCode' },
      {name: "Marketing", icon: 'BsMegaphoneFill' },
      {name: "Education", icon: 'FaChalkboardTeacher' },
      {name: "Healthcare", icon: 'FaHospitalAlt' },
      {name: "Retail & E-commerce", icon: 'AiFillShop' },
      {name: "Engineering", icon: 'MdOutlineEngineering' },
      {name: "Science & Research", icon: 'MdOutlineScience' },
      {name: "Manufacturing", icon: 'GiFactory' },
      {name: "Hospitality & Food", icon: 'GiCookingPot' },
      { name: "Business & Consulting", icon: 'FaBriefcase' },
    ];

    // Use bulkCreate to insert multiple records
    await Industry.bulkCreate(industries, { ignoreDuplicates: true });

    console.log('Roles have been populated successfully!');
  } catch (error) {
    console.error('Error populating roles:', error);
  }
};


export const runSeeding = ()=>{
  seedRoles()
  seedAccountTypes()
  seedIndustries()
}