import * as React from "react";
import ReactSelect, {
  components as reactSelectComponents,
  type Props as ReactSelectProps,
  type ClassNamesConfig,
  type SelectComponentsConfig,
  type GroupBase,
} from "react-select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export type SelectProps = Omit<
  ReactSelectProps,
  "isClearable" | "isRtl" | "unstyled" | "menuPlacement" | "hideSelectedOptions"
>;

const classNames: ClassNamesConfig = {
  container: () =>
    "rounded-lg border px-4 border-light-gray text-dark-gray focus-within:border-neutral-gray focus-within:ring-2 focus-within:ring-dark-gray/20 hover:border-neutral-gray cursor-text",
  input: () =>
    "pr-4 cursor-text text-paragraph-2 mobile:text-paragraph-1 tablet:text-paragraph-1 text-black",
  singleValue: () =>
    "text-paragraph-2 mobile:text-paragraph-1 tablet:text-paragraph-1",
  placeholder: () =>
    "text-paragraph-2 mobile:text-paragraph-1 tablet:text-paragraph-1",
  menu: () =>
    "-ml-4 bg-white z-50 min-w-52 overflow-hidden rounded-lg border border-light-gray text-dark-gray shadow-[0_8px_24px_0_rgba(0,0,0,0.06)]",
  menuList: () => "px-0 py-2",
  valueContainer: () => "gap-2 py-2 -my-px",
  multiValue: () =>
    "h-6 px-3 min-h-6 space-x-1.5 inline-flex items-center rounded-md font-medium bg-light-gray text-medium-gray",
  multiValueLabel: () =>
    "text-paragraph-2 mobile:text-paragraph-1 tablet:text-paragraph-1",
};
const components: SelectComponentsConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  // DropdownIndicator: () => <ChevronDown className="h-5 w-5" />,
  Option: ({ className, children, ...props }) => (
    <reactSelectComponents.Option
      className={cn(
        "text-paragraph-2 selection:bg-blue hover:bg-pale-gray focus:bg-pale-gray relative !flex w-full !cursor-pointer select-none flex-nowrap items-center justify-between rounded-sm px-4 py-3 outline-none transition-colors hover:text-black focus:text-black",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        props.isSelected && !props.isMulti ? "bg-light-gray" : null,
        props.isFocused ? "bg-pale-gray" : null,
        className,
      )}
      {...props}
    >
      <span className="text-paragraph-2 tablet:text-paragraph-1 mobile:text-paragraph-1 flex-1 truncate pr-2">
        {children}
      </span>
      {props.isMulti ? (
        <Checkbox
          key={props.isSelected ? "checked" : "unchecked"} // fixes a bug with controlled input
          checked={props.isSelected}
          onClick={() => props.selectOption(props.data)}
          className="ml-auto"
        />
      ) : null}
    </reactSelectComponents.Option>
  ),
  MultiValueLabel: (props) => (
    <reactSelectComponents.MultiValueLabel {...props}>
      {props.children}
    </reactSelectComponents.MultiValueLabel>
  ),
  // MultiValueRemove: (props) => (
  //   <reactSelectComponents.MultiValueRemove {...props}>
  //     <X className="h-4 w-4" />
  //   </reactSelectComponents.MultiValueRemove>
  // ),
  LoadingMessage: (props) => (
    <div className="text-paragraph-2 text-dark-gray px-4">
      Looking for entries that match{" "}
      <strong className="font-medium">{props.selectProps.inputValue}</strong>...
    </div>
  ),
  Input: (props) => (
    <reactSelectComponents.Input {...props} aria-activedescendant={undefined} />
  ),
};

function Select(props: SelectProps) {
  const id = React.useId();
  return (
    <ReactSelect
      instanceId={id}
      closeMenuOnSelect={!props.isMulti} // overrideable
      {...props}
      classNames={classNames}
      components={components}
      hideSelectedOptions={false}
      isClearable={false}
      isRtl={false}
      menuPlacement="auto"
      unstyled
    />
  );
}

export { Select };
