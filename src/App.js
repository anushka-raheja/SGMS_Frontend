import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "./components/signup";
import SignIn from "./components/signin";
import Home from "./components/home";
import Dashboard from "./components/dashboard"
import GroupForm from "./components/groupform"
import GroupPage from "./components/grouppage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} /> 
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element= {<Dashboard/>}/>
      <Route path="/create-group" element={<GroupForm />} />
      <Route path="/groups/:groupId" element={<GroupPage />} />
    </Routes>
  </Router>
);


export default App;
