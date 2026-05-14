import { db } from "@/src/db";
import { contacts } from "@/src/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  if (!name || !email || !phone) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "유효한 이메일 주소를 입력해주세요." }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/[^0-9]/g, "");
  if (normalizedPhone.length > 11) {
    return NextResponse.json({ error: "전화번호는 11자리를 초과할 수 없습니다." }, { status: 400 });
  }

  try {
    const [contact] = await db.insert(contacts).values({ name, email, phone: normalizedPhone }).returning();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: process.env.CONTACT_NOTIFY_EMAIL ?? email,
      subject: `[문의 접수] ${name}님이 문의를 남겼습니다`,
      html: `
        <h2>새 문의가 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:480px">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">이름</td><td style="padding:8px;border:1px solid #e5e7eb">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">이메일</td><td style="padding:8px;border:1px solid #e5e7eb">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">전화번호</td><td style="padding:8px;border:1px solid #e5e7eb">${normalizedPhone}</td></tr>
        </table>
      `,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
