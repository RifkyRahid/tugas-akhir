type Props = {
  name: string;
  role: string;
};

export default function UserInfoCard({ name, role }: Props) {
  return (
    <div
      style={{
        border: "2px solid #facc15",
        padding: "12px 16px",
        borderRadius: "12px",
        backgroundColor: "#f0f9ff",
        minWidth: 220,
      }}
    >
      <h4 style={{ color: "#1e40af", marginBottom: 4 }}>Info Pengguna</h4>
      <p style={{ margin: 0 }}>
        <strong>{name}</strong>
      </p>
      <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{role}</p>
    </div>
  );
}
