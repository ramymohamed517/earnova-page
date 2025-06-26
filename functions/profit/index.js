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
    const timeDiff = (now - lastProfitTime) / (1000 * 60 * 60); // بالساعات

    if (timeDiff >= 24) {
      const userRef = db.collection("users").doc(userId);
      const updateBalance = userRef.update({
        balance: admin.firestore.FieldValue.increment(profitPerDay)
      });

      const productRef = db.collection("userProducts").doc(doc.id);
      const updateTime = productRef.update({
        lastProfitTime: admin.firestore.Timestamp.fromDate(now)
      });

      updates.push(updateBalance, updateTime);
      console.log(`✅ تم إضافة ${profitPerDay} إلى رصيد المستخدم ${userId}`);
    } else {
      console.log(`⏱ لم يمر 24 ساعة بعد على ${doc.id}`);
    }
  });

  await Promise.all(updates);
  console.log("✅ Profits updated for all eligible products");
}

updateProfits().catch(console.error);





