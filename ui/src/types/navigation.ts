export interface PageInfo {
  path: string;
  title: string;
}

export interface RoutePageInfo extends PageInfo {
  element: React.ReactElement;
}

export interface NavigationProps {
  pages: PageInfo[];
}