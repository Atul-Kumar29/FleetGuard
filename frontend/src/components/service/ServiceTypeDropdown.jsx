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
      >
        {serviceTypes.length === 0 ? (
          <option value="">No service types available</option>
        ) : (
          <>
            <option value="">Select service type</option>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.service_name}
              </option>
            ))}
          </>
        )}
      </select>
    </>
  );
}
