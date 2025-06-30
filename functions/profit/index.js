const admin = require("firebase-admin");

// تحميل مفتاح الخدمة من المتغير البيئي
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  console.log("✅ Service account parsed successfully");
} catch (error) {
  console.error("❌ Error parsing FIREBASE_KEY:", error);
  throw error;
}

// تهيئة Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error);
  throw error;
}

const db = admin.firestore();

// دالة تحديث الأرباح
async function updateProfits() {
  try {
    // جلب جميع الوثائق من مجموعة userProducts
    const snapshot = await db.collection("userProducts").get();
    if (snapshot.empty) {
      console.log("⚠️ No products found in userProducts collection");
      return;
    }

    const updates = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = data.userId;
      const profitPerDay = data.profitPerDay || 0;
      const purchaseTime = data.purchaseTime ? new Date(data.purchaseTime) : null;
      const lastProfitTime = data.lastProfitTime ? new Date(data.lastProfitTime) : purchaseTime;

      // التحقق من صحة البيانات
      if (!userId || typeof profitPerDay !== "number" || profitPerDay <= 0 || !purchaseTime || isNaN(purchaseTime.getTime())) {
        console.warn(`⚠️ Invalid data in userProduct ${doc.id}:`, data);
        continue;
      }

      const now = new Date();
      const timeDiff = (now - lastProfitTime) / (1000 * 60 * 60); // الفرق بالساعات

      if (timeDiff >= 24) {
        // استخدام معاملة لتحديث الرصيد ووقت الربح
        const updatePromise = db.runTransaction(async (transaction) => {
          const userRef = db.collection("users").doc(userId);
          const productRef = db.collection("userProducts").doc(doc.id);

          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) {
            console.warn(`⚠️ User ${userId} does not exist for product ${doc.id}`);
            return;
          }

          transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(profitPerDay)
          });
          transaction.update(productRef, {
            lastProfitTime: admin.firestore.Timestamp.fromDate(now)
          });

          console.log(`✅ Scheduled update for user ${userId}: +${profitPerDay}`);
        });

        updates.push(updatePromise);
      } else {
        console.log(`⏱ Less than 24 hours for ${doc.id}`);
      }
    }

    // تنفيذ جميع المعاملات
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log("✅ All profits updated successfully");
    } else {
      console.log("ℹ️ No updates were needed");
    }
  } catch (error) {
    console.error("❌ Error in updateProfits:", error);
    throw error;
  }
}

// تشغيل الدالة مع التعامل مع الأخطاء
withdrawRequests()
  .then(() => console.log("✅ Update profits completed"))
  .catch((error) => console.error("❌ Failed to update profits:", error));

// تصدير الدالة إذا كنت تستخدمها في سياقات أخرى
module.exports = { withdrawRequests };





