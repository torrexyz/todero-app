import { useState } from "react";

//====================//

const parseSublist = (sublist) => {
  if (!sublist) return [];

  const parsed = typeof sublist === "string" ? JSON.parse(sublist) : sublist;

  return parsed.map((item) => ({
    id: item.id || crypto.randomUUID(),
    isChecked: item.isChecked || false,
    subtitle: item.subtitle || "",
  }));
};

//====================//

export function useSublistData(currentTask) {
  //..........//

  const [sublistData, setSublistData] = useState(() =>
    parseSublist(currentTask?.sublist),
  );

  //..........//

  const addItem = (subtitle) => {
    if (!subtitle.trim()) return sublistData;

    const newSublist = [
      ...sublistData,
      {
        id: crypto.randomUUID(),
        isChecked: false,
        subtitle: subtitle.trim(),
      },
    ];
    setSublistData(newSublist);
    return newSublist;
  };

  const removeItem = (itemId) => {
    const newSublist = sublistData.filter((item) => item.id !== itemId);
    setSublistData(newSublist);
    return newSublist;
  };

  const updateItem = (itemId, updates) => {
    const newSublist = sublistData.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item,
    );
    setSublistData(newSublist);
    return newSublist;
  };

  const restoreItems = () => {
    setSublistData(parseSublist(currentTask?.sublist));
  };

  //..........//

  return {
    sublistData,
    setSublistData,
    restoreItems,

    addItem,
    removeItem,
    updateItem,
  };

  //..........//
}
