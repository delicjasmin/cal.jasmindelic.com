import sgMail from "@sendgrid/mail";

export const sendEmail = async (
  to: string,
  name: string,
  code: string,
  request: string,
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  const templateId =
    request === "signup"
      ? "d-25212f09a69043e59d854ea68744a7aa"
      : request === "reset"
        ? "d-7e7ab0027df84ffd9ab0bcdc88ce8477"
        : "";
  const msg = {
    to: to,
    from: "jassmindelic@gmail.com",
    templateId,
    dynamic_template_data: {
      name,
      code,
    },
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};
