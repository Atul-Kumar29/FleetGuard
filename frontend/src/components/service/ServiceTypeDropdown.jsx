export default function ServiceTypeDropdown({
  value,
  onChange,
  serviceTypes,
  serviceTypesLoading,
  serviceTypesError,
}) {
  return (
    <>
      {serviceTypesLoading && <p style={{ margin: 0, fontSize: "12px", color: "#4b5563" }}>Loading service types...</p>}
      {serviceTypesError && <p style={{ margin: 0, fontSize: "12px", color: "red" }}>{serviceTypesError}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={serviceTypesLoading}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "12px",
          border: "1px solid #CBD5E1",
          backgroundColor: "white",
          color: "#0f172a",
          fontSize: "14px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        {serviceTypes.length === 0 ? (
          <option value="" style={{ color: "#0f172a" }}>
            No service types available
          </option>
        ) : (
          <>
            <option value="" style={{ color: "#0f172a" }}>
              Select service type
            </option>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id} style={{ color: "#0f172a" }}>
                {type.service_name}
              </option>
            ))}
          </>
        )}
      </select>
    </>
  );
}
