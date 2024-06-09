const {
  setGlobalOptions,
  identity,
  params,
  https,
  logger,
} = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

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

exports.recordResponse = https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("POST only");
    return;
  }

  const body = JSON.parse(req.body);

  const collection = getFirestore().collection("responses");

  if (
    typeof body !== "object" ||
    !(
      "parent" in body &&
      "child" in body &&
      "math" in body &&
      "reading" in body &&
      "story" in body
    )
  ) {
    console.error("#1", body);
    res.status(400).send("Bad request");
    return;
  }

  const { parent, child, math, reading, story } = body;

  if (
    typeof parent !== "object" ||
    typeof parent?.name !== "string" ||
    typeof parent?.email !== "string" ||
    typeof parent?.phone !== "string" ||
    (parent?.name?.length ?? 65) > 64 ||
    (parent?.email?.length ?? 65) > 64 ||
    (parent?.phone?.length ?? 65) > 64
  ) {
    console.error("#2", parent);
    res.status(413).send("parent too big");
    return;
  }

  const isSchool = (school) => {
    return [
      "El Marino",
      "El Rincon",
      "La Ballona",
      "Linwood Howe",
      "Farragut",
    ].includes(school);
  };

  if (
    typeof child !== "object" ||
    typeof child?.name !== "string" ||
    (child?.name?.length ?? 65) > 64 ||
    !isSchool(child?.school ?? "") ||
    typeof child?.grade !== "number" ||
    typeof child?.teacher !== "string" ||
    (child?.teacher?.length ?? 65) > 64
  ) {
    console.error("#3", child, isSchool(child?.school));
    res.status(413).send("child too big");
    return;
  }

  if (typeof math !== "boolean" || typeof reading !== "boolean") {
    console.error("#4", typeof math, typeof reading);
    res.status(400).send("math and reading are boolean");
    return;
  }

  if (typeof story !== "string" || story.length > 600) {
    console.error("#5", story);
    res.status(413).send("story too big");
  }

  try {
    const result = await collection.doc().create({
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
      },
      child: {
        name: child.name,
        school: child.school,
        grade: child.grade,
        teacher: child.teacher,
      },
      math,
      reading,
      story,
      uploaded: new Date().toUTCString(),
      completed: false,
    });

    logger.debug(result);

    res.status(200).json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
});

exports.loadAllResponses = https.onRequest({ cors: true }, async (req, res) => {
  res.set(
    "Access-Control-Allow-Origin",
    process.env.FUNCTIONS_EMULATOR === "true"
      ? "*"
      : "https://referrals.onestepaheadculvercity.org/"
  );
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "content-type, authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.headers?.authorization === undefined) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  if (!req.headers.authorization.startsWith("Bearer ")) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  const jwt = req.headers.authorization.substring(7);

  let decoded;

  try {
    decoded = await getAuth().verifyIdToken(jwt);
  } catch (e) {
    logger.error(e);
    res.status(403).json({
      error: "Unauthorized",
    });
  }

  logger.info(`Accessing records from user ${JSON.stringify(decoded)}`);

  try {
    const snapshot = await getFirestore()
      .collection("responses")
      .limit(500)
      .get();

    const result = [];

    snapshot.forEach((document) => {
      result.push({
        id: document.id,
        data: document.data(),
      });
    });

    res.status(200).json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: "A server-side error occured",
    });
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

    if (OSA_SIGNUP_CODE.value() === code) {
      await codeRef.delete();
      return;
    } else {
      return exitAndClearFirestore();
    }
  }
);

exports.markCompleted = https.onRequest({ cors: true }, async (req, res) => {
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    res.status(400).json({
      error: "body is not JSON",
    });
    return;
  }

  if (!("id" in body)) {
    res.status(400).json({
      error: "Missing `id` parameter",
    });
    return;
  }

  res.set(
    "Access-Control-Allow-Origin",
    process.env.FUNCTIONS_EMULATOR === "true"
      ? "*"
      : "https://referrals.onestepaheadculvercity.org/"
  );
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "content-type, authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.headers?.authorization === undefined) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  if (!req.headers.authorization.startsWith("Bearer ")) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  const jwt = req.headers.authorization.substring(7);

  let decoded;

  try {
    decoded = await getAuth().verifyIdToken(jwt);
  } catch (e) {
    logger.error(e);
    res.status(403).json({
      error: "Unauthorized",
    });
  }

  logger.info(`Marking completion from user ${JSON.stringify(decoded)}`);

  try {
    const snapshot = await getFirestore().collection("responses").doc(body.id);

    const ref = await snapshot.get();

    if (!ref.exists) {
      res.status(404).json({
        error: `no document with id ${body.id}`,
      });
      return;
    }

    const completed = !(ref.data()?.completed ?? false);
    const completedAt = completed ? new Date().toUTCString() : "Never";

    await snapshot.update({
      completed,
      completedAt,
    });

    res.status(200).json({
      completed,
      completedAt,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: "A server-side error occured",
    });
  }
});

exports.deleteResponse = https.onRequest({ cors: true }, async (req, res) => {
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    res.status(400).json({
      error: "body is not JSON",
    });
    return;
  }

  if (!("id" in body)) {
    res.status(400).json({
      error: "Missing `id` parameter",
    });
    return;
  }

  res.set(
    "Access-Control-Allow-Origin",
    process.env.FUNCTIONS_EMULATOR === "true"
      ? "*"
      : "https://referrals.onestepaheadculvercity.org/"
  );
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "content-type, authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.headers?.authorization === undefined) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  if (!req.headers.authorization.startsWith("Bearer ")) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }

  const jwt = req.headers.authorization.substring(7);

  let decoded;

  try {
    decoded = await getAuth().verifyIdToken(jwt);
  } catch (e) {
    logger.error(e);
    res.status(403).json({
      error: "Unauthorized",
    });
  }

  logger.info(`Marking completion from user ${JSON.stringify(decoded)}`);

  try {
    const snapshot = await getFirestore().collection("responses").doc(body.id);

    const ref = await snapshot.get();

    if (!ref.exists) {
      res.status(404).json({
        error: `no document with id ${body.id}`,
      });
      return;
    }

    const result = await snapshot.delete();

    res.status(200).json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      error: "A server-side error occured",
    });
  }
});
