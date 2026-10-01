const RememberUser = ({ checked, onChange }) => {
  return (
    <label className="login-remember">
      <input type="checkbox" checked={checked} onChange={onChange} />
      Recuérdame
    </label>
  );
};

export default RememberUser;