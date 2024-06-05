import { ContactsContext } from "@/providers/ContactsContextProvider";
import { castArray, truncate } from "lodash";
import { X } from "lucide-react";
import { useContext } from "react";
import {
  ClassNamesConfig,
  GroupBase,
  RemoveValueActionMeta,
  SelectComponentsConfig,
  components as reactSelectComponents,
} from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";

const classNames: ClassNamesConfig<{
  label: string;
  value: string;
}> = {
  container: () =>
    "flex grow max-h-fit px-3 items-center rounded-md border border-input bg-white text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
  control: () => "grow", // required for input to be clickable in full width of the container
  valueContainer: () => "gap-2 max-w-96",
  placeholder: () => "p-2 text-muted-foreground",
  input: () => "p-2 cursor-text focus-visible:outline-none max-w-0", // limiting input width
  multiValue: () =>
    "max-w-64 inline-flex items-center rounded-md font-medium bg-light-gray text-medium-gray",
  singleValue: () => "",
  menu: () =>
    "-ml-4 bg-white z-50 overflow-hidden rounded-lg border border-light-gray px-2",
  menuList: () => "px-0 py-2",
  multiValueLabel: () => "",
};
const components: SelectComponentsConfig<
  { label: string; value: string },
  boolean,
  GroupBase<{ label: string; value: string }>
> = {
  DropdownIndicator: () => null,
  IndicatorsContainer: () => null,
  NoOptionsMessage: () => null,

  // Option: ({ className, children, ...props }) => (
  //   <reactSelectComponents.Option
  //     className={cn(
  //       "text-paragraph-2 selection:bg-blue hover:bg-pale-gray focus:bg-pale-gray relative !flex w-full !cursor-pointer select-none flex-nowrap items-center justify-between rounded-sm px-4 py-3 outline-none transition-colors hover:text-black focus:text-black",
  //       "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  //       props.isSelected && !props.isMulti ? "bg-light-gray" : null,
  //       props.isFocused ? "bg-pale-gray" : null,
  //       className,
  //     )}
  //     {...props}
  //   >

  //   </reactSelectComponents.Option>
  // ),
  MultiValueLabel: (props) => (
    <reactSelectComponents.MultiValueLabel {...props}>
      {props.children}
    </reactSelectComponents.MultiValueLabel>
  ),
  MultiValueRemove: (props) => (
    <reactSelectComponents.MultiValueRemove {...props}>
      <X className="h-4 w-4" />
    </reactSelectComponents.MultiValueRemove>
  ),
  LoadingMessage: (props) => (
    <div>
      Searching for <strong>{truncate(props.selectProps.inputValue)}</strong>
    </div>
  ),
  Input: (props) => (
    <reactSelectComponents.Input {...props} aria-activedescendant={undefined} />
  ),
};

export default function AsyncMultiSelect(props: {
  className?: string;
  placeholder: string;
  value: string[];
  onChange: (nextValue: string[]) => void;
}) {
  const { contacts, setContacts } = useContext(ContactsContext)!;

  const formatCreateLabel = (inputValue: string) => {
    return (
      <div>
        Add <strong>{truncate(inputValue)}</strong>
      </div>
    );
  };

  const promiseOptions = async (inputValue: string) => {
    const response = await fetch("/api/contacts?query=" + inputValue);
    if (!response.ok) throw new Error("Error!");

    const data = await response.json();
    const options = data.result.map((option: { email: string }) => ({
      label: option.email,
      value: option.email,
    }));

    return options;
  };

  const onRemoveValue = ({
    removedValue,
  }: RemoveValueActionMeta<{ label: string; value: string }>) => {
    setContacts(contacts.filter((c) => c !== removedValue.value));
  };

  return (
    <AsyncCreatableSelect
      cacheOptions={false}
      className={props.className}
      classNames={classNames}
      components={components}
      formatCreateLabel={formatCreateLabel}
      loadOptions={promiseOptions}
      isMulti
      onChange={(values, actionMeta) => {
        props.onChange(
          castArray(values)
            .filter((v) => !!v)
            .map((v) => v!.label),
        );
        if (actionMeta.action === "remove-value") onRemoveValue(actionMeta);
      }}
      onCreateOption={(inputValue) => {
        props.onChange([...props.value, inputValue]);
        setContacts([...contacts, inputValue]);
      }}
      placeholder={props.placeholder}
      unstyled
      value={props.value.map((v) => ({ label: v, value: v }))}
    />
  );
}
