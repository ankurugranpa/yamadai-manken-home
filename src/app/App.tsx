import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { Root } from '../app/Root'
import { Home } from '../pages/Home';
import { About } from '../pages/About';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          index: true,
          element: <Navigate to="/home" replace />
        },
        {
          path: "home",
          element: <Home />
        },
        {
          path: "about",
          element: <About />
        }
      ]
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App