export interface MenuItemType {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: MenuItemType[];
}

export interface MenuProps {
  items: MenuItemType[];
  onSelect?: (id: string) => void;
}

export interface MenuItemProps extends MenuItemType {
  onSelect?: (id: string) => void;
}

export interface SubMenuProps {
  label: string;
  icon?: string;
  children: MenuItemType[];
  onSelect?: (id: string) => void;
}
