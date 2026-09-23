import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Default Leader User
  const leaderEmail = 'leader@vertex.delta.edu.eg';
  const leaderPasswordHash = await bcrypt.hash('Leader@2026', 10);

  const leader = await prisma.user.upsert({
    where: { email: leaderEmail },
    update: {},
    create: {
      name: 'قائد الفريق (Vertex Leader)',
      email: leaderEmail,
      universityId: '20260001',
      academicYear: 'الفرقة الرابعة',
      role: 'LEADER',
      passwordHash: leaderPasswordHash,
    },
  });

  console.log(`✅ Leader Account Ready: ${leader.email}`);

  // 2. Initialize Exam Config
  await prisma.examConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      passingScore: 70,
      isRegistrationOpen: true,
      allowedEmailDomain: '@std.delta.edu.eg',
    },
  });

  console.log('✅ Exam Config Ready');

  // 3. Seed Default Questions
  const initialQuestions = [
    {
      text: 'ما هي التقنية الرئيسية التي تعتمد عليها نماذج الذكاء الاصطناعي التوليدي مثل GPT؟',
      type: 'MCQ',
      options: JSON.stringify([
        'معمارية Transformer',
        'شجرة القرارات (Decision Trees)',
        'الخوارزمية الجينية (Genetic Algorithm)',
        'قواعد البيانات العلاقية (RDBMS)'
      ]),
      correctAnswer: 'معمارية Transformer',
      points: 20,
    },
    {
      text: 'في لغة Python، تُستخدم الدالة `map()` لتطبيق دالة معينة على كل عنصر من عناصر القائمة.',
      type: 'BOOLEAN',
      options: JSON.stringify(['صح', 'خطأ']),
      correctAnswer: 'صح',
      points: 15,
    },
    {
      text: 'أي من الاختيارات التالية يمثل دالة التنشيط (Activation Function) الشائعة في الشبكات العصبية العميقة؟',
      type: 'MCQ',
      options: JSON.stringify([
        'ReLU (Rectified Linear Unit)',
        'HTTP Protocol',
        'JSON Parser',
        'Gradient Descent'
      ]),
      correctAnswer: 'ReLU (Rectified Linear Unit)',
      points: 20,
    },
    {
      text: 'صواب أم خطأ: خوارزمية BFS (Breadth-First Search) تستخدم هيكل البيانات Queue للبحث في الرسوم البيانية.',
      type: 'BOOLEAN',
      options: JSON.stringify(['صح', 'خطأ']),
      correctAnswer: 'صح',
      points: 15,
    },
    {
      text: 'ما هو هدفك الأساسي من الانضمام إلى فريق VERTEX بكلية الذكاء الاصطناعي وكيف تخطط للمساهمة في مشاريع الفريق؟',
      type: 'TEXT',
      options: null,
      correctAnswer: 'إجابة مقالية تقيم من قبل الليدر',
      points: 30,
    },
  ];

  for (const q of initialQuestions) {
    const existing = await prisma.question.findFirst({
      where: { text: q.text },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          createdBy: leader.name,
        },
      });
    }
  }

  console.log('✅ Default Questions Seeded');

  // 4. Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'INITIAL_SEED',
      details: 'تم تهيئة النظام وإنشاء حساب الليدر وإعدادات الاختبار الأولية.',
      performedBy: 'System Engine',
    },
  });

  console.log('🎉 Seeding Complete Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
