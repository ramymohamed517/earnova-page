const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.dailyProfitDistribution = functions.pubsub.
schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();

  const snapshot = await db.collection('userProducts').get();

  const updates = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const userId = data.userId;
    const profit = data.profitPerDay || 0;

    if (!userId || profit <= 0) return;

    const userRef = db.collection('users').doc(userId);

    // أضف الربح إلى رصيد المستخدم
    const update = userRef.update({
      balance: admin.firestore.FieldValue.increment(profit)
    });

    updates.push(update);
  });

  await Promise.all(updates);
  console.log('Daily profits distributed successfully');
});
