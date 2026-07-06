# Client — Data Visualization (Charts)

## Page: `charts/page.tsx`

A dedicated analytics page showing visual insights into task status distribution.

---

## Chart Types

### 1. Donut (Pie) Chart
- Uses `recharts` `<PieChart>` + `<Pie>` with `innerRadius="40%"` and `outerRadius="70%"`.
- Center label shows total task count (custom `renderCenterLabel`).
- Cells colored per status: Pending (`#3b82f6`), In Progress (`#60a5fa`), Completed (`#93c5fd`).

### 2. Bar Chart
- Uses `recharts` `<BarChart>` + `<Bar>` with rounded top radius.
- Same color scheme as donut chart.
- Responsive sizing via `<ResponsiveContainer>`.

---

## Data Flow

1. `useEffect` fetches all tasks via `GET /tasks` when `user` is present.
2. `useMemo` filters tasks based on selected time range:
   - `"all"` — no filter
   - `"3months"` — `createdAt >= 3 months ago`
   - `"1month"` — `createdAt >= 1 month ago`
3. `useMemo` aggregates into `chartData`:
   ```typescript
   { name: "Pending", value: 5, status: "pending" }
   { name: "In Progress", value: 3, status: "inprogress" }
   { name: "Completed", value: 8, status: "completed" }
   ```

---

## Filter Dropdown

```tsx
<select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
  <option value="all">Full Dataset</option>
  <option value="3months">Last 3 Months</option>
  <option value="1month">Last Month</option>
</select>
```

- Styled with `bg-[#1e293b]` dark theme.
- Changing the filter key forces Recharts to re-animate (`key={filter}`).

---

## Custom Components

### CustomTooltip
```tsx
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartPayload;
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg text-white">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-sm">{data.value}</p>
      </div>
    );
  }
  return null;
};
```

### Center Label (Donut)
```tsx
const renderCenterLabel = (props: PieLabelRenderProps) => {
  const { cx, cy } = props;
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
  return <text x={cx} y={cy} fill="#fff" textAnchor="middle" dominantBaseline="middle"
    fontSize={16} fontWeight={700}>{`Total: ${total}`}</text>;
};
```

---

## Layout
- Two-column on large screens (`flex flex-col lg:flex-row`), stacked on mobile.
- Both charts have equal flex (`flex-1`), contained in `bg-[#151d27] rounded-3xl` cards.
- Full height via `h-[70vh] min-h-[450px]`.
- Animations: `animationBegin={0}`, `animationDuration={800}`, `animationEasing="ease-out"`.

---

## States

| State      | What's shown                               |
|------------|--------------------------------------------|
| Loading    | `"Loading charts..."` centered text         |
| No user    | `"Please login to see charts"` red warning |
| No tasks   | Charts render with all values = 0           |
