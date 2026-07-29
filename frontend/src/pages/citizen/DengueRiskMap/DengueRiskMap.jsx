import { useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import SearchBar from "../../../components/common/SearchBar";
import { Select } from "../../../components/common/Field";
import RiskMap from "../../../components/maps/RiskMap";
import AreaRiskList from "../../../components/maps/AreaRiskList";
import { AREAS } from "../../../utils/constants";
import { matchesQuery } from "../../../utils/helpers";

const RISK_OPTIONS = [
  { value: "all", label: "All risk levels" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export default function DengueRiskMap() {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");

  const areas = useMemo(
    () =>
      AREAS.filter(
        (area) =>
          matchesQuery(area, query, ["name", "phi"]) &&
          (risk === "all" || area.risk === risk),
      ),
    [query, risk],
  );

  return (
    <>
      <PageHeader
        title="Dengue Risk Map"
        description="Live risk zones and reported breeding sites in your city."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search location…"
          className="flex-1 sm:max-w-sm"
        />
        <Select
          className="h-10 w-44"
          value={risk}
          onChange={(event) => setRisk(event.target.value)}
          options={RISK_OPTIONS}
        />
      </div>

      <RiskMap areas={areas} />

      <AreaRiskList areas={areas} className="mt-6 sm:grid-cols-2 lg:grid-cols-3" />
    </>
  );
}
