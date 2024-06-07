const { setGlobalOptions, identity, params } = require("firebase-functions/v2");

setGlobalOptions({
  cpu: 1,
  memory: "128MiB",
  maxInstances: 1,
  timeoutSeconds: 5,
});

const OSA_SIGNUP_CODE = params.defineSecret("OSA_SIGNUP_CODE");

exports.beforecreated = identity.beforeUserCreated(
  { secrets: ["OSA_SIGNUP_CODE"] },
  (event) => {
    const email = event.data.email;

    const [user, domainAndCode] = email.split("@", 2);
    const [code, ...domain] = domainAndCode.split(".");
    const newEmail = `${user}@${domain.join(".")}`;

    console.log(code, OSA_SIGNUP_CODE.value(), newEmail);

    if (OSA_SIGNUP_CODE.value() === code) {
      event.data.email = newEmail;
      return {
        displayName: newEmail,
      };
    } else {
      throw new identity.HttpsError("permission-denied", "Unauthorized Access");
    }
  }
);
