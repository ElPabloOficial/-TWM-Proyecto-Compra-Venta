const LoginTemplate = ({ brand, form }) => {
  return (
    <main className="login-page">
      <section className="login-card">
        {brand}
        {form}
      </section>
    </main>
  );
};

export default LoginTemplate;