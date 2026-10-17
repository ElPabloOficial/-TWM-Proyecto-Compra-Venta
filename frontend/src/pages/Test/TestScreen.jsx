import CustomAvatar from "../../components/atoms/Avatar/CustomAvatar";

const TestScreen = () => {
  return (
    <div style={{ padding: 40 }}>
      <h2>Pruebas de componentes</h2>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <CustomAvatar alt="Marcelo" size={40} />
        <CustomAvatar alt="Juana" size={60} />
        <CustomAvatar alt="Pablo" size={90} />
        <CustomAvatar alt="Ana" size={120} />
      </div>
    </div>
  );
};

export default TestScreen;