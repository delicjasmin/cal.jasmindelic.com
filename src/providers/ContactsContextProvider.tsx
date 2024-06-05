import React, { createContext, ReactNode, useState } from "react";

interface ContextProps {
  contacts: string[];
  setContacts: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ContactsContext = createContext<ContextProps | undefined>(
  undefined,
);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<string[]>([]);

  return (
    <ContactsContext.Provider value={{ contacts, setContacts }}>
      {children}
    </ContactsContext.Provider>
  );
};
