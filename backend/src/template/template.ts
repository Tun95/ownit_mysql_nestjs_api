// emailTemplate.ts

//===============
// CREATE ACCOUNT EMAIL TEMPLATE
//===============
export const getEmailTemplate = (
  firstName: string,
  verificationCode: string,
  password: string,
  facebook: string,
  instagram: string,
  webName: string,
) => {
  return `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
          }
          a { text-decoration: none; }
  
          .a_flex {
            display: flex;
            align-items: center;
          }
  
          .header {
            background-color: #00463e;
            height: 50px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
  
          .logo_img {
            width: 100px;
          }
          .head {
            flex-direction: column;
          }
          .email {
            width: 200px;
          }
          .message_text {
            padding: 0px 10px;
          }
          .message_text p {
            color: #434343;
            font-size: 15px;
          }
          .message_text .otp_box {
            margin: -18px 0px;
          }
          .otp_box h2 {
            background-color: #e7e7e7;
            color: #3462fa;
            padding: 5px 10px;
            border-radius: 5px;
            letter-spacing: 3px;
            width: fit-content;
          }
          .out_greeting h5 {
            line-height: 2px;
            font-size: 15px;
            color: #222222;
          }
          .footer {
            border-top: 1px solid #a5a5a5;
          }
          .footer img {
            width: 30px;
          }
          .footer p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <table role="presentation" width="100%">
              <tr>
                <td align="center">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730887212/logo_oodxma.png"
                    alt="logo"
                    width="100"
                    style="display: block;"
                  />
                </td>
              </tr>
            </table>
          </div>
          <div class="body_text">
            <div class="head">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <img
                      src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/ed1_xpf1zq.png"
                      alt="email"
                      class="email"
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div class="head_text">
                      <h2>Account Verification</h2>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <div class="message_text">
              <div class="greetings">
                <h3>Hi ${firstName},</h3>
              </div>
              <div class="text">
                <p>
                  You have received this email because you have been requested to
                  verify your account.
                </p>
                <table role="presentation" width="100%" style="padding: -10px 0px; margin: -15px 0px;">
                  <tr>
                    <td align="center" style="padding: -10px 0px; margin: -15px 0px;">
                      <div class="otp_box">
                        <h2>${verificationCode}</h2>
                      </div>
                    </td>
                  </tr>
                </table>
                <p>Your password is: <strong>${password}</strong></p>
                <p>
                  If you did not request this verification, you can safely ignore
                  this email.
                </p>
                <p>This verification code is valid for the next 10 minutes.</p>
              </div>
              <div class="out_greeting">
                <h5>Regards,</h5>
                <h5 class="closing">The ${webName} Team.</h5>
              </div>
            </div>
          </div>
          <div class="footer">
            <table role="presentation" width="100%">
              <tr>
                <td align="left" style="padding: 10px;">
                  <p style="margin: 0;">Edquity by Outside Lab</p>
                </td>
                <td align="right" style="padding: 10px;">
                  <a href="${facebook}" style="margin-right: 10px;">
                    <img
                      src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886760/face_z4zb3n.png"
                      alt="Facebook"
                      width="30"
                      style="display: inline-block; vertical-align: middle;"
                    />
                  </a>
                  <a href="${instagram}">
                    <img
                      src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/insta_olwhmd.png"
                      alt="Instagram"
                      width="30"
                      style="display: inline-block; vertical-align: middle;"
                    />
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>`;
};

//===============
// otp email template
//===============
export const getOtpEmailTemplate = (
  firstName: string,
  otp: string,
  webName: string,
  facebook: string,
  instagram: string,
) => {
  return `<html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: auto;
        }
        a { text-decoration: none; }
        .a_flex {
          display: flex;
          align-items: center;
        }
        .header {
          background-color: #00463e;
          height: 50px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .logo_img {
          width: 100px;
        }
        .head {
          flex-direction: column;
        }
        .email {
          width: 200px;
        }
        .message_text {
          padding: 0px 10px;
        }
        .message_text p {
          color: #434343;
          font-size: 15px;
        }
        .message_text .otp_box {
          margin: -18px 0px;
        }
        .otp_box h2 {
          background-color: #e7e7e7;
          color: #3462fa;
          padding: 5px 10px;
          border-radius: 5px;
          letter-spacing: 3px;
          width: fit-content;
        }
        .out_greeting h5 {
          line-height: 2px;
          font-size: 15px;
          color: #222222;
        }
        .footer {
          border-top: 1px solid #a5a5a5;
        }
        .footer img {
          width: 30px;
        }
        .footer p {
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <table role="presentation" width="100%">
            <tr>
              <td align="center">
                <img
                  src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730887212/logo_oodxma.png"
                  alt="logo"
                  width="100"
                  style="display: block;"
                />
              </td>
            </tr>
          </table>
        </div>
        <div class="body_text">
          <div class="head">
            <table role="presentation" width="100%">
              <tr>
                <td align="center">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/ed1_xpf1zq.png"
                    alt="email"
                    class="email"
                  />
                </td>
              </tr>
              <tr>
                <td align="center">
                  <div class="head_text">
                    <h2>Email Verification</h2>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <div class="message_text">
            <div class="greetings">
              <h3>Hi ${firstName},</h3>
            </div>
            <div class="text">
              <p>
                You have received this email because you have been requested to
                verify your account.
              </p>
              <table role="presentation" width="100%" style="padding: -10px 0px; margin: -15px 0px;">
                <tr>
                  <td align="center" style="padding: -10px 0px; margin: -15px 0px;">
                    <div class="otp_box">
                      <h2>${otp}</h2>
                    </div>
                  </td>
                </tr>
              </table>
              <p>
                If you did not request this verification, you can safely ignore
                this email.
              </p>
              <p>This verification code is valid for the next 10 minutes.</p>
            </div>
            <div class="out_greeting">
              <h5>Regards,</h5>
              <h5 class="closing">The ${webName} Team.</h5>
            </div>
          </div>
        </div>
        <div class="footer">
          <table role="presentation" width="100%">
            <tr>
              <td align="left" style="padding: 10px;">
                <p style="margin: 0;">Edquity by Outside Lab</p>
              </td>
              <td align="right" style="padding: 10px;">
                <a href="${facebook}" style="margin-right: 10px;">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886760/face_z4zb3n.png"
                    alt="Facebook"
                    width="30"
                    style="display: inline-block; vertical-align: middle;"
                  />
                </a>
                <a href="${instagram}">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/insta_olwhmd.png"
                    alt="Instagram"
                    width="30"
                    style="display: inline-block; vertical-align: middle;"
                  />
                </a>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
  </html>`;
};

//===============
// password reset email template
//===============
export const resetPasswordTemplate = (
  user: { first_name: string; id: string },
  token: string,
  webName: string,
  facebook: string,
  instagram: string,
): string => {
  return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: auto;
        }
        a { text-decoration: none; }

        .a_flex {
          display: flex;
          align-items: center;
        }

        .header {
          background-color: #00463e;
          height: 50px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo_img {
          width: 100px;
        }
        .head {
          flex-direction: column;
          margin-top: 20px;
        }
        .email {
          width: 200px;
        }
        .message_text {
          padding: 0px 10px;
        }
        .message_text p {
          color: #434343;
          font-size: 15px;
        }
        .message_text .otp_box {
          margin: -18px 0px;
        }
        .otp_box h2 {
          background-color: #e7e7e7;
          color: #3462fa;
          padding: 5px 10px;
          border-radius: 5px;
          letter-spacing: 3px;
          width: fit-content;
        }
        .out_greeting h5 {
          line-height: 2px;
          font-size: 15px;
          color: #222222;
        }
        .footer {
          border-top: 1px solid #a5a5a5;
        }
        .footer img {
          width: 30px;
        }
        .footer p {
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <table role="presentation" width="100%">
            <tr>
              <td align="center">
                <img
                  src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730887212/logo_oodxma.png"
                  alt="logo"
                  width="100"
                  style="display: block;"
                />
              </td>
            </tr>
          </table>
        </div>
        <div class="body_text">
          <div class="head">
            <table role="presentation" width="100%">
              <tr>
                <td align="center">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/ed2_rwigks.png"
                    alt="email"
                    class="email"
                  />
                </td>
              </tr>
              <tr>
                <td align="center">
                  <div class="head_text">
                    <h2>Reset Your Password</h2>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <div class="message_text">
            <div class="greetings">
              <h3>Hi ${user.first_name},</h3>
            </div>
            <div class="text">
              <p>
                You recently requested to reset your password. If you did not make this request, Kindly ignore this email.
              </p>

              <p>
                To reset your password, please click the button below.
              </p>
              <table role="presentation" width="100%" style="padding: -10px 0px; margin: -15px 0px;">
                <tr>
                  <td align="center" style="padding: -10px 0px; margin: -15px 0px;">
                    <a href="${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}" style="display: inline-block; margin: 8px 0; padding: 8px 30px; background-color: #00eacd; color: #000B09; text-decoration: none; border-radius: 4px;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </div>
            <div class="out_greeting">
              <h5>Regards,</h5>
              <h5 class="closing">The ${webName} Team.</h5>
            </div>
          </div>
        </div>
        <div class="footer">
          <table role="presentation" width="100%">
            <tr>
              <td align="left" style="padding: 10px;">
                <p style="margin: 0;">Edquity by Outside Lab</p>
              </td>
              <td align="right" style="padding: 10px;">
                <a href="${facebook}" style="margin-right: 10px;">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886760/face_z4zb3n.png"
                    alt="Facebook"
                    width="30"
                    style="display: inline-block; vertical-align: middle;"
                  />
                </a>
                <a href="${instagram}">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/insta_olwhmd.png"
                    alt="Instagram"
                    width="30"
                    style="display: inline-block; vertical-align: middle;"
                  />
                </a>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
  </html>`;
};

export function getPasswordResetSuccessTemplate(
  user: { first_name: string; id: string },
  facebook: string,
  instagram: string,
  webName: string,
): string {
  return `
       <html >
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: auto;
            }
            a { text-decoration: none;
                color: #0062EA;
             }

            .a_flex {
              display: flex;
              align-items: center;
            }

            .header {
              background-color: #00463e;
              height: 50px;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .logo_img {
              width: 100px;
            }
            .head {
              flex-direction: column;
            }
           .email{
              width: 110px;
              margin-top: 10px;
            }
            .message_text {
              padding: 0px 10px;
            }
            .message_text p {
              color: #434343;
              font-size: 15px;
            }
            .message_text .otp_box {
              margin: -18px 0px;
            }
            .otp_box h2 {
              background-color: #e7e7e7;
              color: #3462fa;
              padding: 5px 10px;
              border-radius: 5px;
              letter-spacing: 3px;
              width: fit-content;
            }
            .out_greeting h5 {
              line-height: 2px;
              font-size: 15px;
              color: #222222;
            }
            .footer {
              border-top: 1px solid #a5a5a5;
            }
            .footer img {
              width: 30px;
            }
            .footer p{
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <table role="presentation" width="100%">
              <tr>
                <td align="center">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730887212/logo_oodxma.png"
                    alt="logo"
                    width="100"
                    style="display: block;"
                  />
                </td>
              </tr>
            </table>
            </div>
            <div class="body_text">
              <div class="head ">
               <table role="presentation" width="100%">
                <tr>
                <td align="center">
                  <img
                    src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/ed3_y1xwb9.png"
                    alt="email"
                    class="email"
                  />
                 </td>

                </tr>
                <tr>
                  <td align="center">
                   <div class="head_text">
                   <h2>Password Reset Complete</h2>
                   </div>
                  </td>
                 </tr>
               </table>
              </div>
              <div class="message_text">
                <div class="greetings">
                  <h3>Hi ${user.first_name},</h3>
                </div>
                <div class="text">
                  <p>
                    The password for your Telex account has been successfully changed. You can now access your account  <a href=${`${process.env.SUB_DOMAIN}/lost-password`}>here</a>.
                  </p>
                  <p>
                   If you didn't change your password, please immediately reset your Telex account by clicking on the link: <a href=${`${process.env.SUB_DOMAIN}/lost-password`}>${
                     process.env.SUB_DOMAIN
                   }/lost-password</a>
                  </p>

                </div>
                <div class="out_greeting">
                  <h5>Regards,</h5>
                  <h5 class="closing">The ${webName} Team.</h5>
                </div>
              </div>
            </div>
            <div class="footer">
              <table role="presentation" width="100%">
                <tr>
                  <td align="left" style="padding: 10px;">
                    <p style="margin: 0;">Edquity by Outside Lab</p>
                  </td>
                  <td align="right" style="padding: 10px;">
                    <a href="${facebook}" style="margin-right: 10px;">
                      <img
                        src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886760/face_z4zb3n.png"
                        alt="Facebook"
                        width="30"
                        style="display: inline-block; vertical-align: middle;"
                      />
                    </a>
                    <a href="${instagram}">
                      <img
                        src="https://res.cloudinary.com/dtvwnonbi/image/upload/v1730886761/insta_olwhmd.png"
                        alt="Instagram"
                        width="30"
                        style="display: inline-block; vertical-align: middle;"
                      />
                    </a>
                  </td>
                </tr>
              </table>
            </div>

          </div>
        </body>
      </html>`;
}
