const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateProfits() {
  const snapshot = await db.collection("userProducts").get();
  const now = Date.now();
  const updates = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const userId = data.userId;
    const profit = data.profitPerDay || 0;
    const boughtAt = data.boughtAt?.toMillis?.() || 0;
    const lastProfitTime = data.lastProfitTime?.toMillis?.() || 0;

    // تحقّق: لازم يكون مر 24 ساعة من وقت آخر ربح أو وقت الشراء
    const referenceTime = lastProfitTime || boughtAt;
    const hoursPassed = (now - referenceTime) / (1000 * 60 * 60);

    if (!userId || profit <= 0 || hoursPassed < 24) return;

    const userRef = db.collection("users").doc(userId);
    const updateUserBalance = userRef.update({
      balance: admin.firestore.FieldValue.increment(profit)
    });

    const updateLastProfitTime = doc.ref.update({
      lastProfitTime: admin.firestore.Timestamp.now()
    });

    updates.push(updateUserBalance, updateLastProfitTime);
  });

  await Promise.all(updates);
  console.log("✅ Profits updated after 24h for all users");
}

updateProfits().catch(console.error);


