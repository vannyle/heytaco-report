import Form from "./components/form";

const IS_DEV = process.env.NODE_ENV === 'development';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="row-start-2">
        <div className="flex flex-col gap-8 items-center sm:items-start container mx-auto px-4 w-full">
          <h1 className="text-2xl font-bold mb-4">🌮 HeyTaco Report Admin Panel</h1>
          {IS_DEV && <Form />}
          {!IS_DEV && <p>This is a production environment. Please contact the admin to get access.</p>}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          Copyright © 2024 PixelPoint. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
