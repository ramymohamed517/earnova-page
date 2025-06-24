// استيراد المكتبات المطلوبة
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TelegramBot = require('node-telegram-bot-api');

// تهيئة Firebase Admin SDK
admin.initializeApp();

// توكن بوت تيليجرام
const token = '7928638422:AAENtYBC6Lfb09o37c6SoeWNSeHzCrcLN-Q';

// إنشاء بوت تيليجرام مع وضع polling للاستماع للرسائل
const bot = new TelegramBot(token, { polling: true });

// دالة Firebase Cloud Function: عند إضافة مستخدم جديد في قاعدة بيانات Realtime Database
exports.newUserAdded = functions.database.ref('/users/{userId}')
  .onCreate((snapshot, context) => {
    const newUserData = snapshot.val();
    const userId = context.params.userId;

    console.log("مستخدم جديد تمت إضافته:", userId, newUserData);

    // إضافة رصيد مبدئي للمستخدم (مثلاً 100)
    return snapshot.ref.child("balance").set(100);
  });

// استماع للرسائل في البوت
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'أهلاً! كيف يمكنني مساعدتك؟');
});


