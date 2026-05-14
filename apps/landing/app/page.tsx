import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">문의하기</h1>
        <p className="text-sm text-gray-500">이름, 이메일, 전화번호를 입력하시면 연락드리겠습니다.</p>
      </div>
      <ContactForm />
    </main>
  );
}
