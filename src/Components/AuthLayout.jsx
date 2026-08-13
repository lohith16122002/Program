function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center">
          {title}
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          {subtitle}
        </p>

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;