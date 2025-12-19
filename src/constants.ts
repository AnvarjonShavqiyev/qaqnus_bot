import { ACTIONS } from "./bot/interfaces/bot-context.interface";

export const ZERO = 0;
export const ONE = 1;

export const EMPTY_STRING = "";

export const adminCommands = [
    [{ text: "Yangi Qaqnus sonini e'lon qilish", callback_data: ACTIONS.ANNOUNCEMENT }],
    [{ text: "Tomoshabinlar ro'yxatini olish", callback_data: ACTIONS.LIST_VIEWERS }],
    [{ text: "Ijrochilar ro'yxatini olish", callback_data: ACTIONS.LIST_ATTENDEES }],
    [{ text: "Eslatma yuborish", callback_data: ACTIONS.SEND_NOTIFICATION }],
    [{ text: "Xabar yuborish", callback_data: ACTIONS.SEND_MESSAGE }],
    [{ text: "Foydalanuvchini o'chirish", callback_data: ACTIONS.DELETE_USER }],
    [{ text: "Qabul jarayonini to'xtatish", callback_data: ACTIONS.STOP_RECORDING }],
];

export const userCommands = [
    [{ text: "Tomoshabin", callback_data: ACTIONS.SPECTATOR_RECORD }],
    [{ text: "Ijrochi", callback_data: ACTIONS.ATTENDEE_RECORD }]
]

export const MESSAGES = {
    ASK_NAME: '1️⃣ Iltimos, Ism familiyangizni kiriting (hujjatdagi bilan bir xil boʻlishi kerak)',
    ASK_PASSPORT: '2️⃣ Rahmat, endi pasportingiz seriya va raqamini kiriting.',
    ASK_CONTACT: "Rahmat, endi zarur xollarda siz bilan bog'lana olishimiz uchun telegram @username yoki telefon raqamingizni kiriting.",
    CHOOSE_COMMAND: 'Iltimos, buyruqlardan birini tanlang:',
    COMPLETE_WORKS: 'Soʻrovingiz qabul qilindi, tez orada moderatorlarimiz siz bilan bogʻlanadi.',
    SAVE_NOTE: 'Ijodiy ishingiz saqlanmoqda, iltimos kuting.',
    SAVED_NOTE: "Ijodiy ish saqlandi. Agar yana ijodiy ishingiz bo'lsa yuboring aks xolsa /saqlash buyrug'ini kiriting.",
    ASK_USER_ROLE: "Dasturning navbatdagi sonini yozib olish jarayonida kim sifatida ishtirok etmoqchisiz?",
    AUTH_NOTE: "Siz avval ro'yxatdan o'tishingiz kerak.",
    NO_PLACE_NOTE: "Kechirasiz, studioda oʻrindiqlar soni cheklangani tufayli sizni roʻyxatdan oʻtkaza olmadik. Keyingi dasturlarimizda kutamiz🙏",
    SPECTATOR_ANSWER: "Tabriklaymiz, siz roʻyxatdan oʻtdingiz. Belgilangan vaqtda qaqnus dasturi yozib olinadigan manzilda sizni kutamiz. Iltimos, oʻzingiz bilan shaxsni tasdiqlovchi hujjatingizni olib kelishni unutmang.\nBatafsil: @qaqnus_klub",
    ASK_WORKS: "Ijodiy ishlaringizni yuboring. Tugatganingizda /saqlash buyrug'ini kiriting.",
    NEW_RECORDING_NOTE: "Qaqnus loyihasining yangi soni uchun ro'yxatga olish boshlandi, qatnashish istagingiz bo'lsa /start buyrug'ini kiriting.",
    ANNOUNCE_NOTE: "Qaqnus loyihasining yangi soni uchun ro'yxatga olish boshlandi, qatnashish istagingiz bo'lsa /start buyrug'ini kiriting.",
    NO_SPECTATORS: "Tomoshabinlar yo'q.",
    SORTING_COMPLETED: "✅ Tekshiradigan ishlar qolmadi.",
    ACCEPT_REJECT: "Iltimos, qaroringizni tanlang:",
    ACCEPT: "✅ Tasdiqlash",
    REJECT: "❌ Rad etish",
    ACCEPT_NOTE: "✅ Ushbu foydalanuvchi ro'yxatga qo'shildi. Yetarlicha inson saralangan bo'lsa /tugatish buyrug'ini kiriting.",
    REJECT_NOTE: "❌ Ushbu foydalanuvchi rad etildi. Yetarlicha inson saralangan bo'lsa /tugatish buyrug'ini kiriting.",
    COMPLETE_NOTE: "Saralash yakunlandi.Barcha ma'lumotlar saqlandi.",
    NOTIFICATION: "Qaqnus loyihasining yangi soni yozib olinishiga kam vaqt qoldi, iltimos o'z vaqtida tashrif buyuring.\nBatafsil: @qaqnus_klub",
    DONE: "Eslatmalar jo'natildi.",
    NEW_ANNOUNCE_NOTE: "Yangi son e'lon qilindi.",
    USER_ACCEPT_NOTE: "Tabriklaymiz, ushbu dasturimizda ijrochi sifatida tashrif buyurishingiz mumkin.",
    USER_REJECT_NOTE: "Kechirasiz, koʻrsatuvning ayrim shartlariga mos kelmagani uchun bu dasturimizda siz ijrochi sifatida qatnasha olmaysiz, shunga qaramay, keyingi ko'rsatuvimizda ishtirok etish uchun qaytadan urinib ko'rishingiz mumkin.",
    USER_UNIQUE_NOTE: "Siz allaqachon tomoshabin sifatida ro'yxatdan o'tgansiz.",
    CHECKED_ALL: "✅ Barcha foydalanuvchilar tekshirildi.",
    USER_COMPLETNESS_WORK: "Sizning ijodiy ishlaringizni tekshirish yakunlangan, iltimos, keyingi sonlarda yana urinib ko'ring.",
    ATTENDENSE_NOTE: "Iltimos, ishtirok etish uchun, ijodiy ishlaringizni quyidagi guruhga yoʻllang: \n\nhttps://t.me/qaqnus_kasting\n\nAgar ijodiy ishingiz badiiy kengashdan oʻtgan taqdirda, moderatorlarimiz siz bilan bogʻlanadi.\n\nQaqnusning ayni soniga mos kelmaydigan mavzudagi ijodiy ishlar rad etiladi.\nBatafsil: @qaqnus_klub",
    NO_PERFORMERS: "Ijrochilar yo'q",
    SEND_MESSAGE_NOTE: "Iltimos xabaringizni kiriting:",
    SENT_MESSAGE: "Xabar, barcha foydalanuvchilarga yuborildi.",
    SEND_MESSAGE_STARTED: "Xabar, barcha foydalanuvchilarga yuborilmoqda, iltimos kuting.",
    DELETE_USER_NOTE: "Kechirasiz, sizning ma’lumotlaringiz xato kiritilgani tufayli botdan hisobingiz oʻchirildi.Iltimos, botga qaytadan /start berib, qayta roʻyxatdan oʻting, hammasini toʻgʻri bajarayotganingizga ishonch hosil qiling.",
    DELETE_USER: "Foydalanuvchi ID sini kiriting:",
    DELETE_USER_SUCCESS: "Foydalanuvchi o'chirildi.",
    STOP_RECORDING_NOTE: "Uzr, roʻyxatlar yopildi, keyingi dasturlarimizda kutamiz. Qaqnus boʻyicha barcha yangiliklar: @qaqnus_klub kanalida",
    RECORDING_STOPPED: "Ro'yxatga olish to'xtatildi."
}

export const CHUNK_SIZE = 50;