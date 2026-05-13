import  nodemailer  from 'nodemailer';

export async function sendOtpEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mashhudur.rahman.dev@gmail.com", 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  await transporter.sendMail({
    from: '"Pro Alchemist" <mashhudur.rahman.dev@gmail.com>',
    to: email,
    subject: "আপনার ওটিপি কোড",
    html: `<p>আপনার ওটিপি কোড: <strong>${code}</strong></p><p>এটি ১০ মিনিটের জন্য কার্যকর।</p><p>আপনি যদি কোডটি ব্যবহার করতে চান, তাহলে দয়া করে এটি ১০ মিনিটের মধ্যে ব্যবহার করুন।</p><p>যদি আপনি এই কোডটি চাওয়া না করে থাকেন, তাহলে দয়া করে এই ইমেইলটি উপেক্ষা করুন।</p><p>ধন্যবাদ,<br>Pro Alchemist Team</p><p>!!! এই কোডটি কারো সাথে শেয়ার করবেন না</p>`,
  });
}