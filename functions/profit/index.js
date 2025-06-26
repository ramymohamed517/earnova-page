const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateProfits() {
  const snapshot = await db.collection("userProducts").get();
  const updates = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const userId = data.userId;
    const profit = data.profitPerDay || 0;

    if (!userId || profit <= 0) return;

    const userRef = db.collection("users").doc(userId);
    const update = userRef.update({
      balance: admin.firestore.FieldValue.increment(profit)
    });

    updates.push(update);
  });

  await Promise.all(updates);
  console.log("✅ Profits updated for all users");
}

updateProfits().catch(console.error);

