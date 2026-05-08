import { RouterProvider } from "react-router"
import { appRouter } from "./app.routes"

const App = () => {


  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  )
}

export default App