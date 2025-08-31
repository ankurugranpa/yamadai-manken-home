import { useState } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { createPortal } from 'react-dom';
import { Root } from '../app/Root'
import { Footer } from '../componets/Footer';

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
          element: <div className="h-full flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-900">ホーム</h1></div>
        },
        {
          path: "about",
          element: <div className="h-full flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-900">概要</h1></div>
        }
      ]
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App