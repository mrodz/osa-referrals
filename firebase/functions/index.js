const {
  setGlobalOptions,
  identity,
  params,
  https,
} = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
setGlobalOptions({
  cpu: 1,
  memory: "128MiB",
  maxInstances: 1,
  timeoutSeconds: 5,
});

exports.submitPendingCode = https.onRequest(async (req, res) => {
  if (!("email" in req.query)) {
    res.status(400).send("Missing `email` query parameter");
    return;
  }

  if (!("code" in req.query)) {
    res.status(400).send("Missing `code` query parameter");
    return;
  }

  const email = req.query.email;
  const code = req.query.code;

  const codeRef = getFirestore().collection("pending codes").doc(String(email));

  try {
    const thisUser = await codeRef.get();

    if (!thisUser.exists) {
      const newEntry = {
        code,
      };

      codeRef.create(newEntry);

      res.json(newEntry);
    } else {
      const existingEntry = thisUser.data();

      existingEntry.code = code;

      await codeRef.update(existingEntry);

      res.json(existingEntry);
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

const OSA_SIGNUP_CODE = params.defineSecret("OSA_SIGNUP_CODE");

exports.beforecreated = identity.beforeUserCreated(
  { secrets: ["OSA_SIGNUP_CODE"] },
  async (event) => {
    if (event.data.email === undefined) {
      throw new identity.HttpsError("invalid-argument");
    }

    const codeRef = getFirestore()
      .collection("pending codes")
      .doc(String(event.data.email));

    const exitAndClearFirestore = async (reason) => {
      await codeRef.delete();
      throw new identity.HttpsError(
        reason ?? "permission-denied",
        "Unauthorized Access"
      );
    };

    let user;
    try {
      user = await codeRef.get();
    } catch (e) {
      return exitAndClearFirestore();
    }

    if (!user.exists) exitAndClearFirestore("failed-precondition");

    const code = user.get("code");

    if (code === undefined || typeof code !== "string") {
      return exitAndClearFirestore("failed-precondition");
    }

    console.log(code, OSA_SIGNUP_CODE.value());

    if (OSA_SIGNUP_CODE.value() === code) {
      await codeRef.delete();
      return;
    } else {
      return exitAndClearFirestore();
    }
  }
);
