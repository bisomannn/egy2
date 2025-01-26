const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// تقديم الملفات الثابتة (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// إرسال ملف index.html عند زيارة الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`الخادم يعمل على http://localhost:${port}`);
});