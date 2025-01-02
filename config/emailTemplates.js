export const templates = {
    otpTemplate : `

        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP for EasyAssigns</title>
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
        .otp {
            display: inline-block;
            font-size: 30px;
            font-weight: bold;
            background-color: #4e73df;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .product-name {
            font-weight: bold;
            color: #4e73df;
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
        <h1>EasyAssigns OTP Verification</h1>
        <p>Hi {{userName}},</p>
        <p>We received a request to verify your email address for your EasyAssigns account. To complete the process, please use the One-Time Password (OTP) below:</p>
        
        <div class="otp">
            {{otp}}
        </div>
        
        <p>This OTP will be valid for the next 10 minutes.</p>
        
        <p>If you did not request this, please ignore this email or <a href="#" class="footer-link">contact support</a>.</p>
        
        <div class="footer">
            <p>Thank you for using <span class="product-name">EasyAssigns</span>.</p>
            <p>&copy; 2025 EasyAssigns. All rights reserved.</p>
        </div>
    </div>

</body>
</html>

    
    `
}


export function generateEmailContent(template, values) {
    return template.replace(/{{(.*?)}}/g, (match, p1) => values[p1] || match);
}