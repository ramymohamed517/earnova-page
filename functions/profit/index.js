const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

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
    const profitPerDay = data.profitPerDay || 0;
    const purchaseTime = data.purchaseTime ? new Date(data.purchaseTime) : null;
    const lastProfitTime = data.lastProfitTime ? new Date(data.lastProfitTime) : purchaseTime;

    if (!userId || profitPerDay <= 0 || !purchaseTime) return;

    const now = new Date();
    const timeDiff = (now - lastProfitTime) / (1000 * 60 * 60); // الفرق بالساعات

    if (timeDiff >= 24) { // لو مر 24 ساعة أو أكتر
      const userRef = db.collection("users").doc(userId);
      const update = userRef.update({
        balance: admin.firestore.FieldValue.increment(profitPerDay)
      });

      // تحديث lastProfitTime في userProducts
      const productRef = db.collection("userProducts").doc(doc.id);
      updates.push(productRef.update({ lastProfitTime: now }), update);
    }
  });

  await Promise.all(updates);
  console.log("✅ Profits updated for all users");
}

updateProfits().catch(console.error);



