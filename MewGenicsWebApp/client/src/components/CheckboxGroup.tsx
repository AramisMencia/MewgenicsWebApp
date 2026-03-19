import React from "react";

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const CheckboxGroup: React.FC<Props> = ({ options, selected, onChange }) => {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;