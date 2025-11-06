import Routing from "./Routing";
import { BrowserRouter } from "react-router-dom";
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
