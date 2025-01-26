// 1. إدخال مقاسات التصميم بالمليمتر
const designLength = 303; // الطول بالمليمتر
const designWidth = 607; // العرض بالمليمتر
const designHeight = 5; // الارتفاع بالمليمتر

// 2. إنشاء المشهد (Scene)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x262626); // تعيين الخلفية إلى اللون الرمادي الداكن

// 3. إنشاء الكاميرا (Camera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50); // ضبط موقع الكاميرا
camera.lookAt(0, 0, 0); // توجيه الكاميرا نحو نقطة الأصل

// 4. إنشاء العارض (Renderer)
const renderer = new THREE.WebGLRenderer({ antialias: true }); // تفعيل Anti-Aliasing
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 5. تحميل Height Map (صورة Grayscale)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('./assets/heightmap.bmp', (texture) => {
    // 6. تحويل الصورة إلى نموذج 3D
    const width = texture.image.width;
    const height = texture.image.height;

    // إنشاء canvas لقراءة بيانات البكسل
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0);

    // قراءة بيانات البكسل
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // إنشاء هندسة النموذج
    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);

    // تعديل ارتفاع النقاط بناءً على قيم البكسل
    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0; i < vertices.length; i += 3, j += 4) {
        const pixelValue = data[j]; // قيمة البكسل (0-255)
        vertices[i + 2] = (pixelValue / 255) * designHeight; // ضبط الارتفاع بناءً على designHeight
    }

    // 7. إنشاء المادة (Material)
    const material = new THREE.MeshPhongMaterial({
        color: 0x808080, // لون رمادي
        wireframe: false, // إظهار الشبكة (يمكن تغييرها إلى true لعرض الشبكة فقط)
        flatShading: true // تظليل بسيط
    });

    // 8. إنشاء النموذج وإضافته إلى المشهد
    const heightMapMesh = new THREE.Mesh(geometry, material);

    // تدوير النموذج ليكون السطح هو الواجهة الأمامية
    heightMapMesh.rotation.x = -Math.PI / 2; // تدوير حول المحور X ليكون أفقيًا

    // ضبط حجم النموذج بناءً على المقاسات المدخلة
    heightMapMesh.scale.set(
        (designWidth / width) * 0.1, // تصغير العرض
        (designLength / height) * 0.1, // تصغير الطول
        0.1 // تصغير الارتفاع
    );

    scene.add(heightMapMesh);

    // 9. إضاءة المشهد
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // لون خفيف
    scene.add(ambientLight);

    // 10. OrbitControls للتحكم في النموذج
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // إضافة تأثير تخميد لجعل الحركة أكثر سلاسة
    controls.dampingFactor = 0.25; // قوة التخميد
    controls.screenSpacePanning = false;
    controls.minDistance = 10; // الحد الأدنى للمسافة بين الكاميرا والنموذج
    controls.maxDistance = 100; // الحد الأقصى للمسافة بين الكاميرا والنموذج

    // 11. دورة التصيير (Render Loop)
    function animate() {
        requestAnimationFrame(animate); // طلب إطار جديد للرسوم المتحركة
        controls.update(); // تحديث OrbitControls
        renderer.render(scene, camera); // تصيير المشهد
    }
    animate();

    // 12. تعديل حجم العرض عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight); // تحديث حجم العارض
        camera.aspect = window.innerWidth / window.innerHeight; // تحديث نسبة الكاميرا
        camera.updateProjectionMatrix(); // تحديث إعدادات الكاميرا
    });
});

// 13. وظائف التحكم
let autoRotate = false; // حالة التدوير التلقائي

// تغيير زاوية العرض
function setView(view) {
    switch (view) {
        case 'front':
            camera.position.set(0, 0, 50);
            break;
        case 'back':
            camera.position.set(0, 0, -50);
            break;
        case 'left':
            camera.position.set(-50, 0, 0);
            break;
        case 'right':
            camera.position.set(50, 0, 0);
            break;
        case 'top':
            camera.position.set(0, 50, 0);
            break;
        case 'bottom':
            camera.position.set(0, -50, 0);
            break;
    }
    camera.lookAt(0, 0, 0); // توجيه الكاميرا نحو النموذج
}

// تشغيل/إيقاف التدوير التلقائي
function toggleRotation() {
    autoRotate = !autoRotate;
}