export default function ServiceFilters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onRefresh,
}) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        style={{ padding: "8px", minWidth: "180px", borderRadius: "6px", border: "1px solid #ccc" }}
      />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
      >
        <option value="all">All</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Due">Due</option>
        <option value="Overdue">Overdue</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
      >
        <option value="due_date">Due Date</option>
        <option value="mileage">Mileage</option>
      </select>

      <button
        onClick={onRefresh}
        style={{ padding: "8px 14px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}
      >
        Refresh
      </button>
    </div>
  );
}
