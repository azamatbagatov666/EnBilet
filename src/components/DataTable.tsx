  "use client";

  import { useState, useMemo, useEffect, useRef } from "react";
  import type { Column } from "@/src/models/dataTable/Column";
  import Search from "@/src/components/svg/Search";

  type Props<T> = {
    data: T[];
    columns: Column<T>[];
    title?: string;
  };

  export default function DataTable<T extends object>({
    data,
    columns,
    title,
  }: Props<T>) {


    // 🔹 BASIC FILTER STATES
    const [globalSearch, setGlobalSearch] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");

    const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
    const [boolFilters, setBoolFilters] = useState<Record<string, boolean | null>>({});
    const [valueFilters, setValueFilters] = useState<Record<string, Set<string>>>({});
    const [draftValueFilters, setDraftValueFilters] = useState<Record<string, Set<string>>>({});

    
    const [dateFilters, setDateFilters] = useState<Record<string, string>>({});

    const [panelSearch, setPanelSearch] = useState<Record<string, string>>({});

    // 🔹 DATE FILTER STATES (panel)
    const [dateValueFilters, setDateValueFilters] = useState<Set<string>>(new Set());
    const [draftDateValueFilters, setDraftDateValueFilters] = useState<Set<string>>(new Set());


    // 🔹 REFS
    const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});


  const toDateParts = (value: unknown) => {
    if (!value) return null;

    // Expected: DD-MM-YYYY HH:mm
    const [datePart] = String(value).split(" ");
    const [day, month, year] = datePart.split("-").map(Number);

    if (!day || !month || !year) return null;

    return {
      year,
      month,
      day,
      key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    };
  };

  type DateTree = {
    [year: number]: {
      [month: number]: number[];
    };
  };



  useEffect(() => {
    if (!selectedFilter || selectedFilter !== dateColumn?.key) return;

    Object.entries(dateAccordionRefs.current).forEach(([key, el]) => {
      if (!el) return;

      // year accordion
      if (/^\d{4}$/.test(key)) {
        const hasChecked = getYearKeys(key).some(k =>
          draftDateValueFilters.has(k)
        );
        el.open = hasChecked;
      }

      // month accordion (YYYY-MM)
      if (/^\d{4}-\d{1,2}$/.test(key)) {
        const [year, month] = key.split("-");
        const days = dateTree[+year]?.[+month] ?? [];

        const hasChecked = days.some(day =>
          draftDateValueFilters.has(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          )
        );

        el.open = hasChecked;
      }
    });
  }, [selectedFilter]);

  const dateColumn = columns.find(c => c.filterType === "date");

  const dateTree = useMemo<DateTree>(() => {
    if (!dateColumn) return {};

    const tree: DateTree = {};

    data.forEach((row) => {
      const parts = toDateParts(row[dateColumn.key]);
      if (!parts) return;

      const { year, month, day } = parts;

      tree[year] ??= {};
      tree[year][month] ??= [];

      if (!tree[year][month].includes(day)) {
        tree[year][month].push(day);
      }
    });

    Object.values(tree).forEach(months =>
      Object.values(months).forEach(days => days.sort((a, b) => a - b))
    );

    return tree;
  }, [data, dateColumn]);

    const handleSelectAll = (colKey: string, values: string[] = []) => {
      setDraftValueFilters((prev) => ({
        ...prev,
        [colKey]: new Set<string>(values),
      }));
    };

    const dateAccordionRefs = useRef<Record<string, HTMLDetailsElement | null>>({});

    const ref = useRef<HTMLDivElement | null>(null);




  const clearAllFilters = () => {
    setGlobalSearch("");
    setColumnSearch({});
    setBoolFilters({});
    setValueFilters({});
    setDraftValueFilters({});
    setDateFilters({});
    setDateValueFilters(new Set());
    setDraftDateValueFilters(new Set());
    setPanelSearch({});
    setSelectedFilter("");
  };

  const getAllDateKeys = () => {
    const keys: string[] = [];

    Object.entries(dateTree).forEach(([year, months]) => {
      Object.entries(months).forEach(([month, days]) => {
        days.forEach((day) => {
          keys.push(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          );
        });
      });
    });

    return keys;
  };

  const getDayKey = (year: string, month: string, day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getMonthKeys = (year: string, month: string, days: number[]) =>
    days.map((day) => getDayKey(year, month, day));

  const getYearKeys = (year: string) =>
    Object.entries(dateTree[+year]).flatMap(([month, days]) =>
      getMonthKeys(year, month, days)
    );

    const isMonthChecked = (year: string, month: string, days: number[]) =>
    days.every((day) =>
      draftDateValueFilters.has(getDayKey(year, month, day))
    );

  const isYearChecked = (year: string) =>
    getYearKeys(year).every((key) =>
      draftDateValueFilters.has(key)
    );

  const allDateKeys = useMemo(getAllDateKeys, [dateTree]);

  const isAllDatesSelected =
    allDateKeys.length > 0 &&
    allDateKeys.every((k) => draftDateValueFilters.has(k));


const handleFilter = (key: string) => {
  setSelectedFilter((prev) => {
    if (prev === key) return "";

    if (key === dateColumn?.key) {
      // ✅ sync draft with saved when opening
      setDraftDateValueFilters(new Set(dateValueFilters));
    }

    return key;
  });
};


    const uniqueColumnValues = useMemo(() => {
      const map: Record<string, string[]> = {};

      columns.forEach((col) => {
        map[col.key as string] = Array.from(
          new Set(data.map((row) => String(row[col.key] ?? ""))),
        );
      });

      return map;
    }, [columns, data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {

      // 🔍 GLOBAL SEARCH
      if (
        globalSearch &&
        !columns.some(col =>
          String(row[col.key] ?? "")
            .toLowerCase()
            .includes(globalSearch.toLowerCase())
        )
      ) return false;

      // 📅 DATE PANEL FILTER
      if (dateValueFilters.size > 0 && dateColumn) {
        const key = toDateParts(row[dateColumn.key])?.key;
        if (!key || !dateValueFilters.has(key)) return false;
      }

      // ✅ BOOLEAN FILTERS
      for (const [key, value] of Object.entries(boolFilters)) {
        if (value == null) continue;
        if (row[key as keyof T] !== value) return false;
      }

      // 📦 MULTI VALUE FILTERS
      for (const [key, values] of Object.entries(valueFilters)) {
        if (!values || values.size === 0) continue;
        if (!values.has(String(row[key as keyof T]))) return false;
      }

      return true;
    });
  }, [data, columns, globalSearch, boolFilters, valueFilters, dateValueFilters, dateColumn]);



    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node;

        // 1️⃣ Click inside panel → ignore
        if (ref.current?.contains(target)) return;

        // 2️⃣ Click on ANY filter button → ignore
        const clickedButton = Object.values(filterButtonRefs.current).some(
          (btn) => btn?.contains(target),
        );

        if (clickedButton) return;

        // 3️⃣ Real outside click → close
        setSelectedFilter("");
      };

      window.addEventListener("mousedown", handleOutsideClick);
      return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
      <>
        {/* Search */}
        <div className=" my-8">
          <div className="flex justify-center  ">
            <div className=" ">
              <div className="grid grid-flow-col grid-cols-3  bg-gray-300 border-2 border-b-0 border-black p-2">
                <div></div>
            <div className="flex justify-center text-3xl font-bold "> <span className="   dark:text-white duration-150"> {title}</span></div>
                <div className="flex justify-end">
              
                  <label className="flex gap-1 input input-sm h-9 w-64 !outline-none ">
                    <div className="flex justify-center items-center">
                      <Search></Search>
                    </div>
                    <input
                      className="font-bold !outline-none"
                      placeholder="Genel arama"
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                    <div className="size-7 self-center">
                      {globalSearch != "" && (
                        <button onClick={() => setGlobalSearch("")}>
                          <svg
                            fill="#000000"
                            className="size-7"
                            viewBox="0 0 32 32"
                            version="1.1"
                          >
                            <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              {/* Table */}
              <div className="flex justify-center">
                <table className="table table-auto table-zebra border-2 border-black dark:border-white">
                  <thead>
                    <tr className="bg-gray-300 font-bold text-lg text-black">
                      {columns.map((col) => (
                        <th key={String(col.key)}>
                          <div className="inline-flex items-center relative">
                            <span>{col.label}</span>
                            {col.filterType != "none" && (
                              <>
                                <button
                                  className="ml-1"
                                  onClick={() => {
                                    handleFilter(col.key.toString());
                                  }}
                                  ref={(el) => {
                                    filterButtonRefs.current[col.key as string] =
                                      el;
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className={`size-6  ${selectedFilter == col.key ? "fill-black" : "fill-gray-400"}`}
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V6.17157C22 6.96722 21.6839 7.73028 21.1213 8.29289L15.2929 14.1213C15.1054 14.3089 15 14.5632 15 14.8284V17.1716C15 17.9672 14.6839 18.7303 14.1213 19.2929L11.9193 21.4949C10.842 22.5722 9 21.8092 9 20.2857V14.8284C9 14.5632 8.89464 14.3089 8.70711 14.1213L2.87868 8.29289C2.31607 7.73028 2 6.96722 2 6.17157V5Z"
                                    ></path>
                                  </svg>
                                </button>
                                {selectedFilter == col.key && (
                                  <div className="" ref={ref}>
                                    <div className="absolute left-full top-full z-50  bg-gray-200 rounded-md pt-2 p-1 border-black border">
                                    {col.filterType != "date" ?      <div>
                                      {col.searchable && (
                           <label className="flex gap-1 mb-2 input input-xs !outline-none ">
                              <div className="flex justify-center items-center">
                                <Search></Search>
                              </div>
                             <input
                                          className=" !outline-none"
                                          placeholder="Ara"
                                          value={
                                            panelSearch[col.key as string] ?? ""
                                          }
                                          onChange={(e) =>
                                            setPanelSearch((prev) => ({
                                              ...prev,
                                              [col.key as string]: e.target.value,
                                            }))
                                          }
                                        />
                              <div className="size-5 self-center">
                                {panelSearch[col.key as string] !== "" &&
                                  panelSearch[col.key as string] != null && (
                                    <button
                                          onClick={() =>
                                            setPanelSearch((prev) => ({
                                              ...prev,
                                              [col.key as string]: "",
                                            }))
                                          }
                                    >
                                      <svg
                                        fill="#000000"
                                        className="size-5"
                                        viewBox="0 0 32 32"
                                        version="1.1"
                                      >
                                        <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path>
                                      </svg>
                                    </button>
                                  )}
                              </div>
                            </label>




                                      )}
                                      <div className="max-h-40 min-w-40 overflow-y-auto  pr-1  ">
                                        {!Boolean(
                                          panelSearch[col.key as string],
                                        ) && (
                                          <label className="flex items-center border-b border-gray-500 p-1 gap-2 text-sm">
                                            <input
                                              type="checkbox"
                                              className="checkbox checkbox-sm"
                                              checked={
                                                draftValueFilters[
                                                  col.key as string
                                                ]?.size ===
                                                uniqueColumnValues[
                                                  col.key as string
                                                ]?.length
                                              }
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  handleSelectAll(
                                                    col.key as string,
                                                    uniqueColumnValues[
                                                      col.key as string
                                                    ],
                                                  );
                                                } else {
                                                  setDraftValueFilters(
                                                    (prev) => ({
                                                      ...prev,
                                                      [col.key as string]:
                                                        new Set<string>(),
                                                    }),
                                                  );
                                                }
                                              }}
                                            />
                                            <span>Hepsini Seç</span>
                                          </label>
                                        )}
                                        {uniqueColumnValues[col.key as string]
                                          ?.filter((value) =>
                                            value
                                              .toLowerCase()
                                              .includes(
                                                (
                                                  panelSearch[
                                                    col.key as string
                                                  ] ?? ""
                                                ).toLowerCase(),
                                              ),
                                          )
                                          .map((value) => (
                                            <label
                                              className="flex items-center border-b border-gray-500 p-1 gap-2 text-sm last:border-b-0"
                                              key={value}
                                            >
                                              <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                                checked={
                                                  draftValueFilters[
                                                    col.key as string
                                                  ]?.has(value) ?? false
                                                }
                                                onChange={(e) =>
                                                  setDraftValueFilters((prev) => {
                                                    const next = new Set(
                                                      prev[col.key as string] ??
                                                        [],
                                                    );

                                                    e.target.checked
                                                      ? next.add(value)
                                                      : next.delete(value);

                                                    return {
                                                      ...prev,
                                                      [col.key]: next,
                                                    };
                                                  })
                                                }
                                              />
                                              <span>
                                                {value == "false" &&
                                                !col.searchable
                                                  ? "Hayır"
                                                  : value == "true" &&
                                                      !col.searchable
                                                    ? "Evet"
                                                    : value}
                                              </span>
                                            </label>
                                          ))}
                                      </div>
                                      <div className="flex justify-around mt-2">
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() => {
                                            setValueFilters((prev) => ({
                                              ...prev,
                                              [col.key as string]:
                                                draftValueFilters[
                                                  col.key as string
                                                ] ?? new Set(),
                                            }));
                                            setSelectedFilter("");
                                          }}
                                        >
                                          Kaydet
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedFilter("");
                                          }}
                                          className="btn btn-sm btn-error"
                                        >
                                          İptal
                                        </button>
                                      </div>
                                    </div>:
                                  
                                  
                                      <div>

                                      <div className="max-h-40 min-w-40 overflow-y-auto  pr-1  ">
                              
  <label className="flex items-center border-b border-gray-500 p-1 gap-2 text-sm">
    <input
      type="checkbox"
      className="checkbox checkbox-sm"
      checked={isAllDatesSelected}
      onChange={(e) => {
        setDraftDateValueFilters(
          e.target.checked ? new Set(allDateKeys) : new Set()
        );
      }}
    />
    <span>Hepsini Seç</span>
  </label>
                                          {col.filterType === "date" && (
    <div className="max-h-64 min-w-48  text-sm">
      {Object.entries(dateTree).map(([year, months]) => (
  <details
    key={year}
    ref={(el) => {
      dateAccordionRefs.current[String(year)] = el;
    }}
    className="mb-1"
  >
  <summary className="cursor-pointer list-item list-inside pl-1">
    <div className="inline-flex items-center mt-1 gap-2 translate-y-[5px]">
    <input
        type="checkbox"
        className="checkbox checkbox-sm"
        onClick={(e) => e.stopPropagation()}
        checked={isYearChecked(year)}
        onChange={(e) => {
          setDraftDateValueFilters((prev) => {
            const next = new Set(prev);
            const keys = getYearKeys(year);

            e.target.checked
              ? keys.forEach((k) => next.add(k))
              : keys.forEach((k) => next.delete(k));

            return next;
          });
        }}
      />
      <span>{year}</span>
      </div>
    </summary>
    

          <div className="ml-3">
            {Object.entries(months).map(([month, days]) => (
            <details
    key={month}
    ref={(el) => {
      dateAccordionRefs.current[`${year}-${month}`] = el;
    }}
    className="ml-3 mb-1"
  >
  <summary className="cursor-pointer list-item list-inside pl-1">
    <div className="inline-flex items-center mt-1 gap-2 translate-y-[5px]">
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        onClick={(e) => e.stopPropagation()}
        checked={isMonthChecked(year, month, days)}
        onChange={(e) => {
          setDraftDateValueFilters((prev) => {
            const next = new Set(prev);
            const keys = getMonthKeys(year, month, days);

            e.target.checked
              ? keys.forEach((k) => next.add(k))
              : keys.forEach((k) => next.delete(k));

            return next;
          });
        }}
      />
      <span>
        {new Date(+year, +month - 1).toLocaleString("tr", { month: "long" })}
      </span>
      </div>
    </summary>

                <div className="ml-10 mt-1 space-y-2">
                  {days.map((day) => {
                    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    return (
                      <label key={key} className="flex items-center gap-2 translate-y-[5px]">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
  checked={draftDateValueFilters.has(key)}
  onChange={(e) => {
    setDraftDateValueFilters((prev) => {
      const next = new Set(prev);
      e.target.checked ? next.add(key) : next.delete(key);
      return next;
    });
  }}
                        />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  )}
                                      
                        
                                      </div>
                                      <div className="flex justify-around mt-2">
  <button
    className="btn btn-sm btn-success"
    onClick={() => {
      setDateValueFilters(new Set(draftDateValueFilters));
      setSelectedFilter("");
    }}
  >
    Kaydet
  </button>
                                        <button
                                          onClick={() => {
                                            setSelectedFilter("");
                                          }}
                                          className="btn btn-sm btn-error"
                                        >
                                          İptal
                                        </button>
                                      </div>
                                    </div>
                                  
                                  
                                  }
                                
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-300">
                      {columns.map((col) => (
                        <th key={String(col.key)}>
                          {col.searchable && (
                            <label className="flex gap-1 input input-sm h-9 !outline-none ">
                              <div className="flex justify-center items-center">
                                <Search></Search>
                              </div>
                              <input
                                className=" !outline-none "
                                placeholder="Ara"
                                value={columnSearch[col.key as string] ?? ""}
                                onChange={(e) =>
                                  setColumnSearch((prev) => ({
                                    ...prev,
                                    [col.key]: e.target.value,
                                  }))
                                }
                              />
                              <div className="size-7 self-center">
                                {columnSearch[col.key as string] !== "" &&
                                  columnSearch[col.key as string] != null && (
                                    <button
                                      onClick={() =>
                                        setColumnSearch((prev) => ({
                                          ...prev,
                                          [col.key]: "",
                                        }))
                                      }
                                    >
                                      <svg
                                        fill="#000000"
                                        className="size-7"
                                        viewBox="0 0 32 32"
                                        version="1.1"
                                      >
                                        <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path>
                                      </svg>
                                    </button>
                                  )}
                              </div>
                            </label>
                          )}

                          {col.filterType === "boolean" && (
                            <label className="flex justify-between h-9 input input-sm !outline-none ">
                              <select
                                className="!outline-none"
                                value={
                                  boolFilters[col.key as string] === null ||
                                  boolFilters[col.key as string] === undefined
                                    ? ""
                                    : String(boolFilters[col.key as string])
                                }
                                onChange={(e) =>
                                  setBoolFilters((prev) => ({
                                    ...prev,
                                    [col.key]:
                                      e.target.value === ""
                                        ? null
                                        : e.target.value === "true",
                                  }))
                                }
                              >
                                <option value="">Hepsi</option>
                                <option value="true">Evet</option>
                                <option value="false">Hayır</option>
                              </select>
                              <div className="size-7 self-center">
                                {boolFilters[col.key as string] !== null &&
                                  boolFilters[col.key as string] !==
                                    undefined && (
                                    <button
                                      onClick={() =>
                                        setBoolFilters((prev) => ({
                                          ...prev,
                                          [col.key as string]: null,
                                        }))
                                      }
                                    >
                                      <svg
                                        fill="#000000"
                                        className="size-7"
                                        viewBox="0 0 32 32"
                                        version="1.1"
                                      >
                                        <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path>
                                      </svg>
                                    </button>
                                  )}
                              </div>
                            </label>
                          )}

                          {col.filterType === "date" && (
                            <label className="flex  input input-sm !outline-none ">
                              <input
                                className="!outline-none w"
                                type="date"
                                value={dateFilters[col.key as string] ?? ""}
                                onChange={(e) =>
                                  setDateFilters((prev) => ({
                                    ...prev,
                                    [col.key as string]: e.target.value,
                                  }))
                                }
                              />

                              <div className="size-7 self-center">
                                {Boolean(dateFilters[col.key as string]) && (
                                  <button
                                    onClick={() =>
                                      setDateFilters((prev) => ({
                                        ...prev,
                                        [col.key as string]: "",
                                      }))
                                    }
                                  >
                                    <svg
                                      fill="#000000"
                                      className="size-7"
                                      viewBox="0 0 32 32"
                                      version="1.1"
                                    >
                                      <path d="M16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.961 12.209c0.244-0.244 0.244-0.641 0-0.885l-1.328-1.327c-0.244-0.244-0.641-0.244-0.885 0l-3.761 3.761-3.761-3.761c-0.244-0.244-0.641-0.244-0.885 0l-1.328 1.327c-0.244 0.244-0.244 0.641 0 0.885l3.762 3.762-3.762 3.76c-0.244 0.244-0.244 0.641 0 0.885l1.328 1.328c0.244 0.244 0.641 0.244 0.885 0l3.761-3.762 3.761 3.762c0.244 0.244 0.641 0.244 0.885 0l1.328-1.328c0.244-0.244 0.244-0.641 0-0.885l-3.762-3.76 3.762-3.762z"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </label>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td key={String(col.key)}>
                            {col.render ? (
                              <div className="flex justify-center">
                                {col.render(row)}
                              </div>
                            ) : col.filterType === "boolean" ? (
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(row[col.key])}
                                  readOnly
                                  className="checkbox checkbox-success cursor-default"
                                />
                              </div>
                            ) : (
                              String(row[col.key] ?? "")
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {filteredData.length === 0 && (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center py-6 text-gray-500"
                        >
                          Sonuç bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end bg-gray-300 border-2 border-t-0 border-black p-2">
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => {
                    clearAllFilters();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-[30px]">
                    <path
                      d="M15 15L21 21M21 15L15 21M10 21V14.6627C10 14.4182 10 14.2959 9.97237 14.1808C9.94787 14.0787 9.90747 13.9812 9.85264 13.8917C9.7908 13.7908 9.70432 13.7043 9.53137 13.5314L3.46863 7.46863C3.29568 7.29568 3.2092 7.2092 3.14736 7.10828C3.09253 7.01881 3.05213 6.92127 3.02763 6.81923C3 6.70414 3 6.58185 3 6.33726V4.6C3 4.03995 3 3.75992 3.10899 3.54601C3.20487 3.35785 3.35785 3.20487 3.54601 3.10899C3.75992 3 4.03995 3 4.6 3H19.4C19.9601 3 20.2401 3 20.454 3.10899C20.6422 3.20487 20.7951 3.35785 20.891 3.54601C21 3.75992 21 4.03995 21 4.6V6.33726C21 6.58185 21 6.70414 20.9724 6.81923C20.9479 6.92127 20.9075 7.01881 20.8526 7.10828C20.7908 7.2092 20.7043 7.29568 20.5314 7.46863L17 11"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <span>Filtreleri Temizle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
