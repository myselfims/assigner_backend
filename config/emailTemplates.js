export const genericTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #4e73df;
            font-size: 28px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 30px;
        }
        .footer a {
            color: #4e73df;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <div class="container">
        <p>Hi {{userName}},</p>
        
        {{body}}
        
        <div class="footer">
            <p>Thank you for using <span class="project-name">EasyAssigns</span>.</p>
            <p>&copy; 2025 EasyAssigns. All rights reserved.</p>
        </div>
    </div>

</body>
</html>
`;

export const templates = {
  otpTemplate: {
    subject: "Verify your account",
    body: `
        <p>We received a request to verify your email address for your EasyAssigns account. Use the OTP below:</p>
        <div style="font-size: 30px; font-weight: bold; background-color: #4e73df; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            {{otp}}
        </div>
        <p>This OTP is valid for the next 10 minutes.</p>
        <p>If you did not request this, please ignore this email or <a href="#">contact support</a>.</p>
    `,
  },

  userOnboard: {
    subject: "Welcome to EasyAssigns!",
    body: `
        <p>You have been added to the project <span style="font-weight: bold; color: #4e73df;">{{projectName}}</span> by the project owner.</p>
        <p>Click the button below to activate your account:</p>
        <a style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; background-color: #4e73df; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; margin: 20px 0; transition: background-color 0.3s ease;" href="{{activationLink}}">
            Activate Your Account
        </a>
        <p>If you did not expect this email, please ignore it or <a href="#">contact support</a>.</p>
    `,
  },

  invitationExistingUserTemplate: {
    subject: "Invitation to Join Project",
    body: `
      <p>You have been invited to join the {{projectName}}.</p>
      <p>Please click the button below to accept the invitation:</p>
      <a href="{{invitationLink}}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Accept Invitation
      </a>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
    `,
  },

  passwordReset: {
    subject: "Reset Your Password",
    body: `
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="{{resetLink}}" style="display: inline-block; font-size: 18px; font-weight: bold; text-align: center; background-color: #4e73df; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
        <p>If you did not request this, please ignore this email or <a href="#">contact support</a>.</p>
    `,
  },

  assignedToProjectTemplate: {
    subject: "You've Been Added to a Project!",
    body: `
      <p>Hello {{userName}},</p>
      <p>You have been added to the project <strong>{{projectName}}</strong> on EasyAssigns.</p>
      <ul>
          <li><strong>Project Name:</strong> {{projectName}}</li>
          <li><strong>Assigned By:</strong> {{assignedBy}}</li>
          <li><strong>Start Date:</strong> {{startDate}}</li>
      </ul>
      <a href="{{projectLink}}" style="background-color: #4e73df; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          View Project
      </a>
    `,
  },
  assignedTaskTemplate: {
    subject: "New Task Assigned to You!",
    body: `
      <p>A new task has been assigned to you in the project <strong>{{projectName}}</strong>.</p>
      <ul>
          <li><strong>Task Name:</strong> {{taskName}}</li>
          <li><strong>Due Date:</strong> {{dueDate}}</li>
          <li><strong>Assigned By:</strong> {{assignedBy}}</li>
      </ul>
      <a href="{{taskLink}}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          View Task
      </a>
    `,
  },
  removedFromProjectTemplate: {
    subject: "You Have Been Removed from a Project",
    body: `
      <p>You have been removed from the project <strong>{{projectName}}</strong> on EasyAssigns.</p>
      <p>If you believe this was a mistake, please contact your project manager.</p>
      <p>For assistance, <a href="{{supportLink}}">click here</a>.</p>
    `,
  },
  permissionChangedTemplate: {
    subject: "Your Project Permissions Have Changed",
    body: `
      <p>Your permissions for the project <strong>{{projectName}}</strong> have been updated.</p>
      <p>New Role: <strong>{{newRole}}</strong></p>
      <p>Changed By: <strong>{{changedBy}}</strong></p>
    `,
  },
  newMessageTemplate: {
    subject: "New Message in Project Chat",
    body: `
      <p>You have a new message in the project <strong>{{projectName}}</strong> from <strong>{{senderName}}</strong>.</p>
      <blockquote>{{messagePreview}}</blockquote>
      <a href="{{chatLink}}" style="background-color: #ff9900; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          View Message
      </a>
    `,
  },
  taskStatusUpdatedTemplate: {
    subject: "Task Status Updated: {{taskName}}",
    body: `
      <p>The status of your task <strong>{{taskName}}</strong> in the project <strong>{{projectName}}</strong> has been updated.</p>
      <p>New Status: <strong>{{newStatus}}</strong></p>
      <p>Updated By: <strong>{{updatedBy}}</strong></p>
      <a href="{{taskLink}}" style="background-color: #17a2b8; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          View Task
      </a>
    `,
  },
  taskReminderTemplate: {
    subject: "Reminder: Task Due Soon!",
    body: `
      <p>This is a reminder that your task <strong>{{taskName}}</strong> in the project <strong>{{projectName}}</strong> is due soon.</p>
      <p>Due Date: <strong>{{dueDate}}</strong></p>
      <a href="{{taskLink}}" style="background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Update Task
      </a>
    `,
  },
};

export function generateEmailContent(templateKey, values) {
  const template = templates[templateKey]
  const filledBody = genericTemplate
    .replace("{{body}}", template.body);

  return Object.fromEntries(
    Object.entries({ subject: template.subject, body: filledBody }).map(
      ([key, value]) => [
        key,
        value.replace(/{{(.*?)}}/g, (match, p1) => values[p1] || match),
      ]
    )
  );
}
