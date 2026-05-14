import { db } from "@/src/db";
import { contacts } from "@/src/db/schema";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
