declare module "bootstrap" {
  export class Dropdown {
    static getOrCreateInstance(element: Element): Dropdown;
  }

  export class Collapse {
    static getOrCreateInstance(element: Element): Collapse;
  }
}
