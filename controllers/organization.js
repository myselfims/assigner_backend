import Joi from "joi";
import { asyncMiddleware } from "../middlewares/async.js";
import { Organization, Industry, OrganizationIndustry } from "../db/models.js";

export const createOrganization = asyncMiddleware(async (req, res) => {
  // Validate the request body
  const schema = Joi.object({
    name: Joi.string().required(),
    company_size: Joi.string().required(),
    website: Joi.string().optional().allow(null, ""),
    industryIds: Joi.array().items(Joi.number().integer()).required(), // Array of industry IDs
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, company_size, website, industryIds } = value;

  // Create organization and associate industries
  try {
    // Check if all provided industries exist
    const industries = await Industry.findAll({
      where: { id: industryIds },
    });

    if (industries.length !== industryIds.length) {
      return res.status(400).json({ message: "One or more industries are invalid." });
    }

    // Create the organization
    const organization = await Organization.create({
      name,
      size: company_size,
      website,
    });

    // Associate industries with the organization
    await organization.addIndustries(industries);

    return res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
